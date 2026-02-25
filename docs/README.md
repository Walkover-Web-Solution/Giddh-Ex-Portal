# Giddh Portal Documentation

Welcome to the Giddh Portal documentation. This directory contains comprehensive documentation for the project's architecture, Redux state management, API integrations, and more.

## Documentation Index

### 📚 Core Documentation

- **[Architecture](./ARCHITECTURE.md)** - Project structure, folder organization, and design patterns
- **[Redux State Management](./REDUX.md)** - Store configuration, slices, selectors, and async thunks
- **[API Documentation](./API.md)** - API endpoints, utilities, request/response formats
- **[Routing](./ROUTING.md)** - Next.js routing structure and navigation patterns
- **[White-Label Configuration](./WHITELABEL_CONFIG.md)** - Configuration system and white-label setup

### 🔧 Technical Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Configuration**: Centralized config system

### 📖 Quick Links

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
giddh-portal/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── [company]/         # Dynamic company routes
│   │   │   └── [country]/     # Dynamic country routes
│   │   │       ├── invoice/   # Invoice list + preview
│   │   │       ├── payment/   # Payment list + preview
│   │   │       ├── invoice-pay/ # Public invoice pay
│   │   │       ├── account-statement/
│   │   │       ├── details/
│   │   │       ├── welcome/
│   │   │       ├── login/
│   │   │       └── auth/
│   │   ├── auth/              # Root auth (proxy token)
│   │   └── magic/             # Magic link viewer
│   ├── components/            # Reusable React components
│   ├── config/                # Configuration system
│   ├── contexts/              # React contexts
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # Redux store and slices
│   ├── utils/                 # API utilities and helpers
│   ├── lib/                   # Core libraries and configurations
│   └── providers/             # React context providers
├── docs/                      # Documentation
└── public/                    # Static assets
```

## Development Workflow

1. **Feature Development**: Create components in `src/components/`
2. **State Management**: Add slices in `src/store/slices/`
3. **API Integration**: Create utilities in `src/utils/`
4. **Routing**: Add pages in `src/app/[company]/[country]/`
5. **Styling**: Use Tailwind CSS utility classes

## Key Features

- ✅ Company/country URL-based routing
- ✅ Single-company session per login
- ✅ Invoice management, preview, and payment
- ✅ Payment processing (Razorpay, PayPal, PayU)
- ✅ Account statements with PDF export
- ✅ Payment voucher preview
- ✅ Account switching (within same company)
- ✅ Magic link account statement viewer
- ✅ Session-based authentication (cookie + redux-persist)
- ✅ White-label configuration support
- ✅ Responsive design with collapsible sidebar

## Contributing

Please read the individual documentation files for detailed information on each aspect of the project.

## Support

For questions or issues, please refer to the specific documentation sections or contact the development team.
