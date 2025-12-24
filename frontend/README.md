# STL Unclaimed Frontend

A modern, full-featured web application for managing STL unclaimed winnings built with Vite, React, Tailwind CSS, and Supabase.

## 🚀 Features

- **Dashboard** - Overview of all statistics and recent unclaimed items
- **Unclaimed Management** - View, search, filter, and manage unclaimed items
- **Pending Items** - Track overdue items with categorization
- **Collections** - View all collected winnings across franchises
- **Distribution Reports** - Track winning distributions (staff, collector, agent, admin)
- **User Management** - Manage system users and permissions
- **Authentication** - Secure login system with Supabase
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile

## 📦 Tech Stack

- **Vite** - Fast build tool and dev server
- **React** - UI library with hooks
- **React Router** - Client-side routing
- **Tailwind CSS v4** - Utility-first CSS framework
- **Supabase** - Backend as a service (database, auth)
- **Lucide React** - Beautiful icon library

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the frontend directory:

```bash
cp .env.example .env
```

Then edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**To get your Supabase credentials:**
1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy the "Project URL" and "anon/public" key

### 3. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### 4. Default Login Credentials

Based on the sample data in the database:

- **Admin**: username: `admin`, password: `admin123`
- **User**: username: `user`, password: `user1`
- **GM**: username: `GM`, password: `sgc123`
- **Specialist**: username: `Rinalou`, password: `sgc123`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # Main layout with sidebar navigation
│   │   └── Login.jsx           # Login form component
│   ├── pages/
│   │   ├── Dashboard.jsx       # Dashboard page
│   │   ├── Unclaimed.jsx       # Unclaimed items page
│   │   ├── Pending.jsx         # Pending items page
│   │   ├── Collections.jsx     # Collections page
│   │   ├── Reports.jsx         # Distribution reports page
│   │   └── Users.jsx           # User management page
│   ├── lib/
│   │   └── supabase.js         # Supabase client and helper functions
│   ├── App.jsx                 # Main app component with routing
│   ├── main.jsx                # Application entry point
│   └── index.css               # Global styles with Tailwind
├── .env                        # Environment variables (create this)
├── .env.example                # Environment variables template
├── package.json                # Dependencies and scripts
├── postcss.config.js           # PostCSS configuration
├── vite.config.js              # Vite configuration
└── README.md                   # This file
```

## 🎨 Pages Overview

### Dashboard
- Overview statistics (total unclaimed, pending, collections, revenue)
- Recent unclaimed items table
- Quick action buttons

### Unclaimed
- Full table of unclaimed items
- Search and filter functionality
- Mark items as collected
- Delete items
- Summary statistics

### Pending
- Items overdue by more than 3 days
- Categorized by severity (recently, moderately, severely overdue)
- Alert banner for attention
- Summary by category

### Collections
- All collected winnings
- Filter by franchise and collector
- Financial breakdown (amount, charges, net)
- Revenue summaries

### Reports
- Distribution breakdown (10% staff, 10% collector, 30% agent, 50% admin)
- Filter by collector and area
- Total distribution summaries

### Users
- User management table
- Filter by role and status
- Toggle user status (active/inactive)
- Delete users
- User statistics

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎯 Key Features

### Authentication
- Secure login with Supabase
- Session persistence with localStorage
- Automatic last login tracking
- Protected routes

### Data Management
- Real-time data from Supabase
- CRUD operations for all entities
- Optimistic UI updates
- Error handling

### UI/UX
- Modern gradient designs
- Glassmorphism effects
- Smooth animations and transitions
- Responsive tables
- Mobile-friendly navigation
- Loading states
- Empty states

## 🔐 Security Notes

**IMPORTANT**: The current implementation uses plain text passwords for demonstration purposes. In production, you should:

1. Use Supabase Auth instead of custom authentication
2. Implement proper password hashing (bcrypt)
3. Add JWT tokens for session management
4. Implement proper Row Level Security (RLS) policies
5. Add input validation and sanitization
6. Implement rate limiting

## 📝 Database Schema

The application connects to the following Supabase tables:

- `Users` - System users and authentication
- `Unclaimed` - Unclaimed winning items
- `Pending` - Items overdue by 3+ days
- `OverAllCollections` - All collected items
- `5ARoyalCollections` - 5A Royal franchise collections
- `GlowingFortuneCollections` - Glowing Fortune franchise collections
- `ImperialCollections` - Imperial franchise collections
- `Reports` - Distribution reports

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

## 🐛 Troubleshooting

### Supabase Connection Issues
- Verify your `.env` file has the correct credentials
- Check that your Supabase project is active
- Ensure RLS policies allow authenticated access

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

### Styling Issues
- Ensure Tailwind CSS is properly configured
- Check that `@import "tailwindcss"` is in `index.css`
- Verify PostCSS configuration

## 📄 License

This project is for internal use only.

## 👥 Support

For issues or questions, contact your system administrator.
