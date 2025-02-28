(.venv) Macintosh@Osarenren-Spirit-Isorae spirit-framework % tree -I "node_modules"
.
├── README.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
│   ├── 2.svg
│   ├── favico.ico
│   ├── favicon.svg
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── spirit-journal-diagram.mermaid
├── spirit-journal-system-architecture-diagram.png
├── src
│   ├── app
│   │   ├── api
│   │   │   ├── auth
│   │   │   │   └── google
│   │   │   │       ├── callback
│   │   │   │       │   └── page.tsx
│   │   │   │       └── login
│   │   │   │           └── route.ts
│   │   │   ├── chat
│   │   │   │   └── route.ts
│   │   │   ├── journal
│   │   │   │   └── entries
│   │   │   │       └── route.ts
│   │   │   └── patterns
│   │   │       └── route.ts
│   │   ├── auth
│   │   │   ├── login
│   │   │   │   └── page.tsx
│   │   │   └── register
│   │   │       └── page.tsx
│   │   ├── documentation
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── journal
│   │   │   ├── [id]
│   │   │   │   └── page.tsx
│   │   │   ├── new
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── legal
│   │   │   ├── license
│   │   │   │   └── page.tsx
│   │   │   ├── privacy-policy
│   │   │   │   └── page.tsx
│   │   │   └── terms
│   │   │       └── page.tsx
│   │   └── page.tsx
│   ├── components
│   │   ├── ChatDialog.tsx
│   │   ├── Footer.tsx
│   │   ├── JournalEntry
│   │   │   ├── MediaPreview.tsx
│   │   │   ├── PatternChip.tsx
│   │   │   ├── VoiceRecorder.tsx
│   │   │   └── index.tsx
│   │   ├── LearningPatternsPanel.tsx
│   │   ├── Nav.tsx
│   │   ├── SpiritInterface.tsx
│   │   ├── SpiritJournal.tsx
│   │   ├── SpiritWebsite.tsx
│   │   ├── auth
│   │   │   └── ProtectedRoute.tsx
│   │   ├── documentation
│   │   │   └── DocumentationPage.tsx
│   │   ├── providers
│   │   │   └── QueryProvider.tsx
│   │   ├── ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── input.tsx
│   │   └── walkthrough
│   │       ├── WalkthroughHighlight.tsx
│   │       ├── WalkthroughProvider.tsx
│   │       ├── WalkthroughToolTip.tsx
│   │       └── types.ts
│   ├── contexts
│   │   └── AuthContext.tsx
│   ├── hooks
│   │   └── useWallet.ts
│   ├── lib
│   │   ├── auth.ts
│   │   ├── journal.ts
│   │   └── utils.ts
│   └── types
│       ├── chat.ts
│       ├── global.d.ts
│       ├── journal.ts
│       └── spirit.ts
├── tailwind.config.ts
└── tsconfig.json

35 directories, 66 files