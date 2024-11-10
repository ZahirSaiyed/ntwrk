# Contributing to ntwrk

Welcome to the ntwrk development team! This guide will help you set up your local development environment and understand our project structure.

## Project Structure

```
ntwrk/
├── src/
│   ├── app/
│   │   ├── contacts/
│   │   │   └── page.tsx         # Main contacts management view
│   │   ├── insights/
│   │   │   └── page.tsx         # Analytics and insights dashboard
│   │   ├── auth/
│   │   │   └── page.tsx         # Authentication handling
│   │   └── page.tsx             # Landing page
│   ├── components/
│   │   ├── insights/
│   │   │   ├── NetworkMap.tsx   # Network visualization
│   │   │   └── GroupMembers.tsx # Group membership display
│   │   ├── SmartInsights.tsx    # Intelligent grouping suggestions
│   │   ├── ViewToggle.tsx       # Grid/Table view switcher
│   │   ├── GroupFAB.tsx         # Group creation button
│   │   ├── GroupModal.tsx       # Group creation/edit modal
│   │   ├── StatCard.tsx         # Metric display cards
│   │   ├── SearchInput.tsx      # Contact search
│   │   ├── ContactTable.tsx     # Tabular contact view
│   │   ├── ContactDetail.tsx    # Individual contact view
│   │   ├── Pagination.tsx       # Results pagination
│   │   └── ColumnCustomizer.tsx # Table column management
│   ├── utils/
│   │   ├── networkMapHelpers.ts # Network visualization utilities
│   │   └── velocityTracking.ts  # Relationship strength calculation
│   └── types/
│       └── index.ts             # TypeScript type definitions
└── package.json
```

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- Git

## Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/your-org/ntwrk.git
cd ntwrk
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

4. Start the development server:
```bash
npm run dev
```

The app should now be running at [http://localhost:3000](http://localhost:3000)

## Development Workflow

1. **Branch Naming Convention**
   - Feature: `feature/description`
   - Bug fix: `fix/description`
   - Enhancement: `enhance/description`

2. **Commit Message Format**
   ```
   type(scope): description
   
   [optional body]
   ```
   Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

3. **Pull Request Process**
   - Create a branch from `main`
   - Make your changes
   - Submit PR with description of changes
   - Ensure tests pass
   - Request review from team members

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests (when implemented)

## Common Issues and Solutions

1. **Authentication Issues**
   - Ensure `.env.local` is properly configured
   - Check Google OAuth credentials are correct

2. **Type Errors**
   - Run `npm install` to ensure all dependencies are up to date
   - Check `src/types` directory for latest type definitions

## Next Steps

1. Review the codebase, particularly:
   - Main page implementation (src/app/page.tsx)
   - Contact management features
   - Network analytics logic

2. Set up your development environment

Remember to check our [README.md](./README.md) for additional project information and updates.