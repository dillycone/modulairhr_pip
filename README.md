# DevPIP - Performance Improvement Plan Manager

DevPIP is a comprehensive web application designed to streamline the creation and management of Performance Improvement Plans (PIPs) for HR professionals and managers.

## Features

- **Custom Email Templates**: Implemented custom welcome email for new users with enhanced styling and branding
- **PIP Creation Wizard**: Multi-step guided process for creating PIPs
- **AI-Assisted Content Generation**: Generate content for PIPs from transcripts, notes or templates
- **Template Management**: Create, customize, and save PIP templates
- **Dashboard**: Track all active PIPs, progress, and upcoming milestones
- **User Authentication**: Secure login, registration, and account management

## Tech Stack

- **Frontend**: Next.js 14 with App Router, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: React Context and Hooks
- **UI Components**: Shadcn/UI
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication Features

- Email verification with custom welcome email template
- Password reset workflow
- Session management and protected routes
- Role-based access control

## Deployment

The application can be deployed on Vercel or any other platform that supports Next.js applications.

```bash
npm run build
npm run start
```

## License

This project is for demonstration purposes only.