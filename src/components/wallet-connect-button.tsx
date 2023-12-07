import { useAuth } from '@micro-stacks/react';
import { Button } from './ui/button';

export const WalletConnectButton = () => {
  const { openAuthRequest, isRequestPending, signOut, isSignedIn } = useAuth();
  const label = isRequestPending
    ? 'Loading...'
    : isSignedIn
    ? 'Sign out'
    : 'Connect Stacks wallet';
  return (
    <Button
      onClick={async () => {
        if (isSignedIn) await signOut();
        else await openAuthRequest();
      }}
    >
      {label}
    </Button>
  );
};
