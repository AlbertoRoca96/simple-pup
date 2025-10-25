# Walmart Product Search 🛒

A production-ready React + Vite application that provides smart Walmart product searching with commercial-grade query parsing, advanced filtering, and AI-powered search enhancements.

## ✨ Features

### 🧠 Smart Query Parsing
- **Natural Language Processing**: Parse complex queries like "Sony TV under $300 best rated"
- **Automatic Filter Extraction**: Recognizes brands, categories, price ranges, and sort preferences
- **Confidence Scoring**: Shows AI parsing confidence levels
- **Keyword Extraction**: Identifies relevant search terms automatically

### 🎯 Advanced Search Capabilities
- **Real-time Search**: Debounced search with loading states
- **Multi-dimensional Filtering**: Price range, category, brand, shipping, availability
- **Smart Sorting**: Relevance, price (low to high, high to low), rating, newest
- **Category-aware Suggestions**: Dynamic category and brand filtering

### 🎨 Modern UI/UX
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Loading States**: Skeleton screens and smooth transitions
- **Dark Mode Support**: Built for accessibility and user comfort
- **Product Cards**: Rich product information with images, ratings, pricing
- **Search Analytics**: Real-time keyword matching and confidence indicators

### 🔧 Technical Excellence
- **TypeScript**: Full type safety and developer experience
- **Vite**: Lightning-fast build tool and development server
- **Component Architecture**: Clean, reusable, and maintainable code
- **Performance Optimized**: Lazy loading, code splitting, and caching
- **Error Handling**: Graceful degradation and user-friendly error messages

### ⚡ Production Features
- **E2E Testing**: Playwright test suite for critical user journeys
- **CI/CD Pipeline**: GitHub Actions with automated testing and deployment
- **GitHub Pages**: Static site hosting with automatic deployment
- **Security Audit**: Code vulnerability scanning and dependency checks
- **Performance Monitoring**: Lighthouse audits and performance tracking
- **Daily Catalog Refresh**: Automated product catalog updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- (Optional) Walmart API key for production features

### Installation

\`\`\`bash
# Clone the repository
git clone git@github.com:AlbertoRoca96/simple-pup.git
cd simple-pup

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env.local

# Start development server
npm run dev
\`\`\`

### Environment Setup

\`\`\`bash
# Edit .env.local with your configuration
VITE_WALMART_API_KEY=your_api_key_here
VITE_APP_URL=http://localhost:3000
\`\`\`

## 🎯 Usage Examples

### Smart Search Queries

The app understands natural language queries:

- **"Sony TV under $300 best rated"** - Searches for Sony TVs under $300, sorted by rating
- **"Nike shoes between $50-$100"** - Finds Nike shoes in the $50-$100 price range
- **"Apple laptop for gaming under $1200"** - Looks for gaming-capable Apple laptops under $1200
- **"Samsung headphones wireless free shipping"** - Finds Samsung wireless headphones with free shipping

### Smart Features

- **Auto-detection**: Brand, category, and price range extraction happens automatically
- **Confidence Indicators**: See how confident the AI is about parsing your query
- **Keyword Highlighting**: Identified keywords are displayed with confidence scores
- **Filter Suggestions**: Related categories and brands suggested automatically

## 🧪 Testing


\`\`\`bash
# Run E2E tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Build for production
npm run build

# Preview production build
npm run preview
\`\`\`

### Test Coverage

The E2E test suite covers:
- Smart query parsing and filter application
- Search functionality and result display
- Advanced filtering and sorting
- Mobile responsiveness
- Product interactions (favorites, cart)
- Error handling and edge cases
- Keyboard navigation and accessibility

## 🏗️ Architecture


\`\`\`
src/
├── components/          # React components
│   ├── SearchBar.tsx
│   ├── ProductGrid.tsx
│   ├── SearchFilters.tsx
│   └── ...
├── hooks/              # Custom React hooks
│   └── useWalmartSearch.ts
├── services/           # API and external services
│   └── walmartApi.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   └── queryParser.ts
└── styles/             # CSS and styling
\`\`\`

### Key Components

- **QueryParser**: Commercial-grade natural language processing for search queries
- **WalmartApiService**: Handles API calls with fallback to mock data
- **useWalmartSearch**: Custom hook managing search state and debouncing
- **ProductGrid**: Responsive grid with infinite scrolling and loading states

## 🔧 Configuration

### Environment Variables

\`\`\`bash
# API Configuration
VITE_WALMART_API_KEY=your_walmart_api_key     # Primary API key
VITE_APP_URL=http://localhost:3000              # Application URL

# Development
VITE_API_PROXY_URL=http://localhost:3001       # Development proxy
VITE_ENABLE_ANALYTICS=false                    # Analytics flag
VITE_ENABLE_ERROR_REPORTING=false              # Error reporting flag

# Performance
VITE_CACHE_DURATION=3600000                    # Cache duration (ms)
VITE_MAX_SEARCH_RESULTS=100                    # Max results per page
VITE_SEARCH_DEBOUNCE_MS=300                    # Search debounce (ms)
\`\`\`

## 🚀 Deployment

### GitHub Pages (Default)

1. **Push to main branch** - Triggers automatic deployment
2. **GitHub Actions** - Runs tests, builds, and deploys
3. **Live Site**: Available at `https://albertoroca96.github.io/simple-pup`

### Manual Deployment

\`\`\`bash
# Build for production
npm run build

# Deploy to any static hosting service
gs dist --url https://your-domain.com
# or upload dist/ folder to your hosting provider
\`\`\`

## 📊 CI/CD Pipeline

The GitHub Actions workflow includes:

- **Multi-node Testing**: Test on Node.js 18.x and 20.x
- **E2E Testing**: Playwright tests across Chrome, Firefox, Safari
- **Security Auditing**: Automated vulnerability scanning
- **Performance Testing**: Lighthouse audits and optimization
- **Automated Deployment**: Push to GitHub Pages on merge
- **Daily Catalog Refresh**: Automated product data updates
- **Artifact Cleanup**: Automatic cleanup of old build artifacts

## 🎯 Performance Features

- **Code Splitting**: Automatic route and feature-based code splitting
- **Lazy Loading**: Images and components loaded on demand
- **Caching**: Intelligent caching strategies for API responses
- **Bundle Optimization**: Tree shaking and minification
- **Resource Optimization**: Optimized images and assets

## 🔒 Security Features

- **TypeScript**: Compile-time type checking
- **Dependency Scanning**: Automated vulnerability detection
- **Secure Headers**: Proper security headers configuration
- **Input Validation**: Sanitized search queries and filters
- **API Key Safety**: Environment variable protection

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 Development Scripts

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test:e2e     # Run E2E tests
npm run test:e2e:ui  # Run tests with UI
\`\`\`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Walmart Open API**: For product data and search capabilities
- **Vite Team**: For the excellent build tool
- **Playwright Team**: For comprehensive E2E testing
- **Lucide React**: For beautiful UI icons
- **React Community**: For the amazing ecosystem

## 📚 Learn More

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://reactjs.org/)
- [Playwright Testing](https://playwright.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [GitHub Pages](https://pages.github.com/)

---

**Built with ❤️ by Alberto Roca**

*Smart search powered by AI, built for performance and reliability*"# Trigger rebuild"  
