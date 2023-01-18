import { config as loadEnv } from 'dotenv';
import { AxiosResponse } from 'axios';
import { ethers } from 'ethers';
import { faker } from '@faker-js/faker';

import Auth from '../src/lib/Auth/Auth';
import HttpService from '../src/services/httpService';
import version from '../src/_version';

import {
  accountNFTsMock,
  accountNFTsMockWithoutCursor,
  collectionNFTsMock,
  collectionNFTsMockWithoutCursor,
  contractMetadataMock,
  tokenMetadataMock,
  transferByBlockHashNumberMock,
} from './__mocks__/api';
import { CONTRACT_ADDRESS, generateTestPrivateKeyOrHash } from './__mocks__/utils';
import { NFT_API_URL } from '../src/lib/constants';
import Api, {
  GetNftTransfersByWallet,
  GetTransfersByBlockHashOptions,
  GetNftTransfersFromBlockToBlock,
  GetTransfersByBlockNumberOptions,
} from '../src/lib/Api/api';

loadEnv();

describe('Api', () => {
  jest.setTimeout(120 * 1000);
  let signerMock: jest.SpyInstance<ethers.Wallet | ethers.providers.JsonRpcSigner, []>;
  jest.mock('ethers');
  const HttpServiceMock = jest
    .spyOn(HttpService.prototype, 'get')
    .mockImplementation(() => jest.fn() as unknown as Promise<AxiosResponse<any, any>>);

  let api: Api;
  beforeAll(() => {
    const account = new Auth({
      privateKey: generateTestPrivateKeyOrHash(),
      projectId: process.env.INFURA_PROJECT_ID,
      secretId: process.env.INFURA_PROJECT_SECRET,
      rpcUrl: process.env.EVM_RPC_URL,
      chainId: 5,
      ipfs: {
        projectId: faker.datatype.uuid(),
        apiKeySecret: faker.datatype.uuid(),
      },
    });

    const apiPath = '/networks/5';
    const httpClient = new HttpService(NFT_API_URL, account.getApiAuth());
    api = new Api(apiPath, httpClient);

    signerMock = jest.spyOn(account, 'getSigner').mockImplementation(
      () =>
        ({
          provider: {
            getTransactionReceipt: () => ({
              status: 1,
            }),
          },
        } as unknown as ethers.providers.JsonRpcSigner),
    );
  });

  afterEach(() => {
    HttpServiceMock.mockClear();
    HttpServiceMock.mockClear();
    signerMock.mockClear();
  });

  describe('getContractMetadata', () => {
    it('should throw when "contractAddress" is not a valid address', async () => {
      await expect(() =>
        api.getContractMetadata({ contractAddress: 'notAValidAddress' }),
      ).rejects.toThrow(
        `missing argument: Invalid contract address. (location="[SDK.getContractMetadata]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return contract metadata', async () => {
      HttpServiceMock.mockResolvedValueOnce(contractMetadataMock as AxiosResponse<any, any>);
      const contractMetadata = await api.getContractMetadata({
        contractAddress: '0xE26a682fa90322eC48eB9F3FA66E8961D799177C',
      });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
      expect(contractMetadata).not.toHaveProperty('contract');
    });
  });

  describe('getNFTs', () => {
    it('should throw when "address" is not a valid address', async () => {
      await expect(() => api.getNFTs({ publicAddress: 'notAValidAddress' })).rejects.toThrow(
        `missing argument: Invalid public address. (location="[SDK.getNFTs]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return the list of NFTs without metadata', async () => {
      HttpServiceMock.mockResolvedValueOnce(accountNFTsMock as AxiosResponse<any, any>);
      const accountNFTs = await api.getNFTs({ publicAddress: CONTRACT_ADDRESS });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
      expect((accountNFTs as any).assets[0]).not.toHaveProperty('metadata');
    });

    it('should return the list of NFTs with metadata', async () => {
      HttpServiceMock.mockResolvedValueOnce(accountNFTsMock as AxiosResponse<any, any>);
      const accountNFTs = await api.getNFTs({
        publicAddress: CONTRACT_ADDRESS,
        includeMetadata: true,
      });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
      expect((accountNFTs as any).assets[0]).toHaveProperty('metadata');
    });

    it('should return the list of NFTs with metadata and with cursor', async () => {
      HttpServiceMock.mockResolvedValueOnce(
        accountNFTsMockWithoutCursor as AxiosResponse<any, any>,
      );
      const accountNFTs = await api.getNFTs({
        publicAddress: CONTRACT_ADDRESS,
        includeMetadata: true,
        cursor: 'test',
      });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
      expect((accountNFTs as any).assets[0]).toHaveProperty('metadata');
      expect((accountNFTs as any).cursor).toBe(null);
    });
  });

  describe('getNFTsForCollection', () => {
    it('should throw when "contractAddress" is not a valid address', async () => {
      await expect(() =>
        api.getNFTsForCollection({ contractAddress: 'notAValidAddress' }),
      ).rejects.toThrow(
        `missing argument: Invalid contract address. (location="[SDK.getNFTsForCollection]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return return collection NFTs list', async () => {
      HttpServiceMock.mockResolvedValueOnce(collectionNFTsMock as AxiosResponse<any, any>);
      await api.getNFTsForCollection({ contractAddress: CONTRACT_ADDRESS });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });

    it('should return the collection NFT list without cursor', async () => {
      HttpServiceMock.mockResolvedValueOnce(
        collectionNFTsMockWithoutCursor as AxiosResponse<any, any>,
      );
      const nftCollection = await api.getNFTsForCollection({
        contractAddress: CONTRACT_ADDRESS,
        cursor: 'test',
      });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
      expect((nftCollection as any).cursor).toBe(null);
    });
  });

  describe('getTokenMetadata', () => {
    it('should throw when "contractAddress" is not a valid address', async () => {
      await expect(() =>
        api.getTokenMetadata({ contractAddress: 'notAValidAddress', tokenId: 1 }),
      ).rejects.toThrow(
        `missing argument: Invalid contract address. (location="[SDK.getTokenMetadata]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return token metadata', async () => {
      HttpServiceMock.mockResolvedValueOnce(tokenMetadataMock as AxiosResponse<any, any>);
      await api.getTokenMetadata({ contractAddress: CONTRACT_ADDRESS, tokenId: 1 });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTransfersByBlockNumber', () => {
    it('should throw when block number not provided', async () => {
      await expect(() =>
        api.getTransfersByBlockNumber({} as GetTransfersByBlockNumberOptions),
      ).rejects.toThrow(
        `missing argument: Invalid block number. (location="[SDK.getTransfersByBlockNumber]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return transfers', async () => {
      HttpServiceMock.mockResolvedValueOnce(
        transferByBlockHashNumberMock as AxiosResponse<any, any>,
      );
      await api.getTransfersByBlockNumber({ blockNumber: '125' });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTransfersByBlockHash', () => {
    it('hould throw when block hash not provided', async () => {
      await expect(() =>
        api.getTransfersByBlockHash({} as GetTransfersByBlockHashOptions),
      ).rejects.toThrow(
        `missing argument: Invalid block hash. (location="[SDK.getTransfersByBlockHash]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return transfers', async () => {
      HttpServiceMock.mockResolvedValueOnce(
        transferByBlockHashNumberMock as AxiosResponse<any, any>,
      );
      await api.getTransfersByBlockHash({
        blockHash: '0x759d8cb3930463fc0a0b6d6e30b284a1466cb7c590c21767f08a37e34fd583b1',
      });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTransfersFromBLockToBLock', () => {
    it('should throw when block number not provided', async () => {
      await expect(() =>
        api.getTransferFromBlockToBlock({} as GetNftTransfersFromBlockToBlock),
      ).rejects.toThrow(
        `missing argument: Invalid block number (location=\"[SDK.getTransferFromBlockToBlock]\", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return transfers', async () => {
      HttpServiceMock.mockResolvedValueOnce(
        transferByBlockHashNumberMock as AxiosResponse<any, any>,
      );
      await api.getTransferFromBlockToBlock({ fromBlock: 16026179, toBlock: 16026190 });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTransfersByWallet', () => {
    it('should throw when wallet address is not provided', async () => {
      await expect(() =>
        api.getNftsTransfersByWallet({} as GetNftTransfersByWallet),
      ).rejects.toThrow(
        `missing argument: Invalid account address. (location="[SDK.getNftTransfersByWallet]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });
    it('should throw when "walletAddress" is not a valid address', async () => {
      await expect(() =>
        api.getNftsTransfersByWallet({ walletAddress: 'notAValidAddress' }),
      ).rejects.toThrow(
        `missing argument: Invalid account address. (location="[SDK.getNftTransfersByWallet]", code=MISSING_ARGUMENT, version=${version})`,
      );
    });

    it('should return transfers', async () => {
      HttpServiceMock.mockResolvedValueOnce(
        transferByBlockHashNumberMock as AxiosResponse<any, any>,
      );
      await api.getNftsTransfersByWallet({ walletAddress: CONTRACT_ADDRESS });
      expect(HttpServiceMock).toHaveBeenCalledTimes(1);
    });
  });
});