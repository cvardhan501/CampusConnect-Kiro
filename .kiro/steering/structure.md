# Repository Structure Steering

This document defines the folder structure and code placement conventions for CampusConnect.

## Directory Layout

```
CampusConnect-Kiro/
├── .kiro/                       # Kiro project specifications & steering
│   ├── specs/campus-connect/    # Canonical requirements.md and design.md specs
│   └── steering/                # Operational steering guidelines (this directory)
├── app/                         # Next.js App Router (Pages & API Routes)
│   ├── (auth)/                  # Unprotected authentication pages (login, register, reset)
│   ├── (protected)/             # Authenticated app pages (dashboard, issues, admin, staff)
│   ├── api/                     # Server-side REST API route handlers
│   ├── globals.css              # Global Tailwind CSS styles
│   └── layout.tsx               # Root layout frame
├── components/                  # React UI components
│   ├── layout/                  # Structural frames (AppShell, Header, Sidebar, MobileNav)
│   └── ui/                      # Reusable atomic UI components (Button, Modal, StatusBadge)
├── server/                      # Backend domain services & data layer
│   ├── db/                      # Database connection singleton
│   ├── models/                  # Mongoose schemas & TypeScript interfaces
│   ├── services/                # Core business logic services
│   ├── utils/                   # Authentication, JWT, RBAC, and rate limiting helpers
│   └── validators/              # Zod schema request payload validators
├── lib/                         # Shared utility functions and client mock data
├── tests/                       # Automated test suite
│   ├── unit/                    # Vitest unit tests (state machine, auth, RBAC)
│   └── integration/             # Integration tests (MongoDB Memory Server)
├── docs/                        # Project specifications & verification documents
├── package.json                 # Project dependencies & scripts
└── tailwind.config.js           # Tailwind design tokens configuration
```

---

## Code Placement Rules

### 1. UI Pages (`app/`)
- Place user-facing pages inside `app/(auth)/` (public auth) or `app/(protected)/` (authenticated views).
- Pages must remain lightweight wrapper components that render UI layout components and call API routes or client handlers.

### 2. UI Components (`components/`)
- Reusable UI building blocks (buttons, badges, inputs, cards, tables, modals) belong in `components/ui/`.
- Layout components (navigation header, sidebar, app shell) belong in `components/layout/`.
- UI components must rely on props and presentation logic; business rules belong in the server layer.

### 3. API Routes (`app/api/`)
- All backend endpoints belong in `app/api/<endpoint>/route.ts`.
- Route handlers must:
  1. Authenticate user session using `server/utils/auth.ts`.
  2. Validate payload using Zod schemas (`server/validators/`).
  3. Delegate business operations to standard domain services (`server/services/`).
  4. Return consistent JSON status responses.

### 4. Domain Services (`server/services/`)
- All core business logic, database queries, status transitions, notifications, AI calls, and audit logging belong in `server/services/`.
- Route handlers must **never** contain inline business logic or raw complex Mongoose mutations.

### 5. Models & Data Access (`server/models/`)
- All database collections and schemas must be defined in `server/models/`.
- Export TypeScript interfaces (e.g., `IIssue`) alongside Mongoose models (`Issue`).

### 6. Steering & Specs (`.kiro/`)
- Canonical requirements belong in `.kiro/specs/campus-connect/`.
- Operational steering guidance belongs in `.kiro/steering/`.
