# ntwrk

A modern professional network management platform that helps you organize and maintain your relationships effectively.

## Features

### 🔄 Automatic Contact Import
Connect your email and instantly import your professional network. Works with Gmail, with Outlook support coming soon.

### 👥 Smart Groups
Automatically organize your contacts based on:
- Organizations and domains
- Interaction frequency
- Communication patterns
- Custom groupings


## Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ntwrk.git
cd ntwrk
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.


