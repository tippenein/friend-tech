import { describe, expect, it } from 'vitest';
import { initSimnet } from '@hirosystems/clarinet-sdk';
import { Cl, cvToValue } from '@stacks/transactions';

const simnet = await initSimnet();
const accounts = simnet.getAccounts();
const address1 = accounts.get('wallet_1')!;
const friendHaver = accounts.get('wallet_2')!;
const friendless = accounts.get('wallet_3')!;

// https://docs.hiro.so/clarinet/feature-guides/test-contract-with-clarinet-sdk
describe('Keys', () => {
  buyKeys(address1, address1, 2);
  buyKeys(friendHaver, address1, 3);
  it('ensures simnet is well initalised', () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  describe('.is-keyholder', () => {
    it('checks is-keyholder falsey', () => {
      const result = isKeyHolder(friendless, address1);
      expect(result).toBeFalsy();
      const self = isKeyHolder(friendHaver, address1);
      expect(self).toBeTruthy();
    });

    it('checks key supply', () => {
      const { result } = simnet.callReadOnlyFn(
        'keys',
        'get-keys-supply',
        [Cl.standardPrincipal(address1)],
        address1
      );
      expect(result).toStrictEqual(Cl.uint(5));
    });
    it('checks friend holder', () => {
      // friendHaver buys a key for address1
      // is now a key holder
      const p = isKeyHolder(friendHaver, address1);
      expect(p).toBeTruthy();
    });
  });

  describe('buy/sell', () => {
    it('can sell', () => {
      sellKeys(friendHaver, address1, 1);
      const stillHolding = isKeyHolder(friendHaver, address1);
      console.log(stillHolding)
      expect(stillHolding).toBeTruthy();
    });
  });
});

// HELPERS
const buyKeys = (purchaser, subject, amount) => {
  const { result } = simnet.callPublicFn(
    'keys',
    'buy-keys',
    [Cl.standardPrincipal(subject), Cl.uint(amount)],
    purchaser
  );
  return result;
};
const sellKeys = (seller, subject, amount) => {
  const { result } = simnet.callPublicFn(
    'keys',
    'buy-keys',
    [Cl.standardPrincipal(subject), Cl.uint(amount)],
    seller
  );
  return result;
};

const isKeyHolder = (caller, subject) => {
  const { result } = simnet.callReadOnlyFn(
    'keys',
    'is-keyholder',
    [Cl.standardPrincipal(subject), Cl.standardPrincipal(caller)],
    caller
  );
  return cvToValue(result);
};
