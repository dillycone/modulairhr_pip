import React from 'react';
import { Button } from '@/components/ui/button';

// Social provider icons
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24Z" 
      fill="currentColor" 
    />
  </svg>
);

interface SocialLoginButtonsProps {
  /**
   * Function to handle the social login action
   */
  onSocialLogin: (provider: 'google') => Promise<void>;
  /**
   * Whether the buttons should be in loading state
   */
  isLoading?: boolean;
}

/**
 * A component that displays social login buttons
 */
export function SocialLoginButtons({ onSocialLogin, isLoading = false }: SocialLoginButtonsProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-muted" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          className="bg-white w-full max-w-xs"
          onClick={() => onSocialLogin('google')}
        >
          <GoogleIcon />
          <span className="ml-2">Google</span>
        </Button>
      </div>
    </div>
  );
} 