# IGCSE Computer Science Key Terms

A React + TypeScript application for IGCSE Computer Science (0478) key terms, definitions, and revision tools.

## Architecture

This project uses a modular architecture:

- **src/modules/**: Contains feature-specific logic.
  - **core/**: Core application logic (App, routing).
  - **common/**: Shared views and logic (GenericUnitView).
  - **unit/**: Unit-specific routing and logic.
  - **qa/**: Q&A feature.
- **src/components/**: Reusable UI components.
  - **layout/**: Layout components (Sidebar, Layout).
  - **shared/**: Shared UI elements (Cards, Buttons).
- **src/data/**: Static data for units and questions.
- **src/types/**: TypeScript type definitions.

## Features

- **Key Terms**: Browse terms by unit, filtered by topic or letter.
- **Flashcards**: Review terms in flashcard mode.
- **Confusions**: Toggle to see common misconceptions and contrasts.
- **Q&A**: Practice with past paper questions (2023–2025).
- **Responsive Design**: Works on mobile and desktop.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Deployment

Deploy to Vercel:

```bash
npx vercel
```

### Fix 404 on deep links (SPA routing)
- This app uses client-side routing (`BrowserRouter`). On Vercel, add a catch-all rewrite to serve `index.html` for non-file routes.

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Redeploy:
```bash
npx vercel --prod
```
