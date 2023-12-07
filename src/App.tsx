import { ReactElement } from 'react';
import * as MicroStacks from '@micro-stacks/react';

import { WalletConnectButton } from '@/components/wallet-connect-button';

import { Home } from './pages/Home';

function App(): ReactElement {
  return (
    <MicroStacks.ClientProvider appName="Friends.stx" appIconUrl="favicon.ico">
      <div className="flex items-center justify-center min-h-screen">
        <div className="mx-auto max-w-2xl px-4">
          <WalletConnectButton />
          <div className="rounded-lg border bg-background p-8">
            <Home />
          </div>
        </div>
      </div>
    </MicroStacks.ClientProvider>
  );
}

export default App;
