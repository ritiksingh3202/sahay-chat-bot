# Sahay

Sahay is a multilingual welfare scheme discovery platform and conversational assistant designed to help Indian citizens identify government welfare programs they qualify for, evaluate eligibility, and generate document checklists. The system grounds recommendations in data from MyScheme.gov.in using a hybrid architecture of server-side LLM inference via Groq and offline client-side heuristic matching across six regional languages.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API / Socket Events](#api--socket-events)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

## Features

- Multilingual interface supporting six languages: English (`en`), Hindi (`hi`), Tamil (`ta`), Marathi (`mr`), Bangla (`bn`), and Telugu (`te`).
- Persona-based profiling covering seven target groups: Farmer, Woman Head of Household, Gig/Platform Worker, Daily Wage Worker, Student, Senior Citizen, and Small Business Owner.
- Five-step questionnaire engine evaluating land ownership, annual household income brackets, Aadhaar-linked bank accounts, and primary earner status against 10 central government schemes.
- Central scheme catalog containing detailed data for PM-KISAN, Ayushman Bharat (PM-JAY), PM Ujjwala Yojana, Sukanya Samriddhi Yojana, PM Awas Yojana, MGNREGA, Pradhan Mantri Suraksha Bima Yojana (PMSBY), e-Shram (PM-JAY Shramik), Stand-Up India, and National Food Security Act (NFSA-PDS).
- Dual-mode conversational assistant pairing server-side Groq Llama 3.3 70B Versatile generation with offline client-side pattern matching and fallback responses.
- In-chat compressed four-question eligibility flow and direct scheme lookup.
- Source grounding linking all scheme recommendations to verified MyScheme.gov.in URLs.
- Document checklist generator supporting printable HTML file download, system SMS URI generation (`sms:96840`), and WhatsApp prefilled sharing.
- Speech-to-text input in chat powered by the browser Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`).
- Client-side authentication and session management persisted in browser `localStorage`.
- Offline data caching enabling scheme catalog exploration when network connectivity is lost.
- Administrative analytics console providing local event tracking, demographic breakdowns, and CSV export.
- Light and dark theme toggle.

## Tech Stack

| Layer | Technology |
|---|---|
| Client Framework | React 19, TypeScript 5.8 |
| Routing & SSR | TanStack Router 1.168, TanStack Start 1.167 |
| State Management & Data Fetching | TanStack React Query 5.83, React Context, Web Storage API (`localStorage`) |
| Styling & UI Components | Tailwind CSS 4.2, Radix UI primitives, Motion 12.3, Lucide React |
| Server Functions & Runtime | Nitro 3.0, Vite 7.3 |
| AI / LLM Inference | Groq Cloud API (`llama-3.3-70b-versatile`) |
| Edge / Cloud Deployment | Cloudflare Pages / Workers (`@cloudflare/vite-plugin`), Vercel |
| Linting & Formatting | ESLint 9 (Flat Config), Prettier 3.7 |

## Architecture

The application uses a hybrid architecture combining server-side rendering (SSR), edge-compatible server functions, and client-local state persistence.

Client: The frontend is built on React 19 with TanStack Router handling file-based routing and page hydration. User configuration (language selection, active persona), authentication credentials, matched scheme IDs, chat history, and telemetry events are maintained locally in browser `localStorage`. When the user is disconnected from the network, an offline cache mechanism serves scheme records directly from browser storage.

Server: Server-side rendering and API proxying are handled by TanStack Start on top of Nitro, configured to compile to Cloudflare module and Vercel runtime targets. Server-side middleware wraps incoming SSR requests to capture fatal rendering errors and present a branded HTML fallback page.

Real-time and AI Layer: No WebSocket or bidirectional socket connections are used in this project. Real-time interaction occurs through asynchronous HTTP requests. The chat client invokes the `chatWithGroq` TanStack Start server function (`createServerFn`), which accepts the user message, session persona, and matched scheme history. The server function retrieves matching schemes using token matching (`retrieveSchemes`), constructs a context block citing MyScheme.gov.in data, and proxies the query to Groq Cloud running `llama-3.3-70b-versatile`. If the server function fails or `GROQ_API_KEY` is not present, the client automatically catches the error and activates a local, deterministic rule-based RAG engine (`generateRagReply`) to return verified scheme answers directly in the browser.

Database and Persistence: There is no external database (such as PostgreSQL, MongoDB, Firebase, or Supabase) connected to the project. All user profiles, account credentials, eligibility responses, and telemetry pilot logs are persisted exclusively inside client-side `localStorage`. Welfare scheme records and translation dictionaries are stored statically as structured TypeScript modules within the application bundle.

## Project Structure

```text
.
├── .env.example                     # Example environment variable template
├── .gitignore                       # Git ignore configuration
├── .prettierignore                  # Files excluded from Prettier formatting
├── .prettierrc                      # Prettier code formatting rules
├── components.json                  # Shadcn UI configuration file
├── docs/                            # Project reports and projection documents
│   ├── IMPACT_PROJECTION.md         # Estimated impact metrics and scaling assumptions
│   └── PILOT_REPORT.md              # Findings and observations from the prototype pilot
├── eslint.config.js                 # ESLint flat configuration file
├── package.json                     # Project dependencies, scripts, and package metadata
├── public/                          # Static assets and favicon files
│   ├── favicon-dark.png             # Dark theme browser favicon
│   ├── favicon-light.png            # Light theme browser favicon
│   ├── favicon.png                  # Default browser favicon
│   └── sahay-logo.png               # Application brand logo
├── src/                             # Application source code
│   ├── components/                  # Reusable React UI components
│   │   ├── ui/                      # Base primitive components (Accordion, Dialog)
│   │   ├── ChatMarkdown.tsx         # Markdown parser and renderer for chat messages
│   │   ├── CountUpStat.tsx          # Numerical counter animation component
│   │   ├── Footer.tsx               # Global application footer
│   │   ├── Logo.tsx                 # Brand logo component
│   │   ├── Navbar.tsx               # Navigation bar with language and auth controls
│   │   ├── OnboardingResumeDialog.tsx # Modal prompting users to resume or restart sessions
│   │   ├── Reveal.tsx               # Scroll reveal animation wrapper
│   │   ├── SahayAiFab.tsx           # Floating action button navigating to chat
│   │   ├── SchemeCaseStudy.tsx      # Comprehensive case study view for single schemes
│   │   ├── ThemeToggle.tsx          # Dark and light theme switcher button
│   │   └── UserAvatarMenu.tsx       # User profile dropdown with login/logout triggers
│   ├── hooks/                       # Custom React hooks
│   │   ├── use-session.tsx          # Session provider and hook for state synchronization
│   │   └── use-theme.tsx            # Theme provider and hook for dark/light mode
│   ├── lib/                         # Shared utilities, services, and business logic
│   │   ├── auth.ts                  # Client-side user authentication stored in localStorage
│   │   ├── chat-api.ts              # Unified chat reply dispatcher with fallback handling
│   │   ├── chat-groq.fn.ts          # TanStack Start server function querying Groq API
│   │   ├── checklist.ts             # Document checklist export (HTML, SMS, WhatsApp)
│   │   ├── citation-label.ts        # URL formatter for official government citations
│   │   ├── contact.ts               # Contact constants for SMS shortcode and toll-free helpline
│   │   ├── eligibility-engine.ts    # Rule scoring engine matching user answers to schemes
│   │   ├── error-capture.ts         # Global server error tracking utility
│   │   ├── error-page.ts            # Server-rendered 500 error page template
│   │   ├── groq-client.server.ts    # Server-only Groq API HTTP client
│   │   ├── i18n.ts                  # Localized dictionaries and translated questions
│   │   ├── rag-chat.ts              # Heuristic offline RAG chat engine and query normalizer
│   │   ├── rag-context.ts           # Scheme retrieval and prompt context builder
│   │   ├── scheme-detail-meta.ts    # Meta title and description builder for scheme pages
│   │   ├── schemes-data.ts          # Static catalog of 10 central government schemes
│   │   ├── session.ts               # LocalStorage session state management and event logger
│   │   ├── types.ts                 # TypeScript type and interface definitions
│   │   └── utils.ts                 # Classname utility helpers (`clsx`, `tailwind-merge`)
│   ├── routes/                      # TanStack Router file-based route definitions
│   │   ├── __root.tsx               # Root application shell, providers, and HTML layout
│   │   ├── admin.tsx                # Admin console with metrics and CSV export
│   │   ├── app.tsx                  # Authenticated user dashboard
│   │   ├── auth.tsx                 # Login and signup view
│   │   ├── chat.tsx                 # Conversational AI chat view
│   │   ├── eligibility.tsx          # Multi-step eligibility questionnaire
│   │   ├── index.tsx                # Public marketing and feature overview landing page
│   │   ├── schemes.$id.tsx          # Individual scheme details and document checklist view
│   │   ├── schemes.index.tsx        # Matched schemes list view
│   │   ├── schemes.tsx              # Schemes route layout outlet
│   │   └── start.tsx                # Language and persona onboarding route
│   ├── router.tsx                   # TanStack Router initialization and QueryClient setup
│   ├── routeTree.gen.ts             # Auto-generated route tree from TanStack Router
│   ├── server.ts                    # SSR server entry point with error normalization
│   ├── start.ts                     # TanStack Start instance and middleware definition
│   └── styles.css                   # Global stylesheet and Tailwind CSS imports
├── tsconfig.json                    # TypeScript compiler options
├── vite.config.ts                   # Vite bundler configuration with TanStack and Nitro
└── wrangler.jsonc                   # Cloudflare Workers / Pages configuration file
```

## Getting Started

### Prerequisites

Ensure the following tools are installed on your machine:

- Node.js: `v20.x` or higher
- npm: `v10.x` or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ritiksingh3202/sahay-chat-bot.git
   cd sahay
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

1. Create a local environment file by copying the example file:
   ```bash
   cp .env.example .env
   ```

2. Configure environment variables in `.env` (optional, see [Environment Variables](#environment-variables)):
   ```env
   GROQ_API_KEY=gsk_your_key_here
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open the application in your browser:
   ```text
   http://localhost:3000
   ```

## Environment Variables

| Variable | Description | Example Value | Required / Optional |
|---|---|---|---|
| `GROQ_API_KEY` | API key used server-side to call Groq LLM inference (`llama-3.3-70b-versatile`). | `gsk_your_key_here` | Optional (if omitted or invalid, the app automatically switches to the offline local RAG engine) |

## Available Scripts

The following scripts are defined in [package.json](package.json):

| Script | Command | Description |
|---|---|---|
| `dev` | `vite dev` | Starts the local Vite development server with SSR. |
| `build` | `vite build` | Builds client and server bundles for production. |
| `build:dev` | `vite build --mode development` | Builds client and server bundles in development mode. |
| `preview` | `vite preview` | Previews the production build locally. |
| `lint` | `eslint .` | Runs ESLint to check for code quality and formatting errors. |
| `format` | `prettier --write .` | Formats all project files using Prettier. |

## API / Socket Events

The application does not use WebSockets or socket event connections. All client-server communication is handled through HTTP.

### TanStack Start Server Function: `chatWithGroq`

Defined in [src/lib/chat-groq.fn.ts](src/lib/chat-groq.fn.ts) and invoked from the client via [src/lib/chat-api.ts](src/lib/chat-api.ts).

- Protocol: HTTP POST (handled via TanStack Start RPC endpoint)
- Method: `POST`
- Request Payload:
  ```json
  {
    "message": "string",
    "lang": "en | hi | ta | mr | bn | te",
    "persona": "farmer | woman | wage | gig | student | senior | business | null",
    "matchedSchemeIds": ["string"],
    "history": [
      {
        "role": "user | assistant",
        "content": "string"
      }
    ]
  }
  ```
- Response Payload:
  ```json
  {
    "text": "string",
    "citations": ["string"],
    "provider": "groq"
  }
  ```
- Purpose: Accepts the current user input, session language, user persona, previously matched schemes, and conversation history. Retrieves top-ranking schemes from the local dataset, builds a grounded context block referencing official MyScheme.gov.in data, and proxies the query to Groq Cloud API using `llama-3.3-70b-versatile`. Returns the generated response along with verified source citations.

## Deployment

### Build Command

Compile the application for production:

```bash
npm run build
```

### Hosting

The project is structured with Nitro and `@cloudflare/vite-plugin` configured in [vite.config.ts](vite.config.ts) and [wrangler.jsonc](wrangler.jsonc):

- Cloudflare Pages / Workers: Configured with `compatibility_date: "2025-09-24"` and `compatibility_flags: ["nodejs_compat"]`. The build outputs to `.output/` using the `cloudflare-module` preset. Deploy using the Cloudflare Wrangler CLI:
  ```bash
  npx wrangler deploy
  ```
- Vercel: The Nitro preset supports direct deployment to Vercel via standard project linking and git integration. Ensure `GROQ_API_KEY` is added to the hosting provider's environment variables dashboard.

## Roadmap

- [ ] Connect live MyScheme.gov.in REST API for dynamic scheme catalog synchronization.
- [ ] Implement server-side persistent database (e.g., PostgreSQL or Supabase) to replace `localStorage` auth and sessions.
- [ ] Integrate telecom SMS gateway or shortcode service provider to replace device `sms:` URI schemes.
- [ ] Integrate WhatsApp Business Cloud API for automated messaging workflows.
- [ ] Add state-specific welfare schemes (e.g., Uttar Pradesh, Bihar, Maharashtra).
- [ ] Implement automated test suite covering eligibility scoring and RAG retrieval pipelines.

## Contributing

1. Fork the repository on GitHub.
2. Create a new topic branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. Commit your changes following the [Conventional Commits](https://www.conventionalcommits.org/) specification:
   ```bash
   git commit -m "feat: add support for Punjabi language"
   ```
4. Run code quality checks before opening a pull request:
   ```bash
   npm run lint
   npm run format
   ```
5. Push the branch to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```
6. Open a pull request against the `main` branch.

## License

This project is currently marked as private and unlicensed (`"private": true` in [package.json](package.json)). All rights reserved.

## Author

Ritik Singh ([@ritiksingh3202](https://github.com/ritiksingh3202))
