# QRky

**QRky** is a modern QR code generation and URL shortening service built with Next.js, featuring beautifully styled QR codes with rounded corners, embedded logos, and comprehensive analytics tracking.

![QRky Logo](public/qr-logo-round.svg)

## ✨ Features

- 🎨 **Custom Styled QR Codes** - Generate QR codes with rounded corners and embedded logos
- 🔗 **URL Shortening** - Create short, memorable links with custom identifiers
- 📊 **Analytics Tracking** - Track views, IP addresses, and user agents
- 🔐 **User Authentication** - Secure user registration and login with Supabase Auth
- 📱 **Responsive Design** - Built with Tailwind CSS and DaisyUI

## 🚀 Quick Start

### Prerequisites

- Node.js 22.18.0 or higher
- pnpm 10.16.0 or higher
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/qrky.git
   cd qrky
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Creating a QR Code

```typescript
import { QRCode, ECC_H } from '@chillerlan/qrcode/dist/js-qrcode-node-src.cjs';
import { QRkySVG, QRkyOptions } from '@/lib/qrcode';

const options = new QRkyOptions({
    outputInterface: QRkySVG,
    eccLevel: ECC_H,
    circleRadius: 0.45,              // Corner roundness (0-0.5)
    svgLogo: '/qr-logo-round.svg',   // Optional logo
    clearLogoSpace: true,             // Clear space for logo
    svgLogoScale: 0.35,               // Logo size (10-30% recommended)
    svgViewBoxSize: 1920,             // SVG dimensions
    addQuietzone: true,
});

const qrcode = new QRCode(options).render('https://example.com');
```

### URL Shortening Patterns

QRky supports multiple URL patterns:

- **QR Code IDs**: `/q/{identifier}` - For QR code-specific identifiers
- **URL Objects**: `/u/{identifier}` - For general shortened URLs
- **Dynamic QR SVG**: `/qr/{uuid}/route.ts` - Generates QR code SVGs on-demand

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 16.0 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19.2
- **Styling**: Tailwind CSS 4 + DaisyUI 5.3
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **QR Generation**: Custom TypeScript port of `@chillerlan/qrcode`
- **Icons**: React Icons

### Project Structure

```
qrky/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── dashboard/             # User dashboard
│   │   │   ├── layout.tsx         # Dashboard layout with sidebar
│   │   │   └── user/              # User profile management
│   │   ├── auth/                  # Auth confirmation routes
│   │   ├── login/                 # Login page
│   │   ├── register/              # Registration page
│   │   ├── q/[identifier]/        # QR code redirects
│   │   ├── u/[identifier]/        # URL object redirects
│   │   └── qr/[uuid]/route.ts     # Dynamic QR SVG generation
│   │
│   ├── components/                # React components
│   │   ├── auth/                  # Authentication forms
│   │   └── ui/                    # Reusable UI components
│   │
│   ├── lib/                       # Shared utilities
│   │   ├── qrcode/                # Custom QR code library
│   │   │   ├── QRkySVG.ts        # SVG renderer with rounded corners
│   │   │   ├── QRkyOptions.ts    # Options class with validation
│   │   │   └── module-type.enum.ts # Module connection patterns
│   │   ├── supabase/              # Supabase clients
│   │   ├── auth.ts                # Auth utilities
│   │   └── record-view.ts         # Analytics tracking
│   │
│   └── interfaces/                # TypeScript interfaces
│
├── public/                        # Static assets
├── supabase/                      # Supabase migrations
└── Configuration files
```

## 📊 Analytics

QRky tracks the following metrics:
- **View counts** - Total views per QR code/URL
- **IP addresses** - Visitor locations
- **User agents** - Browser and device information
- **Timestamps** - When views occurred

## 🔐 Authentication

Features include:
- User registration with email verification
- Secure login with password hashing
- Password reset via email
- Profile management with user metadata
- Reauthentication flow for password changes

## 🛠️ Development

### Scripts

```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

### Database Setup

1. Set up a Supabase project
2. Run migrations from `supabase/migrations/`
3. Configure authentication providers
4. Set up Row Level Security (RLS) policies

## 📝 Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only) |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

Copyright (C) QRky - All Rights Reserved
Unauthorized copying of any files in this repository, via any medium is strictly prohibited
Proprietary and confidential
Written by Bernardus van der Merwe [@BvdMerwe](https://github.com/BvdMerwe), October 2025

## 🙏 Acknowledgments

- QR code generation based on [`@chillerlan/qrcode`](https://github.com/chillerlan/js-qrcode)
- UI components from [DaisyUI](https://daisyui.com/)
- Backend powered by [Supabase](https://supabase.com/)

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Supabase
