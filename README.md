# Spirit Journal

A web3-enabled journaling platform that transforms personal documentation into intelligent learning experiences. The application provides encrypted, blockchain-verified journal entries with adaptive learning insights and Electroneum blockchain token rewards.

## Features

- 🔒 End-to-end encrypted journal entries
- 💰 Spirit Token rewards on Electroneum blockchain
- 🧠 Smart learning pattern analysis
- 📊 Adaptive learning API development
- 🎯 Personalized learning insights
- 🔗 Web3/MetaMask wallet integration

## Tech Stack

- React + TypeScript frontend
- Express.js backend
- PostgreSQL database
- Spirit Framework design system
- Web3/MetaMask integration
- Electroneum blockchain support

## Prerequisites

- Node.js (v18 or later)
- PostgreSQL database
- MetaMask wallet
- Electroneum wallet (for rewards)

## Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL=your_postgresql_database_url
PGHOST=your_db_host
PGPORT=your_db_port
PGUSER=your_db_user
PGPASSWORD=your_db_password
PGDATABASE=your_db_name
ANKR_API_KEY=your_ankr_api_key
```

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/ai-osas/spirit-framework.git
cd spirit-framework
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

## Project Structure

```
├── client/             # Frontend React application
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── hooks/     # Custom React hooks
│   │   ├── pages/     # Page components
│   │   └── types/     # TypeScript type definitions
├── server/            # Backend Express application
│   ├── routes.ts     # API routes
│   └── storage.ts    # Database interactions
└── shared/           # Shared code between frontend and backend
    └── schema.ts     # Database schema and types
```

## Features Documentation

### Journal Entries
- Create, edit, and view encrypted journal entries
- Automatic pattern analysis for learning insights
- Token rewards for quality contributions

### Security
- End-to-end encryption for all journal entries
- Secure MetaMask wallet integration
- Privacy-focused data analysis

### Rewards
- Spirit Token rewards on Electroneum blockchain
- Automated reward distribution
- Token balance tracking

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

MIT License