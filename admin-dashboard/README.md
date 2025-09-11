# Flavours Admin Dashboard

A comprehensive administrator dashboard for the Flavours Creator Monetization Platform, built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

### 🔐 Authentication System
- **Robust Login/Signup**: Complete authentication with JWT tokens
- **Role-Based Access**: Admin, Moderator, and Viewer roles
- **Session Management**: Secure token handling and refresh
- **Password Security**: Strong password requirements and validation
- **Demo Credentials**: Pre-configured test accounts

### 📊 Dashboard Overview
- Real-time platform statistics
- User and creator metrics
- Revenue tracking and analytics
- System health monitoring
- Quick action buttons

### 👥 User Management
- View all users and creators
- User status management (active, suspended, banned)
- Role-based access control
- Search and filter functionality
- User activity tracking

### 🛡️ Content Moderation
- Moderation queue management
- Content approval/rejection workflow
- User report handling
- Automated content filtering
- Moderation history tracking

### 📈 Analytics & Reporting
- Platform usage statistics
- Revenue analytics and trends
- User engagement metrics
- Content performance data
- Custom date range filtering

### 💰 Payments & Payouts
- Transaction management
- Creator payout tracking
- Revenue analytics
- Payment method monitoring
- Refund processing

### 🖥️ System Administration
- System health monitoring
- Database performance metrics
- Cache status and performance
- Service status tracking
- Real-time system metrics

### ⚙️ Settings & Configuration
- Platform configuration
- Security settings
- Notification preferences
- Content policies
- API configuration

### 🌙 Dark Mode Support
- Clean black and white theme
- Instant theme switching
- Persistent theme preference
- System theme detection

## 🎯 Admin Pages

### 1. **Dashboard** (`/`)
- Platform overview with key metrics
- Quick action buttons
- Real-time statistics
- Revenue and user growth charts

### 2. **Users** (`/users`)
- User management and search
- Role assignment and status updates
- User activity monitoring
- Account management tools

### 3. **Creators** (`/creators`)
- Creator verification management
- Subscription and earnings tracking
- Creator performance metrics
- Verification workflow

### 4. **Moderation** (`/moderation`)
- Content moderation queue
- Approval/rejection workflow
- Moderation statistics
- Content policy enforcement

### 5. **Reports** (`/reports`)
- User report management
- Investigation workflow
- Report categorization
- Resolution tracking

### 6. **Analytics** (`/analytics`)
- Platform performance metrics
- Revenue analytics
- User engagement data
- Growth trend analysis

### 7. **Content** (`/content`)
- Content management system
- File type and size controls
- Content approval workflow
- Performance metrics

### 8. **Payments** (`/payments`)
- Transaction monitoring
- Creator payout management
- Revenue tracking
- Payment method analytics

### 9. **System** (`/system`)
- System health monitoring
- Resource usage tracking
- Service status monitoring
- Performance metrics

### 10. **Settings** (`/settings`)
- Platform configuration
- Security settings
- Notification preferences
- API configuration

## 🔑 Authentication

### Demo Credentials
- **Admin**: `admin@flavours.com` / `admin123`
- **Moderator**: `mod@flavours.com` / `mod123`
- **Viewer**: `viewer@flavours.com` / `viewer123`

### Role Permissions
- **Admin**: Full access to all features
- **Moderator**: Access to users, creators, moderation, reports, content
- **Viewer**: Read-only access to dashboard and analytics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Backend API running on port 3001
- PostgreSQL database
- Redis cache

### Installation

1. **Navigate to the admin dashboard directory:**
   ```bash
   cd admin-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or use the convenience script
   ./start-admin.sh
   ```

4. **Access the dashboard:**
   - Open http://localhost:3002 in your browser
   - Login with demo credentials
   - The dashboard will connect to the backend API at http://localhost:3001

### Environment Variables

Create a `.env.local` file in the admin-dashboard directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## 📁 Project Structure

```
admin-dashboard/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles with dark mode
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Dashboard home page
│   ├── login/             # Authentication pages
│   ├── signup/
│   ├── users/             # User management
│   ├── creators/          # Creator management
│   ├── moderation/        # Content moderation
│   ├── reports/           # Reports management
│   ├── analytics/         # Analytics dashboard
│   ├── content/           # Content management
│   ├── payments/          # Payments & payouts
│   ├── system/            # System monitoring
│   └── settings/          # Platform settings
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── admin-layout.tsx  # Main layout wrapper
│   ├── admin-sidebar.tsx # Navigation sidebar
│   ├── admin-header.tsx  # Top header bar
│   ├── auth-provider.tsx # Authentication context
│   ├── auth-guard.tsx    # Route protection
│   ├── theme-provider.tsx # Theme management
│   └── theme-toggle.tsx  # Theme switcher
├── lib/                  # Utility functions
│   ├── auth.ts          # Authentication service
│   └── utils.ts         # Common utilities
├── types/                # TypeScript definitions
│   └── admin.ts         # Admin-specific types
└── package.json         # Dependencies and scripts
```

## 🔌 API Integration

The admin dashboard connects to the Flavours backend API with the following endpoints:

### Authentication
- `POST /api/v1/admin/auth/login` - User login
- `POST /api/v1/admin/auth/signup` - User registration
- `POST /api/v1/admin/auth/logout` - User logout
- `GET /api/v1/admin/auth/me` - Get current user
- `POST /api/v1/admin/auth/refresh` - Refresh token

### Admin Endpoints
- `GET /api/v1/admin/dashboard` - Dashboard statistics
- `GET /api/v1/admin/users` - User management
- `GET /api/v1/admin/creators` - Creator management
- `GET /api/v1/admin/moderation/queue` - Moderation queue
- `GET /api/v1/admin/reports` - User reports
- `GET /api/v1/admin/analytics` - Platform analytics
- `GET /api/v1/admin/system/health` - System health

## 🎨 UI Components

### Built with Radix UI
- Accessible component primitives
- Consistent design system
- Keyboard navigation support
- Screen reader compatibility

### Custom Components
- **AdminLayout**: Main layout wrapper
- **AuthGuard**: Route protection
- **ThemeToggle**: Dark/light mode switcher
- **AdminSidebar**: Navigation sidebar
- **AdminHeader**: Top header with user menu

## 🌙 Dark Mode

### Features
- **Instant Switching**: Toggle between light and dark themes
- **System Detection**: Automatically detects OS preference
- **Persistent Storage**: Remembers user's choice
- **Clean Design**: Black and white color scheme

### Usage
- Click the sun/moon icon in the header
- Theme preference is saved automatically
- Works across all pages and components

## 🛠️ Development

### Adding New Pages

1. Create a new page in the `app/` directory
2. Add navigation link in `components/admin-sidebar.tsx`
3. Implement the page component with proper TypeScript types
4. Add authentication guard if needed

### Adding New Components

1. Create component files in the `components/` directory
2. Use the existing UI components from `components/ui/`
3. Follow the established naming conventions
4. Add proper TypeScript types

### Styling Guidelines

- Use Tailwind CSS classes
- Follow the design system in `app/globals.css`
- Use CSS variables for theming
- Ensure responsive design
- Test in both light and dark modes

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["npm", "start"]
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.flavours.app/api/v1
NODE_ENV=production
```

## 🔧 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure the backend API is running on port 3001
   - Check the `NEXT_PUBLIC_API_URL` environment variable
   - Verify CORS settings

2. **Authentication Issues**
   - Clear localStorage and try logging in again
   - Check if the token has expired
   - Verify user has proper role permissions

3. **Build Errors**
   - Clear `.next` directory and rebuild
   - Check TypeScript errors with `npm run lint`
   - Ensure all dependencies are installed

4. **Theme Issues**
   - Clear browser cache
   - Check if localStorage is enabled
   - Verify CSS variables are loaded

### Getting Help

- Check the browser console for error messages
- Verify network requests in the Network tab
- Ensure all environment variables are set correctly
- Check the backend API logs

## 📝 Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for all new features
3. Test components thoroughly before submitting
4. Update documentation for new features
5. Ensure accessibility compliance

## 📄 License

This project is part of the Flavours Creator Platform and follows the same licensing terms.

## 🎉 Features Summary

✅ **Complete Authentication System**  
✅ **8 Comprehensive Admin Pages**  
✅ **Role-Based Access Control**  
✅ **Dark Mode Support**  
✅ **Responsive Design**  
✅ **Real-time Data**  
✅ **Search & Filtering**  
✅ **Modern UI Components**  
✅ **TypeScript Support**  
✅ **Production Ready**
