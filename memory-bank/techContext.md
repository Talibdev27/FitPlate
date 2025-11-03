# Technical Context: FitPlate

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod
- **Internationalization**: i18next
- **UI Components**: Custom components with Tailwind

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL 15
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Email**: nodemailer (configured but not fully integrated)
- **Validation**: Built-in Express validation

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Database**: PostgreSQL (containerized)
- **Development**: Hot reload with nodemon (backend) and Vite HMR (frontend)

## Development Setup

### Prerequisites
- Node.js (v18+)
- Docker and Docker Compose
- Git

### Environment Variables

#### Backend (.env)
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default: 5001)
- `JWT_SECRET`: JWT signing secret
- `JWT_REFRESH_SECRET`: Refresh token secret
- `FRONTEND_URL`: Frontend URL for CORS
- Various service API keys (Click, Cloudinary, SMS, Email)

#### Frontend (.env)
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:5001/api)

### Running the Application

#### Using Docker Compose (Recommended)
```bash
docker-compose up
```
- Backend: http://localhost:5001
- Frontend: http://localhost:3000
- Database: localhost:5432

#### Manual Setup
1. Install dependencies: `npm install` in both frontend and backend
2. Set up database: Run Prisma migrations
3. Start backend: `npm run dev` in backend directory
4. Start frontend: `npm run dev` in frontend directory

## Technical Constraints

### Current Limitations
1. **Image Upload**: Currently using placeholder URLs; Cloudinary integration prepared but not fully implemented
2. **Payment Processing**: Payment endpoints exist but payment gateway integration is pending
3. **SMS Service**: OTP SMS sending is placeholder; actual SMS service integration needed
4. **Email Service**: Email service configured but not fully tested
5. **Analytics**: Basic stats implemented; advanced charts require charting library (Chart.js/Recharts)

### Database Constraints
- PostgreSQL required (Prisma dependency)
- Migrations must be run before first use
- Database connection required at all times

### API Constraints
- All authenticated routes require valid JWT token
- Rate limiting applied to auth endpoints
- CORS configured for frontend origin only

## Dependencies

### Key Frontend Dependencies
- `react`, `react-dom`: UI framework
- `react-router-dom`: Routing
- `axios`: HTTP client
- `zustand`: State management
- `react-hook-form`, `zod`: Form handling
- `i18next`, `react-i18next`: Internationalization
- `tailwindcss`: Styling

### Key Backend Dependencies
- `express`: Web framework
- `prisma`, `@prisma/client`: Database ORM
- `jsonwebtoken`: JWT handling
- `bcrypt`: Password hashing
- `cors`, `helmet`: Security middleware
- `dotenv`: Environment variables
- `nodemailer`: Email sending

## Development Workflow

### Code Organization
- **Backend**: MVC pattern (Models via Prisma, Views as JSON responses, Controllers for logic)
- **Frontend**: Feature-based structure (pages, components, api, store)
- **Shared**: Types defined in respective frontend/backend directories

### Git Workflow
- Main branch: `main`
- Commits: Descriptive messages with feature summaries
- Repository: https://github.com/Talibdev27/FitPlate.git

## Deployment Considerations

### Current State
- Development environment only
- Docker Compose for local development
- No production deployment configured yet

### Future Deployment Needs
- Production database setup
- Environment variable management
- CI/CD pipeline
- Frontend build process (Vite build)
- Backend production server (PM2 or similar)

