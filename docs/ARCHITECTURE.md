# Architecture Documentation

## Overview

Giddh Portal is built using Next.js 16 with the App Router, TypeScript, Redux Toolkit for state management, and Tailwind CSS for styling. The application follows a feature-based architecture with clear separation of concerns and a centralized configuration system.

## Tech Stack

### Core Technologies

| Technology    | Version | Purpose                         |
| ------------- | ------- | ------------------------------- |
| Next.js       | 16.1.1  | React framework with App Router |
| TypeScript    | Latest  | Type-safe development           |
| Redux Toolkit | Latest  | State management                |
| Tailwind CSS  | Latest  | Utility-first CSS framework     |
| Axios         | Latest  | HTTP client                     |

### Payment Integrations

- **Razorpay**: Primary payment gateway
- **PayPal**: International payments
- **PayU**: Alternative payment gateway

## Project Structure

```
src/
├── app/                           # Next.js App Router
│   ├── [company]/                # Dynamic company routing
│   │   └── [country]/            # Dynamic country routing
│   │       ├── invoices/         # Invoice list page
│   │       ├── invoice/
│   │       │   └── preview/      # Invoice preview with PDF
│   │       ├── payments/         # Payments list page
│   │       ├── payment/
│   │       │   └── preview/      # Payment voucher preview
│   │       ├── account-statement/ # Account statement page
│   │       ├── details/          # User details page
│   │       ├── login/            # Login page
│   │       └── welcome/          # Welcome page
│   ├── auth/                     # Authentication pages
│   ├── magic/                    # Magic link pages
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
│
├── components/                    # Reusable components
│   ├── ui/                       # UI components (shadcn/ui)
│   │   ├── card.tsx
│   │   └── ...
│   ├── skeletons/                # Loading skeletons
│   │   └── TableSkeleton.tsx
│   ├── BalanceSummaryCard.tsx    # Balance display
│   ├── DataTable.tsx             # Generic data table
│   ├── Footer.tsx                # Footer component
│   ├── Header.tsx                # Header component
│   ├── Pagination.tsx            # Pagination component
│   ├── PayNow.tsx                # Payment gateway integration
│   └── Sidebar.tsx               # Navigation sidebar
│
├── config/                        # Configuration system
│   ├── default.ts                # Default configuration values
│   └── index.ts                  # Config exports
│
├── contexts/                      # React contexts
│   ├── ConfigContext.tsx         # Configuration context
│   └── SidebarContext.tsx        # Sidebar state context
│
├── hooks/                         # Custom React hooks
│   └── useAppConfig.ts           # Configuration hook
│
├── services/                      # Service layer
│   └── whitelabel.ts             # White-label API service
│
├── store/                         # Redux store
│   ├── slices/
│   │   └── companySlice.ts       # Company state management
│   ├── hooks.ts                  # Typed Redux hooks
│   └── store.ts                  # Store configuration
│
├── utils/                         # API utilities
│   ├── magic/                    # Magic link utilities
│   ├── proxy/                    # Proxy authentication utilities
│   ├── accountStatement.ts       # Account statement APIs
│   ├── invoicePreview.ts         # Invoice preview APIs
│   ├── payment.ts                # Payment APIs
│   ├── paymentPreview.ts         # Payment voucher APIs
│   └── ...
│
├── lib/                           # Core libraries
│   ├── api.ts                    # API helper functions
│   ├── apiClient.ts              # Axios instance configuration
│   ├── formatters.ts             # Data formatters
│   └── utils.ts                  # Utility functions
│
├── providers/                     # React providers
│   └── ReduxProvider.tsx         # Redux store provider
│
└── types/                         # TypeScript type definitions
    └── ...
```

## Design Patterns

### 1. Multi-Tenant Routing

The application uses Next.js dynamic routes for multi-tenant support:

```
/:companyUniqueName/:country/[feature]
```

**Example:**

```
/PiyusssshhCompany/in/invoices
/PiyusssshhCompany/in/payments
```

### 2. Component Architecture

#### Atomic Design Principles

- **Atoms**: Basic UI components (buttons, inputs)
- **Molecules**: Combinations of atoms (cards, form fields)
- **Organisms**: Complex components (tables, forms)
- **Templates**: Page layouts
- **Pages**: Complete pages with data

#### Component Structure

```tsx
// Example component structure
export default function FeaturePage() {
  // 1. Hooks and state
  const params = useParams();
  const [state, setState] = useState();

  // 2. Redux selectors
  const data = useAppSelector(selectData);

  // 3. Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);

  // 4. Event handlers
  const handleAction = () => {
    // Handler logic
  };

  // 5. Render
  return (
    <>
      <header>...</header>
      <main>...</main>
    </>
  );
}
```

### 3. State Management Pattern

**Redux Toolkit** is used for global state management:

- **Slices**: Feature-based state slices
- **Async Thunks**: Asynchronous API calls
- **Selectors**: Memoized state selectors
- **Typed Hooks**: Type-safe useAppSelector and useAppDispatch

### 4. API Layer Architecture

```
Component → API Utility → Axios Client → API Server
```

**Benefits:**

- Centralized API logic
- Type-safe requests/responses
- Easy to mock for testing
- Consistent error handling

### 5. Authentication Flow

```
1. User enters credentials
2. API returns session token
3. Token stored in localStorage
4. Token sent in Session-id header
5. Redux stores user data
6. Protected routes check authentication
```

## Folder Organization Rules

### App Directory (`src/app/`)

- **Dynamic Routes**: Use `[param]` for dynamic segments
- **Route Groups**: Use `(group)` for organization without affecting URL
- **Layouts**: `layout.tsx` for shared layouts
- **Pages**: `page.tsx` for route endpoints
- **Loading**: `loading.tsx` for loading states
- **Error**: `error.tsx` for error boundaries

### Components (`src/components/`)

- **UI Components**: Reusable, presentational components
- **Feature Components**: Feature-specific components
- **Shared Components**: Used across multiple features
- **Naming**: PascalCase for component files

### Utils (`src/utils/`)

- **API Utilities**: One file per feature/resource
- **Naming**: camelCase for utility files
- **Exports**: Named exports for functions and types

## Data Flow

### 1. Page Load Flow

```
1. Page component mounts
2. Extract route parameters (company, country)
3. Check Redux for cached data
4. If not cached, dispatch async thunk
5. Async thunk calls API utility
6. API utility makes HTTP request
7. Response stored in Redux
8. Component re-renders with data
```

### 2. User Action Flow

```
1. User triggers action (click, submit)
2. Event handler called
3. Validation (if needed)
4. API call via utility function
5. Loading state shown
6. Response received
7. Redux state updated (if needed)
8. UI updated
9. Success/error feedback shown
```

## Styling Architecture

### Tailwind CSS Approach

- **Utility-First**: Use Tailwind utility classes
- **No Custom CSS**: Avoid custom CSS files
- **Responsive**: Mobile-first responsive design
- **Dark Mode**: Not currently implemented

### Common Patterns

```tsx
// Layout
className = "flex items-center justify-between";

// Spacing
className = "px-6 py-4 mb-4";

// Typography
className = "text-xl font-semibold text-gray-900";

// Interactive
className = "hover:bg-gray-50 focus:outline-none focus:ring-2";

// Responsive
className = "w-full md:w-1/2 lg:w-1/3";
```

## Performance Optimizations

### 1. Code Splitting

- **Dynamic Imports**: Lazy load heavy components
- **Route-based Splitting**: Automatic with Next.js App Router

### 2. Data Fetching

- **Conditional Fetching**: Only fetch if data not in Redux
- **Caching**: Redux stores fetched data
- **Parallel Requests**: Use Promise.all for independent requests

### 3. Rendering Optimizations

- **React.memo**: Memoize expensive components
- **useMemo/useCallback**: Memoize values and functions
- **Virtualization**: For long lists (if needed)

## Security Considerations

### 1. Authentication

- Session-based authentication
- Tokens stored in localStorage
- Session-id header on all authenticated requests

### 2. Data Validation

- TypeScript for compile-time type checking
- Runtime validation for API responses
- Input sanitization

### 3. XSS Prevention

- React's built-in XSS protection
- Avoid dangerouslySetInnerHTML
- Sanitize user input

## Error Handling

### 1. API Errors

```tsx
try {
  const response = await apiCall();
  // Handle success
} catch (error) {
  console.error("Error:", error);
  setError("User-friendly error message");
}
```

### 2. Component Errors

- Error boundaries for component errors
- Graceful degradation
- User-friendly error messages

### 3. Loading States

- Skeleton loaders during data fetch
- Disabled buttons during processing
- Loading spinners for async operations

## Best Practices

### 1. TypeScript

- ✅ Use strict mode
- ✅ Define interfaces for all data structures
- ✅ Avoid `any` type
- ✅ Use type inference when possible

### 2. Components

- ✅ Keep components small and focused
- ✅ Extract reusable logic to custom hooks
- ✅ Use composition over inheritance
- ✅ Props should be typed with interfaces

### 3. State Management

- ✅ Use Redux for global state
- ✅ Use local state for UI-only state
- ✅ Normalize complex data structures
- ✅ Use selectors for derived state

### 4. Code Organization

- ✅ One component per file
- ✅ Group related files together
- ✅ Use index files for clean imports
- ✅ Follow consistent naming conventions

## Testing Strategy

### Unit Tests

- Test utility functions
- Test Redux reducers and selectors
- Test custom hooks

### Integration Tests

- Test component interactions
- Test API integrations
- Test Redux flow

### E2E Tests

- Test critical user flows
- Test payment workflows
- Test authentication flow

## Deployment

### Build Process

```bash
npm run build
```

### Configuration System

- **Centralized Config**: All configuration in `src/config/default.ts`
- **No Environment Files**: Configuration is hardcoded (white-label feature disabled)
- **Type-Safe**: Full TypeScript support for all config values
- **Easy Access**: Use `useAppConfig()` hook in components or `config` import in utilities

### Static Generation

- Static pages pre-rendered at build time
- Dynamic pages rendered on-demand
- Optimized for performance

## Future Improvements

- [ ] Implement dark mode
- [ ] Add comprehensive testing
- [ ] Implement caching strategies
- [ ] Add analytics integration
- [ ] Improve accessibility (WCAG 2.1)
- [ ] Add internationalization (i18n)
- [ ] Implement PWA features
- [ ] Add real-time updates (WebSockets)
