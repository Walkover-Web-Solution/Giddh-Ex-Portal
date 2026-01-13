# Giddh Portal Documentation

Welcome to the Giddh Portal documentation. This directory contains comprehensive documentation for the project's architecture, Redux state management, API integrations, and more.

## Documentation Index

### 📚 Core Documentation

- **[Architecture](./ARCHITECTURE.md)** - Project structure, folder organization, and design patterns
- **[Redux State Management](./REDUX.md)** - Store configuration, slices, selectors, and async thunks
- **[API Documentation](./API.md)** - API endpoints, utilities, request/response formats
- **[Routing](./ROUTING.md)** - Next.js routing structure and navigation patterns

### 🔧 Technical Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios

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
│   │   │       ├── invoices/
│   │   │       ├── payments/
│   │   │       ├── account-statement/
│   │   │       └── ...
│   ├── components/            # Reusable React components
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

- ✅ Multi-tenant support (company/country routing)
- ✅ Invoice management and preview
- ✅ Payment processing (Razorpay, PayPal, PayU)
- ✅ Account statements with PDF export
- ✅ Payment voucher preview
- ✅ Session-based authentication
- ✅ Responsive design

## Contributing

Please read the individual documentation files for detailed information on each aspect of the project.

## Support

For questions or issues, please refer to the specific documentation sections or contact the development team.
