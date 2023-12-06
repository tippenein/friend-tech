import { describe, expect, it } from 'vitest';
import { initSimnet } from '@hirosystems/clarinet-sdk';
import { Cl } from '@stacks/transactions';

const simnet = await initSimnet();
const accounts = simnet.getAccounts();
const address1 = accounts.get('wallet_1')!;
const address2 = accounts.get('wallet_2')!;

// https://docs.hiro.so/clarinet/feature-guides/test-contract-with-clarinet-sdk

describe('Keys', () => {
  it('ensures simnet is well initalised', () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it('checks is-keyholder falsey', () => {
    const { result } = simnet.callReadOnlyFn(
      'keys',
      'is-keyholder',
      [Cl.standardPrincipal(address1), Cl.standardPrincipal(address2)],
      address1
    );
    expect(result).toStrictEqual(Cl.bool(false));
  });

  it('checks buy-keys', () => {
    simnet.callPublicFn(
      'keys',
      'buy-keys',
      [Cl.standardPrincipal(address1), Cl.uint(2)],
      address1
    );
    const { result } = simnet.callReadOnlyFn(
      'keys',
      'get-keys-supply',
      [Cl.standardPrincipal(address1)],
      address1
    );
    expect(result).toStrictEqual(Cl.uint(2));
    // address2 buys a key for address1
    simnet.callPublicFn(
      'keys',
      'buy-keys',
      [Cl.standardPrincipal(address1), Cl.uint(1)],
      address2
    );
    // is now a key holder
    const { result: p } = simnet.callReadOnlyFn(
      'keys',
      'is-keyholder',
      [Cl.standardPrincipal(address1), Cl.standardPrincipal(address2)],
      address2
    );
    expect(p).toStrictEqual(Cl.bool(true));
  });
});
