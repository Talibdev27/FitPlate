# System Patterns: FitPlate

## Architecture Overview
The application follows a **three-tier architecture**:
- **Frontend**: React + TypeScript + Vite (SPA)
- **Backend**: Node.js + Express + TypeScript (RESTful API)
- **Database**: PostgreSQL with Prisma ORM

## Key Technical Decisions

### Authentication & Authorization
- **JWT-based authentication** with access and refresh tokens
- **Role-based access control (RBAC)** for staff:
  - SUPER_ADMIN: Full system access
  - LOCATION_MANAGER: Manage locations and staff
  - CHEF: Manage meals
  - DELIVERY_DRIVER: View and update delivery orders
  - CUSTOMER_SUPPORT: Manage customers
  - NUTRITIONIST: Manage meals and nutrition data
- Separate authentication flows for users and staff
- Token storage in localStorage with automatic refresh

### State Management
- **Zustand** for client-side state:
  - `authStore`: User authentication state
  - `staffAuthStore`: Staff authentication state
- Persistent state via localStorage hydration
- API client with interceptors for automatic token management

### Routing Patterns
- **Protected Routes**: `ProtectedRoute` component for user routes
- **Admin Routes**: `AdminRoute` component for staff routes
- **Role Routes**: `RoleRoute` component for role-specific access
- Layout components: `UserLayout` and `AdminLayout` for consistent navigation

### Data Flow
1. **Frontend** → API Client → Axios Interceptor → **Backend**
2. **Backend** → Prisma ORM → **PostgreSQL**
3. Response flows back through the same chain

### Multi-Language Support
- **i18next** for internationalization
- Supported languages: Uzbek (uz), Russian (ru), English (en)
- Translation files in `frontend/src/i18n/locales/`
- JSON-based translations with nested keys

### Form Handling
- **React Hook Form** for form state management
- **Zod** for schema validation
- Consistent error handling and display patterns

## Component Relationships

### Frontend Structure
```
App.tsx (Root Router)
├── Public Routes (/, /login, /register, /verify-otp)
├── Protected User Routes (/dashboard/*, /onboarding/*)
│   └── UserLayout (Navigation wrapper)
└── Admin Routes (/admin/*)
    └── AdminLayout (Sidebar navigation)
```

### Backend Structure
```
server.ts (Express App)
├── Middleware (auth, errorHandler, rateLimiter)
└── Routes
    ├── /api/auth (authentication)
    ├── /api/users (user management - admin only)
    ├── /api/profile (current user profile)
    ├── /api/subscriptions (user subscriptions)
    ├── /api/admin/dashboard (dashboard stats)
    ├── /api/staff (staff management)
    ├── /api/meals (meal management)
    ├── /api/orders (order management)
    └── /api/locations (location management)
```

## Design Patterns

### Controller Pattern
- Controllers handle business logic
- Separate controllers for each resource domain
- Consistent error handling via `createError` utility

### Middleware Pattern
- Authentication middleware validates tokens
- Role-based middleware checks permissions
- Error handling middleware centralizes error responses

### Repository Pattern (via Prisma)
- Prisma Client acts as repository layer
- Type-safe database queries
- Automatic relation handling

### Service Layer
- Email service for notifications
- SMS service (placeholder) for OTP
- Future: Payment service integration

## Database Schema Patterns

### Key Models
- **User**: Customer accounts with profile data
- **Staff**: Staff members with roles
- **Location**: Delivery locations
- **Meal**: Meal items with nutrition data
- **Order**: Customer orders
- **Subscription**: User meal subscriptions
- **Payment**: Payment records

### Relations
- One-to-many: User → Orders, User → Subscriptions
- Many-to-one: Order → Location, Order → User
- One-to-one: Location → Manager (Staff)
- Many-to-many: Order → Meals (via OrderItem)

