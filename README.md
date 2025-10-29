# 💰 WealthEase - AI-Powered Finance Tracker# WealthEase - Financial Management System



Smart financial management app with AI chatbot assistant. Track your income & expenses effortlessly using natural language in **Indonesian** or **English**!A modern web-based financial management application with AI-powered analytics and real-time data synchronization.



![WealthEase](https://img.shields.io/badge/AI-Powered-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5-orange)## 🚀 Features



## ✨ Features- **Dashboard**: Comprehensive financial overview with transaction management

- **Analytics Dashboard**: Interactive charts and financial insights

### 🤖 AI Chatbot Assistant- **Real-time Sync**: Data synchronization between dashboard and analytics

- **Bilingual Support**: Indonesian & English- **AI Finance**: AI-powered financial forecasting and insights

- **Natural Language Processing**: Just chat normally!- **Smart Bill Management**: Automated bill tracking and reminders

- **Multiple Transactions**: Add 2+ transactions at once- **Google OAuth**: Secure authentication system

- **Smart Detection**: Understands casual language

## 📁 Project Structure

**Examples:**

``````

English: "bought coffee $5 and received salary $150"WealthEase/

Indonesian: "beli kopi 5 tunai dan dapat gaji 150"├── backend/                 # Express.js backend

```│   ├── config/             # Configuration files

│   ├── controllers/        # Route controllers

### 💳 Cash & Wallet Separation│   ├── data/              # Sample data

- Track physical cash separately from digital wallet│   ├── models/            # Data models

- Filter transactions by payment method│   ├── routes/            # API routes

- Separate balance cards for cash and wallet│   └── server.js          # Main server file

- Payment badges for easy identification├── frontend/               # Frontend application

│   ├── css/               # Stylesheets

### 📊 Dashboard Features│   ├── js/                # JavaScript files

- Real-time balance tracking│   ├── analytics.html     # Analytics dashboard

- Income vs Expense overview│   ├── dashboard.html     # Main dashboard

- Cashflow visualization│   ├── index.html         # Landing page

- Recent transactions list│   └── login.html         # Login page

- Quick action buttons├── package.json           # Root package configuration

├── README.md             # This file

### 🎨 Personalization└── SETUP_GUIDE.md        # Setup instructions

- 24 cute animal avatars (🐶🐱🐼🦊🐧🦄)```

- Dark theme UI

- Customizable settings## 🛠️ Setup

- Profile management

1. **Install Dependencies**:

### 📈 Analytics   ```bash

- Transaction history   npm install

- Category breakdown   cd backend && npm install

- Monthly filtering   ```

- Visual charts

2. **Configure Environment**:

## 🚀 Quick Start   - Copy `backend/env.example` to `backend/.env`

   - Add your API keys and configuration

### Prerequisites

- Node.js v18+ 3. **Start the Application**:

- OpenAI API Key ([Get one here](https://platform.openai.com/api-keys))   ```bash

   cd backend && node server.js

### Installation   ```



1. **Clone the repository**4. **Access the Application**:

```bash   - Frontend: `http://localhost:3000`

git clone https://github.com/yourusername/wealthease.git   - API: `http://localhost:3000/api`

cd wealthease

```## 🔧 Core Components



2. **Install backend dependencies**### Backend

```bash- **Express.js Server**: Main application server

cd backend- **Analytics API**: Financial data endpoints

npm install- **Authentication**: Google OAuth integration

```- **Data Management**: Transaction storage and processing



3. **Setup environment variables**### Frontend

```bash- **Dashboard**: Main financial overview

# Copy the example file- **Analytics**: Interactive charts and insights

cp .env.example .env- **Shared Data Manager**: Real-time data synchronization

- **AI Integration**: Financial forecasting features

# Edit .env and add your OpenAI API key

OPENAI_API_KEY=your-api-key-here## 📊 Analytics Features

```

- **Pie Charts**: Expense distribution by category

4. **Start the AI server**- **Donut Charts**: Income vs expense comparison

```bash- **Real-time Updates**: Live data synchronization

node ai-server.js- **Category Breakdown**: Detailed spending analysis

```- **Savings Rate**: Financial health metrics



5. **Open the frontend**## 🔄 Data Integration

- Use Live Server extension in VS Code

- Or open `frontend/dashboard.html` in browser- **Real-time Sync**: Changes in dashboard instantly reflect in analytics

- **Cross-tab Sync**: Data synchronization across browser tabs

## 📁 Project Structure- **Event-driven**: Custom events for data updates

- **Local Storage**: Client-side data persistence

```

WealthEase/## 🎨 Design

├── backend/

│   ├── ai-server.js          # AI chatbot server- **AI Finance Theme**: Dark theme with teal accents

│   ├── .env.example          # Environment template- **Responsive Design**: Mobile-friendly interface

│   └── package.json          # Dependencies- **Modern UI**: Clean and intuitive user experience

├── frontend/- **Smooth Animations**: Enhanced user interactions

│   ├── dashboard.html        # Main dashboard

│   ├── settings.html         # Settings page## 📱 Usage

│   ├── analytics.html        # Analytics page

│   ├── css/                  # Stylesheets1. **Login**: Use Google OAuth or demo credentials

│   └── js/                   # JavaScript files2. **Dashboard**: View financial overview and add transactions

├── vercel.json               # Vercel deployment config3. **Analytics**: Access detailed financial insights

└── README.md4. **Real-time**: See instant updates across all features

```

## 🔒 Security

## 🌐 Deployment to Vercel

- **Google OAuth**: Secure authentication

1. **Push to GitHub** (if not already)- **User-specific Storage**: Isolated data per user

```bash- **CORS Protection**: Secure API endpoints

git init- **Input Validation**: Data sanitization

git add .

git commit -m "Initial commit"## 📈 Performance

git remote add origin https://github.com/yourusername/wealthease.git

git push -u origin main- **Optimized Charts**: Smooth Chart.js animations

```- **Efficient Sync**: Minimal data transfer

- **Caching**: Local storage optimization

2. **Deploy to Vercel**- **Responsive**: Fast loading times

- Go to [Vercel](https://vercel.com)

- Import your GitHub repository---

- Add Environment Variables:

  - `OPENAI_API_KEY`: Your OpenAI API key**WealthEase** - Manage your finances with ease and confidence! 💰
  - `OPENAI_MODEL`: gpt-3.5-turbo
- Deploy!

3. **Set Environment Variables in Vercel**
- Go to Project Settings → Environment Variables
- Add: `OPENAI_API_KEY` = `your-api-key-here`
- Redeploy

## 💬 Chatbot Usage

### Indonesian Examples:
```
✅ "beli kopi 5 tunai"
✅ "bayar tagihan 100 dan dapat gaji 150"
✅ "belanja groceries 50 pake cash"
✅ "nerima bonus 200 ke wallet"
```

### English Examples:
```
✅ "bought coffee $5 with cash"
✅ "paid bill $100 and got salary $150"
✅ "spend $30 on food in cash"
✅ "received bonus $200 to wallet"
```

### Supported Keywords:

**Income (Pemasukan):**
- English: salary, bonus, income, received, earned
- Indonesian: gaji, bonus, dapat, terima, pendapatan

**Expense (Pengeluaran):**
- English: bought, paid, spend, bill, purchase
- Indonesian: beli, bayar, belanja, tagihan, biaya

**Payment Methods:**
- Cash: cash, tunai, uang tunai
- Wallet: wallet, digital wallet, gopay, ovo, dana

## 🎨 Avatars

Choose from 24 cute animal avatars:
🐶 🐕 🐱 🐈 🐻 🐼 🦊 🐰 🐨 🐹 🐧 🐥 🦉 🦆 🐠 🐬 🐙 🦀 🐮 🐷 🐔 🦄 🐵 🦁 🐯 🦒

## 🔒 Security

- ✅ API keys stored in `.env` (never committed)
- ✅ Environment variables for sensitive data
- ✅ CORS protection
- ✅ Rate limiting
- ✅ Input validation

## 📝 Environment Variables

Required variables in `.env`:

```env
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
PORT=3001
NODE_ENV=production
```

## 🛠️ Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Chart.js for visualization
- Font Awesome icons
- LocalStorage for data persistence

**Backend:**
- Node.js + Express
- OpenAI API (GPT-3.5 Turbo)
- CORS middleware
- Express Rate Limit

## 📊 Features Breakdown

### Dashboard
- 6 stat cards (Balance, Cash, Wallet, Spending, Investment, Savings)
- Cashflow overview
- Recent transactions (filterable)
- Quick action buttons

### Settings
- Avatar selection (24 options)
- Account settings
- Two-factor authentication toggle
- Email notifications toggle
- Logout & Clear data

### Analytics
- Monthly filter
- Income/Expense breakdown
- Category charts
- Transaction history

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenAI for GPT API
- Font Awesome for icons
- Chart.js for visualizations

## 📧 Support

If you have any questions or issues, please open an issue on GitHub.

---

Made with ❤️ using AI-powered technology

⭐ Star this repo if you find it helpful!
