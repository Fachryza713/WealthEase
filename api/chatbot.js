/**
 * Vercel Serverless Function for WealthEase Chatbot
 */

const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Resolve model from environment with safe default
const CHAT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Lightweight health check to help diagnose production issues
    if (req.method === 'GET') {
        return res.status(200).json({
            ok: true,
            service: 'wealthease-chatbot',
            timestamp: new Date().toISOString(),
            openaiConfigured: !!process.env.OPENAI_API_KEY,
            model: CHAT_MODEL
        });
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Pesan tidak boleh kosong'
            });
        }
        
        // Check API key
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'OpenAI API key tidak ditemukan'
            });
        }
        
        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: CHAT_MODEL,
            messages: [
                {
                    role: 'system',
                    content: `You are a financial assistant helping to extract transaction data from user messages.
                    You MUST understand BOTH Indonesian (Bahasa Indonesia) and English.
                    
                    Extract the following information from user messages:
                    1. Transaction type (income/expense) - detect from context
                    2. Transaction description
                    3. Amount in USD (extract numbers, handle formats like: $50, 50, 50 dollars, $1,234.56)
                    4. Transaction date (use TODAY'S DATE: ${new Date().toISOString().split('T')[0]} if not mentioned)
                    5. Payment method (cash/wallet) - detect from keywords
                    
                    BILINGUAL SUPPORT - INDONESIAN & ENGLISH:
                    
                    INCOME Keywords (Pemasukan):
                    - English: salary, bonus, income, received, earned, paid to me, gift received, got, receive, earnings
                    - Indonesian: gaji, bonus, pemasukan, terima, dapat, diterima, hadiah, dibayar, pendapatan, dapet, nerima, masuk
                    
                    EXPENSE Keywords (Pengeluaran):
                    - English: bought, buy, paid, pay, paying, spent, spend, spending, bill, purchase, cost, expense, give, gave
                    - Indonesian: beli, bayar, belanja, buat, untuk, keluar, pengeluaran, tagihan, biaya, kasih, ngasih, buat beli
                    
                    PAYMENT METHOD Detection:
                    - CASH: cash, tunai, uang tunai, uang cash, ke cash ku, pakai tunai, bayar tunai
                    - WALLET: wallet, dompet digital, gopay, ovo, dana, shopeepay, card, kartu, debit, credit, online, transfer, bank, ke wallet ku, digital wallet
                    
                    MULTIPLE TRANSACTIONS SUPPORT:
                    - User can send MULTIPLE transactions in one message
                    - Separators: "and", "dan", "also", "juga", ",", "terus", "lalu", "then"
                    - Examples: "aku bayar tagihan $100 dan dapat gaji $150"
                    - Extract EACH transaction separately
                    - Return an ARRAY of transaction objects if multiple transactions detected
                    - Return a SINGLE object if only one transaction detected
                    
                    Important rules:
                    - Remove all currency symbols and formatting ($ , commas)
                    - Convert amount to plain number (e.g., "$1,234.56" becomes 1234.56)
                    - "bayar" or "paid" without "ke aku/to me" = EXPENSE (user is paying someone)
                    - "dibayar ke aku" or "paid to me" = INCOME (someone is paying user)
                    - Default to "expense" if unclear
                    - ALWAYS use TODAY'S DATE (${new Date().toISOString().split('T')[0]}) unless date is explicitly mentioned
                    - Translate Indonesian descriptions to English in the output
                    
                    Return data in JSON format:
                    
                    FOR SINGLE TRANSACTION:
                    {
                        "tipe": "pemasukan" or "pengeluaran",
                        "deskripsi": "transaction description in English (translate if Indonesian)",
                        "jumlah": number_without_currency,
                        "tanggal": "YYYY-MM-DD" (MUST be ${new Date().toISOString().split('T')[0]} unless specified),
                        "paymentMethod": "cash" or "wallet"
                    }
                    
                    FOR MULTIPLE TRANSACTIONS:
                    {
                        "transactions": [
                            {
                                "tipe": "pemasukan" or "pengeluaran",
                                "deskripsi": "transaction description in English",
                                "jumlah": number_without_currency,
                                "tanggal": "YYYY-MM-DD",
                                "paymentMethod": "cash" or "wallet"
                            }
                        ]
                    }
                    
                    Examples (English):
                    - "Bought coffee $5 with cash" → {"tipe": "pengeluaran", "deskripsi": "Bought coffee", "jumlah": 5, "tanggal": "${new Date().toISOString().split('T')[0]}", "paymentMethod": "cash"}
                    - "i paid bill $100 and got salary $150" → {"transactions": [{"tipe": "pengeluaran", "deskripsi": "paid bill", "jumlah": 100, "tanggal": "${new Date().toISOString().split('T')[0]}", "paymentMethod": "wallet"}, {"tipe": "pemasukan", "deskripsi": "got salary", "jumlah": 150, "tanggal": "${new Date().toISOString().split('T')[0]}", "paymentMethod": "wallet"}]}
                    
                    Examples (Indonesian):
                    - "beli kopi 5 dolar pakai tunai" → {"tipe": "pengeluaran", "deskripsi": "bought coffee", "jumlah": 5, "tanggal": "${new Date().toISOString().split('T')[0]}", "paymentMethod": "cash"}
                    - "aku bayar tagihan 100 dan dapat gaji 150" → {"transactions": [{"tipe": "pengeluaran", "deskripsi": "paid bill", "jumlah": 100, "tanggal": "${new Date().toISOString().split('T')[0]}", "paymentMethod": "wallet"}, {"tipe": "pemasukan", "deskripsi": "received salary", "jumlah": 150, "tanggal": "${new Date().toISOString().split('T')[0]}", "paymentMethod": "wallet"}]}
                    - "belanja groceries 50 pake cash, terus dapet bonus 200 ke wallet" → {"transactions": [{"tipe": "pengeluaran", "deskripsi": "bought groceries", "jumlah": 50, "tanggal": "${new Date().toISOString().split('T')[0]}", "paymentMethod": "cash"}, {"tipe": "pemasukan", "deskripsi": "received bonus", "jumlah": 200, "tanggal": "${new Date().toISOString().split('T')[0]}", "paymentMethod": "wallet"}]}
                    
                    If you cannot extract transaction data, return empty JSON: {}`
                },
                { role: 'user', content: message }
            ],
            temperature: 0.3,
            max_tokens: 500
        });
        
        const responseContent = completion.choices[0].message.content;
        
        // Parse JSON from response
        let transactionData = {};
        try {
            const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                transactionData = JSON.parse(jsonMatch[0]);
            }
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
        
        // Check if multiple transactions
        if (transactionData && transactionData.transactions && Array.isArray(transactionData.transactions)) {
            const validTransactions = [];
            
            for (let trans of transactionData.transactions) {
                if (typeof trans.jumlah === 'string') {
                    trans.jumlah = parseFloat(trans.jumlah.replace(/[^0-9.-]+/g, ''));
                }
                
                if (!trans.tanggal) {
                    trans.tanggal = new Date().toISOString().split('T')[0];
                }
                
                if (trans.tipe && trans.jumlah) {
                    validTransactions.push(trans);
                }
            }
            
            if (validTransactions.length > 0) {
                let replyMessages = validTransactions.map(trans => {
                    const formattedAmount = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                    }).format(trans.jumlah);
                    return `✅ ${trans.tipe === 'pemasukan' ? 'Income' : 'Expense'}: "${trans.deskripsi}" ${formattedAmount}`;
                });
                
                return res.status(200).json({
                    success: true,
                    reply: `Recorded ${validTransactions.length} transactions:\n${replyMessages.join('\n')}`,
                    data: validTransactions,
                    multiple: true
                });
            }
        }
        
        // Single transaction
        if (transactionData && transactionData.tipe && transactionData.jumlah) {
            if (typeof transactionData.jumlah === 'string') {
                transactionData.jumlah = parseFloat(transactionData.jumlah.replace(/[^0-9.-]+/g, ''));
            }
            
            if (!transactionData.tanggal) {
                transactionData.tanggal = new Date().toISOString().split('T')[0];
            }
            
            const formattedAmount = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(transactionData.jumlah);
            
            return res.status(200).json({
                success: true,
                reply: `✅ ${transactionData.tipe === 'pemasukan' ? 'Income' : 'Expense'} recorded: "${transactionData.deskripsi}" for ${formattedAmount} on ${transactionData.tanggal}.`,
                data: transactionData
            });
        } else {
            return res.status(200).json({
                success: false,
                error: 'Sorry, I couldn\'t extract transaction data from your message. Please provide clearer details (e.g., "Bought coffee $5" or "Received salary $3,500").'
            });
        }
        
    } catch (error) {
        console.error('Chatbot error:', error);
        
        // OpenAI SDK v4 often exposes status and message directly on the error
        const status = error?.status || error?.response?.status;
        const message = error?.message || error?.response?.data?.error?.message;
        
        if (status) {
            
            if (status === 429) {
                return res.status(429).json({
                    success: false,
                    error: 'OpenAI API quota exceeded. Please try again later.'
                });
            } else if (status === 401) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid OpenAI API key.'
                });
            } else if (status === 404) {
                return res.status(400).json({
                    success: false,
                    error: `Requested model "${CHAT_MODEL}" is not available. Set OPENAI_MODEL to a model your account can access (e.g., gpt-4o-mini) and redeploy.`
                });
            }
        }
        
        return res.status(500).json({
            success: false,
            error: message || 'An error occurred while processing your message. Please try again.'
        });
    }
};
