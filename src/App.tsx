import React, { ReactElement, useState } from 'react';
import { StacksDevnet, StacksMainnet } from '@stacks/network';
import {
  callReadOnlyFunction,
  uintCV,
  makeContractCall,
  standardPrincipalCV,
  cvToValue,
  getPublicKey
} from '@stacks/transactions';
import {
  AppConfig,
  FinishedAuthData,
  showConnect,
  UserSession
} from '@stacks/connect';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { truncateAddress } from './lib/utils';
import { openSignatureRequestPopup } from '@stacks/connect';
import { getPublicKeyFromPrivate, verifyMessageSignatureRsv } from '@stacks/encryption';
import { StacksMocknet } from '@stacks/network';
import { getAddressFromPublicKey } from '@stacks/transactions';
import { bool } from '@stacks/transactions/dist/cl';

const NETWORK = 'devnet';

const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
function App(): ReactElement {
  const [address, setAddress] = useState('');
  const [isKeyHolder, setIsKeyHolder] = useState(false);
  const [openChat, setOpenChat] = useState(false);

  // Initialize your app configuration and user session here
  const appConfig = new AppConfig(['store_write', 'publish_data']);
  const userSession = new UserSession({ appConfig });

  const onChatLoginRequest = () => {
    const message = 'Log in to chatroom';
    const network = new StacksDevnet();

    openSignatureRequestPopup({
      message,
      network,
      onFinish: async ({ publicKey, signature }) => {
        const verified = verifyMessageSignatureRsv({
          message,
          publicKey,
          signature
        });
        if (verified) {
          // The signature is verified, so now we can check if the user is a keyholder
          const address = getAddressFromPublicKey(publicKey, network.version);
          const isKeyHolder = await checkIsKeyHolder(address);
          if (isKeyHolder) {
            console.log('in!');
            setOpenChat(true);
          }
        }
      }
    });
  };
  // Define your authentication options here
  const authOptions = {
    userSession,
    appDetails: {
      name: 'Friends.stx',
      icon: 'src/favicon.svg'
    },
    onFinish: (data: FinishedAuthData) => {
      // Handle successful authentication here
      const userData = data.userSession.loadUserData();
      setAddress(userData.profile.stxAddress.devnet); // or .testnet for testnet
    },
    onCancel: () => {
      // Handle authentication cancellation here
    },
    redirectTo: '/'
  };


  const buyKeys = async (address: string, amount: number) => {
    const network = new StacksDevnet();
    const result = await makeContractCall({
      network,
      contractAddress: CONTRACT_ADDRESS,
      contractName: 'keys',
      functionName: 'buy-keys',
      functionArgs: [standardPrincipalCV(address), uintCV(1)],
      publicKey: getPublicKeyFromPrivate('asdf')
    });
    console.log(cvToValue(result));
    setIsKeyHolder(cvToValue(result));
  };

  const checkIsKeyHolder = async (address: string): Promise<boolean> => {
    const contractName = 'keys';
    const functionName = 'is-keyholder';
    const network = 'devnet';

    const functionArgs = [
      standardPrincipalCV(CONTRACT_ADDRESS),
      standardPrincipalCV(address)
    ];

    const result = await callReadOnlyFunction({
      network,
      contractAddress: CONTRACT_ADDRESS,
      contractName,
      functionName,
      functionArgs,
      senderAddress: CONTRACT_ADDRESS
    });
    const res = cvToValue(result);
    setIsKeyHolder(res);
    return res;
  };

  const connectWallet = () => {
    showConnect(authOptions);
  };

  const disconnectWallet = () => {
    if (userSession.isUserSignedIn()) {
      userSession.signUserOut('/');
      setAddress('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="mx-auto px-4">
        <div className="rounded-lg border bg-background p-8">
          <h1 className="mb-2 text-lg font-semibold">Welcome to Friend.stx</h1>
          <div className="mt-4 flex flex-col items-start space-y-2">
            {userSession.isUserSignedIn() ? (
              <div className="flex justify-between w-full">
                <Button
                  onClick={disconnectWallet}
                  variant="link"
                  className="h-auto p-0 text-base"
                >
                  Disconnect wallet
                </Button>
                {address && <span>{truncateAddress(address)}</span>}
              </div>
            ) : (
              <Button
                onClick={connectWallet}
                variant="link"
                className="h-auto p-0 text-base"
              >
                Connect your wallet
                <ArrowRight size={15} className="ml-1" />
              </Button>
            )}
            {userSession.isUserSignedIn() && (
              <div>
                {address && (
                  <p>
                    {truncateAddress(address)} is {isKeyHolder ? '' : 'not'} a key holder
                  </p>
                )}
                <div className='py-4'>
                  <Input
                    type="text"
                    id="address"
                    name="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter address"
                  />
                  <Button onClick={() => checkIsKeyHolder(address)}>
                    Check Key Holder
                  </Button>
                </div>
                <div className='py-4'>
                  {address && (<Button onClick={() => buyKeys(address, 1)}>
                    Buy a key
                  </Button>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
