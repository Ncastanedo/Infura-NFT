import { config as loadEnv } from 'dotenv';
import { faker } from '@faker-js/faker';
import { BigNumber, utils } from 'ethers';

import Auth from '../../src/lib/Auth/Auth';
import { SDK } from '../../src/lib/SDK/sdk';
import { TEMPLATES } from '../../src/lib/NFT/constants';
import ERC721UserMintable from '../../src/lib/ContractTemplates/ERC721UserMintable';

loadEnv();
let sdk: SDK;
let account: Auth;
let contractObject: ERC721UserMintable;
let publicAddress: string;
let owner: string;
let thirdUser: string;
let privateKeyPublicAddress: string;

describe('E2E Test: User Payable NFT (write)', () => {
  jest.setTimeout(120 * 1000);

  beforeAll(async () => {
    // grab the first account
    // eslint-disable-next-line global-require
    const { addresses: addr, private_keys: pk } = require('../keys.json');
    [owner, publicAddress, thirdUser] = Object.keys(addr);
    const privateKey = pk[owner];
    privateKeyPublicAddress = pk[publicAddress];

    const rpcUrl = 'http://0.0.0.0:8545';
    const chainId = 5;
    const projectId = process.env.INFURA_PROJECT_ID;
    const secretId = process.env.INFURA_PROJECT_SECRET;

    account = new Auth({
      privateKey,
      projectId,
      secretId,
      rpcUrl,
      chainId,
    });

    sdk = new SDK(account);
    contractObject = await sdk.deploy({
      template: TEMPLATES.ERC721UserMintable,
      params: {
        name: 'Payable Mint Contract',
        symbol: 'PYMC',
        contractURI: faker.internet.url(),
        baseURI: faker.internet.url(),
        maxSupply: 10,
        price: '0.00001',
        maxTokenRequest: 1,
      },
    });
  });

  it('should return deployed contract', async () => {
    expect(contractObject.contractAddress).not.toBe(null);
  });

  it('should return loaded contract', async () => {
    const loadedContract = await sdk.loadContract({
      template: TEMPLATES.ERC721UserMintable,
      contractAddress: contractObject.contractAddress,
    });

    expect(loadedContract).not.toBe(null);
  });

  it('should reserve an nft', async () => {
    const tx = await contractObject.reserve({
      quantity: 1,
    });

    const receipt = await tx.wait();
    expect(receipt.status).toEqual(1);
  });

  it('should transfer nft', async () => {
    const tx = await contractObject.baseERC721.transfer({
      from: owner,
      to: publicAddress,
      tokenId: 0,
    });

    const receipt = await tx.wait();

    expect(receipt.status).toEqual(1);
  });

  it('should set contract URI', async () => {
    const tx = await contractObject.baseERC721.setContractURI({
      contractURI:
        'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
    });
    const receipt = await tx.wait();
    expect(receipt.status).toEqual(1);
  });

  it('should set base URI', async () => {
    const tx = await contractObject.setBaseURI({
      baseURI: 'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
    });
    const receipt = await tx.wait();
    expect(receipt.status).toEqual(1);
  });

  it('should set price', async () => {
    const loadedContractObject = await sdk.loadContract({
      template: TEMPLATES.ERC721UserMintable,
      contractAddress: contractObject.contractAddress,
    });

    const tx = await loadedContractObject.setPrice({
      price: '0.00002',
    });
    const receipt = await tx.wait();

    expect(receipt.status).toEqual(1);

    const price = await contractObject.price();
    expect(price).toEqual('0.00002');
  });

  it('should toggle sale', async () => {
    const tx = await contractObject.toggleSale();
    const receipt = await tx.wait();

    expect(receipt.status).toEqual(1);
  });

  it('should reveal the contract base URI', async () => {
    const loadedContractObject = await sdk.loadContract({
      template: TEMPLATES.ERC721UserMintable,
      contractAddress: contractObject.contractAddress,
    });
    const tx = await loadedContractObject.reveal({
      baseURI: 'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
    });
    const receipt = await tx.wait();

    expect(receipt.status).toEqual(1);
  });

  it('should mint nft', async () => {
    const tx = await contractObject.mint({
      quantity: 1,
      cost: '0.00002',
    });

    const receipt = await tx.wait();
    expect(receipt.status).toEqual(1);
  });

  it('should set approval for all', async () => {
    const loadedContractObject = await sdk.loadContract({
      template: TEMPLATES.ERC721UserMintable,
      contractAddress: contractObject.contractAddress,
    });
    const tx = await loadedContractObject.baseERC721.setApprovalForAll({
      to: publicAddress,
      approvalStatus: true,
    });
    const receipt = await tx.wait();

    expect(receipt.status).toEqual(1);
  });

  it('should transfer nft with approval', async () => {
    // owner mints a token to themselves
    const tx = await contractObject.mint({
      quantity: 1,
      cost: '0.00002',
    });

    await tx.wait();

    // owner approves publicAddress to transfer token that he owns
    const txApprove = await contractObject.baseERC721.approveTransfer({
      to: publicAddress,
      tokenId: 1,
    });

    await txApprove.wait();

    const accountPublic = new Auth({
      privateKey: privateKeyPublicAddress,
      projectId: process.env.INFURA_PROJECT_ID,
      secretId: process.env.INFURA_PROJECT_SECRET,
      rpcUrl: 'http://0.0.0.0:8545',
      chainId: 5,
    });

    const sdkPublic = new SDK(accountPublic);

    const existing = await sdkPublic.loadContract({
      template: TEMPLATES.ERC721UserMintable,
      contractAddress: contractObject.contractAddress,
    });

    // publicAddress transfers token of owner
    const txTransfer = await existing.baseERC721.transfer({
      from: owner,
      to: thirdUser,
      tokenId: 1,
    });

    const receipt = await txTransfer.wait();

    expect(receipt.status).toEqual(1);
  });

  it('should return setRoyalties', async () => {
    await contractObject.royalty.setRoyalties({ publicAddress, fee: 1000 });
    const infos = await contractObject.royalty.royaltyInfo({ tokenId: 1, sellPrice: 10 });

    expect(infos).toStrictEqual([utils.getAddress(publicAddress), BigNumber.from('1')]);
  });

  it('should return setRoyalties when tokenId is zero', async () => {
    await contractObject.royalty.setRoyalties({ publicAddress, fee: 1000 });
    const infos = await contractObject.royalty.royaltyInfo({ tokenId: 0, sellPrice: 10 });

    expect(infos).toStrictEqual([utils.getAddress(publicAddress), BigNumber.from('1')]);
  });

  it('should renounce contract ownership', async () => {
    const result = await contractObject.baseERC721.renounceOwnership({});
    const receipt = await result.wait();

    expect(receipt.status).toBe(1);
  });
});
