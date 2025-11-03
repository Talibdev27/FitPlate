# FitPlate 🥗

A complete meal prep and delivery management system for a health-focused food business. Transform your health with personalized meal plans, professional kitchen preparation, and convenient delivery.

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: PostgreSQL
- **Storage**: Cloudinary
- **Payment**: Click Gateway
- **Deployment**: Docker + Docker Compose

## Features

- Multi-language support (Uzbek, Russian, English)
- Customer intake with goal tracking
- Nutrition calculator (auto calories/macros)
- Meal selection from weekly menu
- Weekly subscription management
- Admin panel for orders, customers, meals
- Kitchen dashboard
- Click payment integration
- Email/SMS notifications

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

### Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your environment variables
3. Run `docker-compose up` to start all services
4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

### Development

```bash
# Start all services
docker-compose up

# Run database migrations
cd backend
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

## Project Structure

```
/fitplate
├── /frontend              # React app with Tailwind CSS
├── /backend               # Express API with TypeScript
├── /database              # Database scripts
├── docker-compose.yml     # Docker services
└── README.md
```

## Features

✨ **Beautiful, animated UI** with modern design  
🥗 **Personalized meal plans** tailored to your goals  
👨‍🍳 **Professional kitchen** preparation  
🚚 **Convenient delivery** service  
📊 **Nutrition tracking** with detailed macros  
🌍 **Multi-language support** (Uzbek, Russian, English)  
💪 **Fitness-focused** approach to healthy eating

## Environment Variables

See `.env.example` for all required environment variables.

## License

Proprietary

