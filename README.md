# Kitchentory

Mobile-first kitchen inventory management system with automated tracking, meal planning, and smart shopping lists.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm 10+
- iOS 15+ or Android 11+ device (or simulators)
- PostgreSQL 14+ or Supabase account

### Installation

```bash
# Install dependencies
npm install

# Setup Supabase (optional - for local development)
cd supabase
supabase start  # Requires Docker
supabase db push  # Run migrations

# Configure API environment
cd ../apps/api
cp .env.example .env  # Create and edit with your Supabase credentials

# Start API server
npm run dev  # Runs on http://localhost:3001

# In another terminal, start mobile app
cd ../mobile
npm run ios      # For iOS
# or
npm run android  # For Android
```

## 📱 Features

### Core Features
- **Inventory Management**: Barcode scanning, receipt OCR, expiration tracking
- **Recipe Discovery**: Smart suggestions based on available ingredients
- **Meal Planning**: Weekly meal planning with calendar view
- **Shopping Lists**: Auto-generated lists from inventory and meal plans
- **Multi-user**: Household sharing and collaboration

### Technology Stack
- **Mobile**: React Native 0.73 with TypeScript
- **API**: NestJS with TypeScript
- **Database**: PostgreSQL via Supabase
- **State Management**: Redux Toolkit
- **UI**: NativeWind (Tailwind CSS) with shadcn-inspired components

## 🏗️ Project Structure

```
kitchentory/
├── apps/
│   ├── api/           # NestJS API server
│   ├── mobile/        # React Native mobile app
│   └── web/           # Next.js web app (future)
├── packages/
│   ├── shared/        # Shared TypeScript types
│   ├── barcode-scanner/   # Barcode scanning library
│   ├── ocr-processor/     # Receipt OCR library
│   ├── inventory-core/    # Inventory management logic
│   ├── recipe-engine/     # Recipe matching algorithms
│   ├── shopping-list/     # Shopping list generation
│   └── sync-engine/       # Offline/online synchronization
├── supabase/          # Database migrations and config
└── specs/             # Feature specifications and plans
```

## 🧪 Testing

```bash
# Run all tests
npm test

# API tests
npm run --workspace=api test           # Unit tests
npm run --workspace=api test:integration  # Integration tests
npm run --workspace=api test:contracts    # Contract tests
npm run --workspace=api test:e2e          # End-to-end tests

# Mobile tests
npm run --workspace=mobile test
```

## 📋 Available Scripts

### Development
- `npm run dev` - Start API and mobile in parallel
- `npm run api:dev` - Start API server only
- `npm run mobile:start` - Start React Native Metro
- `npm run ios` - Launch iOS simulator
- `npm run android` - Launch Android emulator

### Database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

### Quality
- `npm run lint` - Lint all code
- `npm run format` - Format all code with Prettier
- `npm run typecheck` - TypeScript type checking

## 🌟 Features by Subscription Tier

### Free Tier
- 50 inventory items max
- 10 saved recipes
- Manual inventory management
- Basic shopping lists

### Pro Tier ($3.99/month)
- Unlimited inventory items
- Receipt scanning (10/month)
- Auto meal planning
- 2 store integrations
- Share with 1 family member

### Premium Tier ($7.99/month)
- All Pro features
- Unlimited receipt scanning
- All store integrations
- Share with 5 family members
- Advanced analytics
- Priority support

## 📊 Performance Goals

- Barcode scanning: <2 seconds
- Receipt OCR: <5 seconds accuracy >80%
- API response time: <200ms (p95)
- UI frame rate: 60fps
- App size: <100MB
- Offline functionality with sync

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow
1. Follow TDD: Write tests first, then implementation
2. Use conventional commits
3. Ensure all tests pass
4. Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](https://docs.kitchentory.com)
- [API Docs](http://localhost:3000/api/docs) (when running locally)
- [Issue Tracker](https://github.com/yourusername/kitchentory/issues)

---

Built with ❤️ for better kitchen management