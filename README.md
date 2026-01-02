# Giddh Portal

A modern, production-ready Next.js application built with TypeScript, TailwindCSS, SASS, Redux Toolkit, and shadcn/ui components.

## ✨ Features

- ⚡️ **Next.js 14** - Latest version with App Router and Server Components
- 🔷 **TypeScript** - Full type safety across the entire application
- 🎨 **TailwindCSS** - Utility-first CSS framework for rapid UI development
- 🎭 **SASS/SCSS** - Advanced styling with variables, mixins, and utilities
- 🔄 **Redux Toolkit** - Powerful state management with TypeScript support
- 🧩 **shadcn/ui** - Beautiful, accessible UI components
- 🎯 **Lucide Icons** - Modern, customizable icon library
- 📱 **Responsive Design** - Mobile-first approach with responsive utilities
- 🛠️ **Rich Utilities** - Comprehensive helper functions for common tasks
- 🔐 **API Client** - Pre-configured Axios client with interceptors
- 📦 **Local Storage** - Type-safe storage utilities

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

```bash
cp .env.example .env.local
```

3. **Run the development server:**

```bash
npm run dev
```

4. **Open your browser:**

Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── layout.tsx          # Root layout with Redux provider
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global Tailwind styles
│   ├── components/             # React components
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/                    # Utility functions
│   │   ├── api.ts              # Axios API client
│   │   ├── formatters.ts       # Date, currency, number formatters
│   │   ├── helpers.ts          # General helper functions
│   │   ├── storage.ts          # localStorage/sessionStorage utilities
│   │   ├── utils.ts            # cn() utility for class merging
│   │   └── validators.ts       # Form validation utilities
│   ├── providers/              # Context providers
│   │   └── ReduxProvider.tsx   # Redux store provider
│   ├── store/                  # Redux store
│   │   ├── store.ts            # Store configuration
│   │   ├── hooks.ts            # Typed Redux hooks
│   │   └── slices/             # Redux slices
│   │       ├── counterSlice.ts # Example counter slice
│   │       └── userSlice.ts    # User authentication slice
│   └── styles/                 # SASS styles
│       ├── main.scss           # Main SASS entry point
│       ├── variables.scss      # SASS variables
│       ├── mixins.scss         # SASS mixins
│       └── utilities.scss      # Utility classes
├── public/                     # Static files
└── package.json                # Dependencies
```

## 🛠️ Tech Stack

### Core

- **Framework:** Next.js 14
- **Language:** TypeScript 5.3
- **Styling:** TailwindCSS 3.4 + SASS 1.69

### State Management

- **Redux Toolkit** 2.0 - Modern Redux with less boilerplate
- **React Redux** 9.0 - Official React bindings for Redux

### UI & Components

- **shadcn/ui** - Accessible component system
- **Lucide React** - Icon library
- **Radix UI** - Headless UI primitives

### Utilities

- **Axios** - HTTP client with interceptors
- **date-fns** - Modern date utility library
- **Lodash** - Utility functions (debounce, throttle, etc.)
- **clsx + tailwind-merge** - Conditional class merging

## 🎨 SASS Features

### Variables (`src/styles/variables.scss`)

- Color palette (primary, secondary, grays)
- Spacing scale
- Typography system
- Border radius values
- Shadows
- Breakpoints
- Transitions

### Mixins (`src/styles/mixins.scss`)

- `@include flex-center` - Center content with flexbox
- `@include flex-between` - Space-between layout
- `@include responsive($breakpoint)` - Responsive media queries
- `@include truncate` - Text truncation
- `@include line-clamp($lines)` - Multi-line truncation
- `@include card` - Card styling
- `@include gradient-text($from, $to)` - Gradient text effect

### Utility Classes (`src/styles/utilities.scss`)

- Spacing utilities (m-_, p-_, mt-\*, etc.)
- Text utilities (text-center, font-bold, etc.)
- Display utilities (flex, grid, hidden, etc.)

## 🔄 Redux Store

### Slices

**Counter Slice** (`src/store/slices/counterSlice.ts`)

- Actions: `increment`, `decrement`, `incrementByAmount`, `reset`
- Selectors: `selectCount`, `selectCounterStatus`

**User Slice** (`src/store/slices/userSlice.ts`)

- Actions: `setUser`, `clearUser`, `setLoading`, `setError`, `updateUserProfile`
- Selectors: `selectCurrentUser`, `selectIsAuthenticated`, `selectUserLoading`, `selectUserError`

### Usage

```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { increment, selectCount } from '@/store/slices/counterSlice'

function Counter() {
  const dispatch = useAppDispatch()
  const count = useAppSelector(selectCount)

  return (
    <button onClick={() => dispatch(increment())}>
      Count: {count}
    </button>
  )
}
```

## 🔧 Utility Functions

### API Client (`src/lib/api.ts`)

```typescript
import { apiClient } from "@/lib/api";

const data = await apiClient.get("/users");
await apiClient.post("/users", { name: "John" });
```

### Formatters (`src/lib/formatters.ts`)

- `formatDate()` - Format dates
- `formatCurrency()` - Format currency
- `formatTimeAgo()` - Relative time
- `formatFileSize()` - File size formatting
- `truncateText()` - Text truncation

### Validators (`src/lib/validators.ts`)

- `isEmail()` - Email validation
- `isUrl()` - URL validation
- `isStrongPassword()` - Password strength
- `isPhoneNumber()` - Phone validation

### Helpers (`src/lib/helpers.ts`)

- `debounce()` - Debounce function calls
- `throttle()` - Throttle function calls
- `generateUUID()` - Generate unique IDs
- `copyToClipboard()` - Copy text to clipboard
- `downloadFile()` - Download files
- `groupBy()`, `sortBy()`, `uniqueBy()` - Array utilities

### Storage (`src/lib/storage.ts`)

```typescript
import { storage } from "@/lib/storage";

storage.set("user", { name: "John" });
const user = storage.get("user");
```

## 🎯 Best Practices

1. **Use typed Redux hooks** - Always use `useAppDispatch` and `useAppSelector`
2. **Leverage SASS mixins** - Use predefined mixins for consistent styling
3. **Type everything** - Maintain full TypeScript coverage
4. **Use utility functions** - Don't reinvent the wheel
5. **Follow component patterns** - Use shadcn/ui patterns for new components

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [SASS Documentation](https://sass-lang.com/documentation)

## 📄 License

MIT
