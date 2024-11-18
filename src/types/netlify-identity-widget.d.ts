interface Window {
  netlifyIdentity: {
    on: (event: string, callback: (user?: any) => void) => void;
    open: (type?: 'login' | 'signup') => void;
    logout: () => void;
  }
} 