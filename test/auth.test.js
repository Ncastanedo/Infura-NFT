import { config as loadEnv } from 'dotenv';
import { ethers } from 'ethers';
import Auth from '../lib/Auth/index';

loadEnv();

describe('Auth', () => {
  it('should throw when args are missing (privateKey)', () => {
    expect(
      () =>
        // eslint-disable-next-line implicit-arrow-linebreak
        new Auth({
          privateKey: null,
          projectId: process.env.PROJECT_ID,
          secretId: process.env.SECRET_ID,
          rpcUrl: process.env.RPC_URL,
          chainId: 4,
        }),
    ).toThrow('[Auth.constructor] privateKey is missing!');
  });

  it('should throw when args are missing (projectId)', () => {
    expect(
      () =>
        // eslint-disable-next-line implicit-arrow-linebreak
        new Auth({
          privateKey: 'privateKey',
          secretId: process.env.SECRET_ID,
          rpcUrl: process.env.RPC_URL,
          chainId: 4,
        }),
    ).toThrow('[Auth.constructor] projectId is missing!');
  });

  it('should throw when args are missing (secretId)', () => {
    expect(
      () =>
        // eslint-disable-next-line implicit-arrow-linebreak
        new Auth({
          privateKey: 'privateKey',
          projectId: process.env.PROJECT_ID,
          rpcUrl: process.env.RPC_URL,
          chainId: 4,
        }),
    ).toThrow('[Auth.constructor] secretId is missing!');
  });

  it('should throw when args are missing (chainId)', () => {
    expect(
      () =>
        // eslint-disable-next-line implicit-arrow-linebreak
        new Auth({
          privateKey: 'privateKey',
          projectId: process.env.PROJECT_ID,
          secretId: process.env.SECRET_ID,
          rpcUrl: process.env.RPC_URL,
        }),
    ).toThrow('[Auth.constructor] chainId is missing!');
  });

  describe('getProvider', () => {
    it('Should throw and error when this.rpcUrl is null and injectedProvider params is undefined ', () => {
      const account = new Auth({
        privateKey: 'privateKey',
        projectId: process.env.PROJECT_ID,
        secretId: process.env.SECRET_ID,
        chainId: 4,
      });

      expect(() => account.getProvider()).toThrow(
        '[Auth.getProvider] You need to pass an rpcUrl to the constructor or pass an injected provider to this function!',
      );
    });

    it("Should return default provider when we don't pass the injectedProvider parameter", () => {
      const account = new Auth({
        privateKey: 'privateKey',
        projectId: process.env.PROJECT_ID,
        secretId: process.env.SECRET_ID,
        rpcUrl: process.env.RPC_URL,
        chainId: 4,
      });

      expect(account.getProvider()).toStrictEqual(
        // eslint-disable-next-line new-cap
        new ethers.providers.getDefaultProvider(process.env.RPC_URL),
      );
    });

    it('Should return Web3Provider when we pass the injectedProvider parameter', () => {
      const account = new Auth({
        privateKey: 'privateKey',
        projectId: process.env.PROJECT_ID,
        secretId: process.env.SECRET_ID,
        rpcUrl: process.env.RPC_URL,
        chainId: 4,
      });

      expect(account.getProvider(ethers.providers.Provider)).toStrictEqual(
        new ethers.providers.Web3Provider(ethers.providers.Provider),
      );
    });
  });

  describe('getSigner', () => {
    it('should throw when provider has not been set', () => {
      const account = new Auth({
        privateKey: 'privateKey',
        projectId: process.env.PROJECT_ID,
        secretId: process.env.SECRET_ID,
        rpcUrl: process.env.RPC_URL,
        chainId: 4,
      });
      expect(() => account.getSigner()).toThrow('[Auth.getSigner] You need to set a provider');
    });

    it('should return the signer', () => {
      const privateKey = '0xb40c8233a0c61ddf064e83b0cc29522b1e6ac6166965861fbc6cefdecbf53d63';
      const account = new Auth({
        privateKey: '0xb40c8233a0c61ddf064e83b0cc29522b1e6ac6166965861fbc6cefdecbf53d63',
        projectId: process.env.PROJECT_ID,
        secretId: process.env.SECRET_ID,
        rpcUrl: process.env.RPC_URL,
        chainId: 4,
      });
      const provider = account.getProvider();

      // eslint-disable-next-line new-cap
      expect(provider).toStrictEqual(new ethers.providers.getDefaultProvider(process.env.RPC_URL));
      expect(JSON.stringify(account.getSigner())).toStrictEqual(
        JSON.stringify(new ethers.Wallet(privateKey, provider)),
      );
    });
  });

  describe('getApiAuth', () => {
    it('should return the apiAuth key', () => {
      const account = new Auth({
        privateKey: 'privateKey',
        projectId: process.env.PROJECT_ID,
        secretId: process.env.SECRET_ID,
        rpcUrl: process.env.RPC_URL,
        chainId: 4,
      });

      expect(account.getApiAuth()).toStrictEqual(
        Buffer.from(`${process.env.PROJECT_ID}:${process.env.SECRET_ID}`).toString('base64'),
      );
    });
  });

  describe('getChainId', () => {
    it('should return the chainId', () => {
      const account = new Auth({
        privateKey: 'privateKey',
        projectId: process.env.PROJECT_ID,
        secretId: process.env.SECRET_ID,
        rpcUrl: process.env.RPC_URL,
        chainId: 4,
      });

      expect(account.getChainId()).toStrictEqual(4);
    });
  });

  describe('getApiAuthHeader', () => {
    it('should return the chainId', () => {
      const account = new Auth({
        privateKey: 'privateKey',
        projectId: process.env.PROJECT_ID,
        secretId: process.env.SECRET_ID,
        rpcUrl: process.env.RPC_URL,
        chainId: 4,
      });

      expect(account.getApiAuthHeader()).toStrictEqual({
        Authorization: `Basic ${Buffer.from(
          `${process.env.PROJECT_ID}:${process.env.SECRET_ID}`,
        ).toString('base64')}`,
      });
    });
  });
});
