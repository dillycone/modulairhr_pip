# ModulairHR PIP

A modern HR solution built with Next.js, Tailwind CSS, and Supabase.

## Features

- Modern UI with Tailwind CSS and Radix UI components
- Authentication with Supabase
- Responsive design
- Modular component architecture
- Theme support

## Project Structure

```
├── app/               # Next.js app directory
│   ├── api/           # API routes
│   ├── auth/          # Authentication pages
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Landing page
├── components/        # UI components
│   ├── ui/            # UI library components
│   └── ...            # Feature-specific components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and library configs
├── public/            # Static assets
└── styles/            # Additional styling
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/modulairhr_pip.git
cd modulairhr_pip
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Set up environment variables:
Copy the `.env.local.example` file to `.env.local` and update with your Supabase credentials.

4. Run the development server:
```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## License

[MIT](LICENSE) 