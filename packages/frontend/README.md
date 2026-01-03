# Globe Trotter Frontend

React frontend application for the Globe Trotter travel planning platform.

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for routing
- **React Query** for state management and API calls
- **Vite** for build tooling
- **Vitest** for testing

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, Card)
│   └── layout/         # Layout components (Header, Layout)
├── pages/              # Page components
├── routes/             # Routing configuration
├── lib/                # Utility libraries
│   ├── api.ts          # Axios API client
│   ├── react-query.ts  # React Query configuration
│   └── utils.ts        # Utility functions
└── test/               # Test utilities and setup
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Features Implemented

### Task 11.1 - React Application Structure ✅

- ✅ React app with TypeScript and Tailwind CSS
- ✅ React Query for state management
- ✅ React Router for routing
- ✅ Shared component library with:
  - Button component with variants (primary, secondary, outline, ghost)
  - Input component with label and error handling
  - Card components for content layout
  - Header component with navigation
  - Layout wrapper component

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

## Next Steps

The following tasks will build upon this foundation:

- **Task 11.2**: Authentication and user management UI
- **Task 11.3**: Itinerary management interface
- **Task 11.4**: Search and activity discovery UI
- **Task 11.5**: Budget management interface
- **Task 11.6**: Calendar and timeline views
- **Task 11.7**: Sharing and collaboration UI