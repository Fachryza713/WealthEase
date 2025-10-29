/**
 * OpenAI Integration Backend untuk WealthEase AI Finance
 * Handles communication with OpenAI API for transaction analysis and chatbot
 * Improved chatbot functionality for transaction extraction
 */

const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting untuk OpenAI API
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: {
        error: 'Too many AI analysis requests, please try again later.'
    }
});

// Rate limiting untuk Chatbot API
const chatbotLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // limit each IP to 20 requests per windowMs
    message: {
        error: 'Too many chatbot requests, please try again later.'
    }
});

/**
 * Chatbot endpoint untuk memproses pesan pengguna dan mengekstrak data transaksi
 */
app.post('/api/ai/chatbot', chatbotLimiter, async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Pesan tidak boleh kosong'
            });
        }
        
        // Periksa API key
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'OpenAI API key tidak ditemukan'
            });
        }
        
        // Panggil OpenAI API untuk ekstraksi data transaksi
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
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
                    - "bayar mobil 15000 ke digital wallet" → {"tipe": "pengeluaran", "deskripsi": "paid for car", "jumlah": 15000, "tanggal": "${new Date().toISOString().split('T')[0]}", "paymentMethod": "wallet"}
                    - "nerima gaji 3000 tunai" → {"tipe": "pemasukan", "deskripsi": "received salary", "jumlah": 3000, "tanggal": "${new Date().toISOString().split('T')[0]}", "paymentMethod": "cash"}
                    
                    If you cannot extract transaction data, return empty JSON: {}`
                },
                { role: 'user', content: message }
            ],
            temperature: 0.3,
            max_tokens: 500
        });
        
        const responseContent = completion.choices[0].message.content;
        
        // Parse JSON dari respons
        let transactionData = {};
        try {
            // Cari JSON dalam respons
            const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                transactionData = JSON.parse(jsonMatch[0]);
            }
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
        
        // Check if multiple transactions
        if (transactionData && transactionData.transactions && Array.isArray(transactionData.transactions)) {
            // Handle multiple transactions
            const validTransactions = [];
            
            for (let trans of transactionData.transactions) {
                // Konversi jumlah ke angka jika masih string
                if (typeof trans.jumlah === 'string') {
                    trans.jumlah = parseFloat(trans.jumlah.replace(/[^0-9.-]+/g, ''));
                }
                
                // Jika tanggal tidak ada, gunakan hari ini
                if (!trans.tanggal) {
                    trans.tanggal = new Date().toISOString().split('T')[0];
                }
                
                if (trans.tipe && trans.jumlah) {
                    validTransactions.push(trans);
                }
            }
            
            if (validTransactions.length > 0) {
                // Format reply message
                let replyMessages = validTransactions.map(trans => {
                    const formattedAmount = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                    }).format(trans.jumlah);
                    return `✅ ${trans.tipe === 'pemasukan' ? 'Income' : 'Expense'}: "${trans.deskripsi}" ${formattedAmount}`;
                });
                
                return res.json({
                    success: true,
                    reply: `Recorded ${validTransactions.length} transactions:\n${replyMessages.join('\n')}`,
                    data: validTransactions,
                    multiple: true
                });
            }
        }
        
        // Periksa apakah data transaksi valid (single transaction)
        if (transactionData && transactionData.tipe && transactionData.jumlah) {
            // Konversi jumlah ke angka jika masih string
            if (typeof transactionData.jumlah === 'string') {
                transactionData.jumlah = parseFloat(transactionData.jumlah.replace(/[^0-9.-]+/g, ''));
            }
            
            // Jika tanggal tidak ada, gunakan hari ini
            if (!transactionData.tanggal) {
                transactionData.tanggal = new Date().toISOString().split('T')[0];
            }
            
            // Format currency for display
            const formattedAmount = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(transactionData.jumlah);
            
            // Kirim respons sukses dengan data transaksi
            return res.json({
                success: true,
                reply: `✅ ${transactionData.tipe === 'pemasukan' ? 'Income' : 'Expense'} recorded: "${transactionData.deskripsi}" for ${formattedAmount} on ${transactionData.tanggal}.`,
                data: transactionData
            });
        } else {
            // Kirim respons gagal
            return res.json({
                success: false,
                error: 'Sorry, I couldn\'t extract transaction data from your message. Please provide clearer details (e.g., "Bought coffee $5" or "Received salary $3,500").'
            });
        }
        
    } catch (error) {
        console.error('Chatbot error:', error);
        
        // Handle OpenAI API errors
        if (error.response) {
            const status = error.response.status;
            
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
            }
        }
        
        return res.status(500).json({
            success: false,
            error: 'An error occurred while processing your message. Please try again.'
        });
    }
});

/**
 * Format transaction data untuk OpenAI analysis
 */
function formatTransactionData(transactions, userProfile) {
    const recentTransactions = transactions.slice(-30); // Last 30 transactions
    
    // Calculate financial metrics
    const totalBalance = calculateTotalBalance(transactions);
    const monthlyIncome = calculateMonthlyIncome(transactions);
    const monthlyExpenses = calculateMonthlyExpenses(transactions);
    const spendingCategories = analyzeSpendingCategories(transactions);
    const spendingPattern = analyzeSpendingPattern(transactions);
    
    const data = {
        userProfile: {
            name: userProfile.name || 'User',
            totalBalance: totalBalance,
            monthlyIncome: monthlyIncome,
            monthlyExpenses: monthlyExpenses,
            savingsRate: monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100) : 0
        },
        transactions: recentTransactions.map(t => ({
            date: t.date,
            type: t.type,
            amount: t.amount,
            category: t.category,
            description: t.description || 'No description'
        })),
        analysis: {
            totalTransactions: transactions.length,
            averageTransactionAmount: calculateAverageTransaction(transactions),
            spendingCategories: spendingCategories,
            spendingPattern: spendingPattern,
            incomeVsExpense: monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome * 100) : 0,
            largestExpense: findLargestExpense(transactions),
            mostFrequentCategory: findMostFrequentCategory(transactions)
        }
    };
    
    return `Analyze this financial data and provide comprehensive insights:

USER PROFILE:
- Name: ${data.userProfile.name}
- Current Balance: $${data.userProfile.totalBalance.toFixed(2)}
- Monthly Income: $${data.userProfile.monthlyIncome.toFixed(2)}
- Monthly Expenses: $${data.userProfile.monthlyExpenses.toFixed(2)}
- Savings Rate: ${data.userProfile.savingsRate.toFixed(1)}%

RECENT TRANSACTIONS (Last ${data.transactions.length}):
${data.transactions.map(t => 
    `- ${t.date}: ${t.type.toUpperCase()} $${t.amount.toFixed(2)} (${t.category}) - ${t.description}`
).join('\n')}

FINANCIAL ANALYSIS:
- Total Transactions: ${data.analysis.totalTransactions}
- Average Transaction: $${data.analysis.averageTransactionAmount.toFixed(2)}
- Income vs Expense Ratio: ${data.analysis.incomeVsExpense.toFixed(1)}%
- Largest Single Expense: $${data.analysis.largestExpense.toFixed(2)}
- Most Frequent Category: ${data.analysis.mostFrequentCategory}
- Spending Pattern: ${data.analysis.spendingPattern}

SPENDING CATEGORIES BREAKDOWN:
${Object.entries(data.analysis.spendingCategories).map(([category, amount]) => 
    `- ${category}: $${amount.toFixed(2)}`
).join('\n')}

Please provide a comprehensive analysis in JSON format with these exact keys:
{
    "analysis": "Detailed analysis of spending patterns, financial health, and trends",
    "recommendations": "Specific actionable recommendations for improving financial health",
    "predictions": {
        "nextWeekBalance": estimated_balance_next_week,
        "nextMonthBalance": estimated_balance_next_month,
        "trend": "bullish/bearish/neutral",
        "summary": "Brief summary of future financial outlook"
    },
    "warnings": "Any financial warnings or red flags",
    "score": {
        "financialHealth": score_out_of_100,
        "spendingDiscipline": score_out_of_100,
        "savingsRate": score_out_of_100,
        "volatility": volatility_percentage,
        "confidence": confidence_percentage
    }
}

Focus on:
1. Spending pattern analysis and trends
2. Budget optimization recommendations
3. Financial health assessment
4. Future balance predictions based on current trends
5. Specific actionable advice for improvement
6. Risk assessment and warnings

Be specific, actionable, and provide concrete numbers for predictions.`;
}

/**
 * Calculate total balance from transactions
 */
function calculateTotalBalance(transactions) {
    return transactions.reduce((total, transaction) => {
        if (transaction.type === 'income') {
            return total + transaction.amount;
        } else {
            return total - transaction.amount;
        }
    }, 0);
}

/**
 * Calculate monthly income
 */
function calculateMonthlyIncome(transactions) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions
        .filter(t => {
            const transactionDate = new Date(t.date);
            return t.type === 'income' && 
                   transactionDate.getMonth() === currentMonth &&
                   transactionDate.getFullYear() === currentYear;
        })
        .reduce((total, t) => total + t.amount, 0);
}

/**
 * Calculate monthly expenses
 */
function calculateMonthlyExpenses(transactions) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions
        .filter(t => {
            const transactionDate = new Date(t.date);
            return t.type === 'expense' && 
                   transactionDate.getMonth() === currentMonth &&
                   transactionDate.getFullYear() === currentYear;
        })
        .reduce((total, t) => total + t.amount, 0);
}

/**
 * Analyze spending categories
 */
function analyzeSpendingCategories(transactions) {
    const categories = {};
    
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            categories[t.category] = (categories[t.category] || 0) + t.amount;
        });
    
    return categories;
}

/**
 * Analyze spending pattern
 */
function analyzeSpendingPattern(transactions) {
    const expenses = transactions.filter(t => t.type === 'expense');
    const recentExpenses = expenses.slice(-10);
    const olderExpenses = expenses.slice(-20, -10);
    
    if (recentExpenses.length === 0 || olderExpenses.length === 0) {
        return 'Insufficient data';
    }
    
    const recentAvg = recentExpenses.reduce((sum, t) => sum + t.amount, 0) / recentExpenses.length;
    const olderAvg = olderExpenses.reduce((sum, t) => sum + t.amount, 0) / olderExpenses.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (change > 10) return 'Increasing spending';
    if (change < -10) return 'Decreasing spending';
    return 'Stable spending';
}

/**
 * Calculate average transaction amount
 */
function calculateAverageTransaction(transactions) {
    if (transactions.length === 0) return 0;
    return transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length;
}

/**
 * Find largest expense
 */
function findLargestExpense(transactions) {
    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) return 0;
    return Math.max(...expenses.map(t => t.amount));
}

/**
 * Find most frequent spending category
 */
function findMostFrequentCategory(transactions) {
    const categories = {};
    
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            categories[t.category] = (categories[t.category] || 0) + 1;
        });
    
    const mostFrequent = Object.entries(categories)
        .sort(([,a], [,b]) => b - a)[0];
    
    return mostFrequent ? mostFrequent[0] : 'No data';
}

/**
 * Parse AI response and validate JSON
 */
function parseAIResponse(response) {
    try {
        // Extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in response');
        }
        
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate required fields
        const requiredFields = ['analysis', 'recommendations', 'predictions', 'warnings', 'score'];
        for (const field of requiredFields) {
            if (!parsed[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        
        return parsed;
    } catch (error) {
        console.error('Error parsing AI response:', error);
        
        // Return fallback response
        return {
            analysis: "Unable to parse AI response. Please try again.",
            recommendations: "Check your transaction data and try the analysis again.",
            predictions: {
                nextWeekBalance: 0,
                nextMonthBalance: 0,
                trend: "neutral",
                summary: "Unable to generate predictions"
            },
            warnings: "AI analysis failed. Please verify your data.",
            score: {
                financialHealth: 50,
                spendingDiscipline: 50,
                savingsRate: 50,
                volatility: 0,
                confidence: 0
            }
        };
    }
}

/**
 * Main AI analysis endpoint
 */
router.post('/analyze-transactions', aiLimiter, async (req, res) => {
    try {
        const { transactions, userProfile } = req.body;
        
        // Validate input
        if (!transactions || !Array.isArray(transactions)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid transactions data'
            });
        }
        
        if (transactions.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No transactions to analyze'
            });
        }
        
        // Check OpenAI API key
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'OpenAI API key not configured'
            });
        }
        
        // Format data for OpenAI
        const analysisPrompt = formatTransactionData(transactions, userProfile);
        
        console.log('Sending request to OpenAI...');
        
        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a professional financial advisor AI. Analyze transaction data and provide detailed, actionable insights. Always respond with valid JSON format as requested."
                },
                {
                    role: "user",
                    content: analysisPrompt
                }
            ],
            max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1500,
            temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7
        });
        
        const aiResponse = completion.choices[0].message.content;
        console.log('OpenAI Response received');
        
        // Parse and validate response
        const analysis = parseAIResponse(aiResponse);
        
        // Log successful analysis
        console.log('AI Analysis completed successfully');
        
        res.json({
            success: true,
            analysis: analysis,
            rawResponse: aiResponse,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('OpenAI API Error:', error);
        
        // Handle specific OpenAI errors
        if (error.code === 'insufficient_quota') {
            return res.status(429).json({
                success: false,
                error: 'OpenAI API quota exceeded. Please try again later.'
            });
        }
        
        if (error.code === 'invalid_api_key') {
            return res.status(401).json({
                success: false,
                error: 'Invalid OpenAI API key'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Failed to analyze transactions',
            details: error.message
        });
    }
});

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        openaiConfigured: !!process.env.OPENAI_API_KEY
    });
});

/**
 * Test endpoint for development
 */
router.post('/test', async (req, res) => {
    try {
        const testPrompt = "Respond with: 'OpenAI integration is working correctly'";
        
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: testPrompt
                }
            ],
            max_tokens: 50
        });
        
        res.json({
            success: true,
            message: completion.choices[0].message.content,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Apply routes
/**
 * Chatbot endpoint untuk mengekstrak data transaksi dari pesan user
 */
router.post('/chatbot', chatbotLimiter, async (req, res) => {
    try {
        const { message } = req.body;
        
        // Validate input
        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }
        
        // Check OpenAI API key
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'OpenAI API key not configured'
            });
        }
        
        console.log('Sending request to OpenAI for chatbot...');
        
        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "Kamu adalah asisten keuangan. Ekstrak data transaksi dari kalimat user, lalu kembalikan JSON berisi tipe (pemasukan/pengeluaran), deskripsi, jumlah, dan tanggal. Tanggal default adalah hari ini jika tidak disebutkan. Format JSON: {\"tipe\": \"pemasukan/pengeluaran\", \"deskripsi\": \"string\", \"jumlah\": number, \"tanggal\": \"YYYY-MM-DD\"}"
                },
                {
                    role: "user",
                    content: message
                }
            ],
            max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1500,
            temperature: 0.3
        });
        
        const aiResponse = completion.choices[0].message.content;
        console.log('OpenAI Response received for chatbot');
        
        // Parse JSON response
        let data;
        try {
            data = JSON.parse(aiResponse);
            
            // Validate required fields
            if (!data.tipe || !data.deskripsi || !data.jumlah) {
                throw new Error('Missing required fields in response');
            }
            
            // Format response
            const reply = `✅ Transaksi ${data.tipe} ${data.deskripsi} sebesar Rp${data.jumlah.toLocaleString('id-ID')} telah ditambahkan.`;
            
            res.json({
                success: true,
                data: data,
                reply: reply
            });
            
        } catch (error) {
            console.error('Failed to parse AI response:', error);
            res.status(400).json({
                success: false,
                error: 'Maaf, saya tidak bisa memahami transaksi tersebut. Bisa ulangi dengan jumlah nominalnya?',
                rawResponse: aiResponse
            });
        }
        
    } catch (error) {
        console.error('OpenAI API Error:', error);
        
        // Handle specific OpenAI errors
        if (error.code === 'insufficient_quota') {
            return res.status(429).json({
                success: false,
                error: 'OpenAI API quota exceeded. Please try again later.'
            });
        }
        
        if (error.code === 'invalid_api_key') {
            return res.status(401).json({
                success: false,
                error: 'Invalid OpenAI API key'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Failed to process message. Please try again.'
        });
    }
});

app.use('/api/ai', router);

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`WealthEase AI API server running on port ${PORT}`);
    console.log(`OpenAI API Key configured: ${!!process.env.OPENAI_API_KEY}`);
});

module.exports = app;
