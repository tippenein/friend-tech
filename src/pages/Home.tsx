import { useState, type JSX } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '@/components/ui/input';
import { truncateAddress } from '@/lib/utils';
import { useOpenContractCall } from '@micro-stacks/react';
import { StacksDevnet, StacksMocknet } from '@stacks/network';
import { openSignatureRequestPopup } from '@stacks/connect';
import { verifyMessageSignatureRsv } from '@stacks/encryption';
import { AnchorMode, createStacksPrivateKey, cvToValue, getAddressFromPublicKey, makeContractCall, privateKeyToString } from '@stacks/transactions';
import {
  callReadOnlyFunction,
  standardPrincipalCV
} from '@stacks/transactions';
import { principalCV, uintCV } from 'micro-stacks/clarity';

const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
export const Home = () => {
  const { openContractCall, isRequestPending } = useOpenContractCall();
  const [address, setAddress] = useState('');
  const [isKeyHolder, setIsKeyHolder] = useState(false);
  const [openChat, setOpenChat] = useState(false);

  // const onChatLoginRequest = () => {
  //   const message = 'Log in to chatroom';
  //   const network = new StacksDevnet();

  //   openSignatureRequestPopup({
  //     message,
  //     network,
  //     onFinish: async ({ publicKey, signature }) => {
  //       const verified = verifyMessageSignatureRsv({
  //         message,
  //         publicKey,
  //         signature
  //       });
  //       if (verified) {
  //         // The signature is verified, so now we can check if the user is a keyholder
  //         const address = getAddressFromPublicKey(publicKey, network.version);
  //         const isKeyHolder = await checkIsKeyHolder(address);
  //         if (isKeyHolder) {
  //           console.log('in!');
  //           setOpenChat(true);
  //         }
  //       }
  //     }
  //   });
  // };

  const checkIsKeyholder = async (address: string): Promise<boolean> => {
    const contractName = 'keys';
    const functionName = 'is-keyholder';
    const network = new StacksMocknet();

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
    console.log(res);
    setIsKeyHolder(res);
    return res;
  };

  const key = 'b244296d5907de9864c0b0d51f98a13c52890be0404e83f273144cd5b9960eed01'
  const senderKey = createStacksPrivateKey(key);
  const buyKeys = async (address: string, amount: number) => {
    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: 'keys',
      functionName: 'buy-keys',
      functionArgs: [standardPrincipalCV(address), uintCV(1)],
      senderKey: privateKeyToString(senderKey),
      validateWithAbi: true,
      network: new StacksMocknet(),
      postConditions: [],
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
      console.log('called check');
    };

  // const onChatLoginRequest = () => {
  //   const message = 'Log in to chatroom';
  //   const network = new StacksMocknet();

  //   openSignatureRequestPopup({
  //     message,
  //     network,
  //     onFinish: async ({ publicKey, signature }) => {
  //       const verified = verifyMessageSignatureRsv({
  //         message,
  //         publicKey,
  //         signature
  //       });
  //       if (verified) {
  //         // The signature is verified, so now we can check if the user is a keyholder
  //         const address = getAddressFromPublicKey(publicKey, network.version);
  //         const isKeyHolder = await checkIsKeyholder(address);
  //         if (isKeyHolder) {
  //           console.log('in!');
  //           setOpenChat(true);
  //         }
  //       }
  //     }
  //   });
  // };

  return (
    <>
      <h2>Friends</h2>
      {address && <span>{truncateAddress(address)}</span>}
      <div className="h-60 sm:h-72 flex items-center justify-center">
        <div className="py-4">
          <label htmlFor="address">Address</label>
          <Input
            type="text"
            id="address"
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address"
          />
          <div className="px-4 py-4 flex justify-between">
            <Button onClick={() => checkIsKeyholder(address)}>
              Check Key Holder
            </Button>
            {address && (
              <div className='ml-auto'>
                <Button onClick={() => buyKeys(address, 1)}>Buy a key</Button>
              </div>
            )}
          </div>
          {isKeyHolder && (
            <p>You are a key holder for {truncateAddress(address)}</p>
          )}
        </div>
        <div>{openChat && <p> opened</p>}</div>
      </div>
    </>
  );
};
