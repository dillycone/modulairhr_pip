import AuthDebugger from '@/components/debug/auth-status';
import SessionRefreshButton from '@/components/auth/session-refresh';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>
      <p className="mb-6">Use this page to debug authentication and permissions issues.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Session Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              If you're seeing "Unauthorized" errors in your application, your server-side session might be missing or invalid. Use the button below to fix your session.
            </p>
            <div className="max-w-xs">
              <SessionRefreshButton />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <AuthDebugger />
    </div>
  );
} 