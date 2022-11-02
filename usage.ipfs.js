/*!
 * Copyright(c) ConsenSys Software Inc.
 * Copyright(c) https://consensys.net/
 * MIT Licensed
 */

/* eslint-disable */

import { config as loadEnv } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { SDK, Auth, Metadata, TEMPLATES } from './index.js';
loadEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const acc = new Auth({
  privateKey: process.env.WALLET_PRIVATE_KEY,
  projectId: process.env.INFURA_PROJECT_ID,
  secretId: process.env.INFURA_PROJECT_SECRET,
  rpcUrl: process.env.EVM_RPC_URL,
  chainId: 5,
  ipfs: {
    projectId: process.env.INFURA_IPFS_PROJECT_ID,
    apiKeySecret: process.env.INFURA_IPFS_PROJECT_SECRET,
  },
});

const sdk = new SDK(acc);

/**
 * METADATA
 */
// CREATE CONTRACT Metadata
const collectionMetadata = Metadata.openSeaCollectionLevelStandard({
  name: 'My awesome collection',
  description: "A long description explaining why it's awesome",
  image: await sdk.storeFile('https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png'),
  external_link: 'https://myawesomewebsite.net',
});

console.log('collectionMetadata ----', collectionMetadata);

/**
 * METADATA
 */
// CREATE Token Metadata
const tokenMetadata = Metadata.openSeaTokenLevelStandard({
  description: 'Friendly OpenSea Creature that enjoys long swims in the ocean.',
  external_url: 'https://openseacreatures.io/3',
  image: await sdk.storeFile('https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png'),
  name: 'Dave Starbelly',
  attributes: [],
});

console.log('tokenMetadata ----', tokenMetadata);

const storeMetadata = await sdk.storeMetadata(tokenMetadata);

const storeImageUrl = await sdk.storeFile(
  'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
);

const storeImageFile = await sdk.storeFile('./integration-test/ipfs-test/metamask.jpeg');

console.log('storeMetadata ----', storeMetadata);
console.log('storeImageUrl ----', storeImageUrl);
console.log('storeImageUrl ----', storeImageFile);

const storeArrayMetadata = await sdk.createFolder([
  Metadata.openSeaTokenLevelStandard({
    description: 'Friendly OpenSea Creature that enjoys long swims in the ocean.',
    external_url: 'https://openseacreatures.io/3',
    image: await sdk.storeFile(
      'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
    ),
    name: 'Dave Starbelly',
    attributes: [],
  }),
]);

console.log('storeArrayMetadata ----', storeArrayMetadata);
/**
 * METADATA
 */
// CREATE free Metadata
Metadata.freeLevelMetadata({
  test: 'test.',
});

// Create a new contract
const newContract = await sdk.deploy({
  template: TEMPLATES.ERC721Mintable,
  params: {
    name: '1507Contract',
    symbol: 'TOC',
    contractURI: collectionMetadata,
  },
});
console.log('contract address: \n', newContract.contractAddress);

// mint a NFT
const mint = await newContract.mint({
  publicAddress: process.env.WALLET_PUBLIC_ADDRESS,
  tokenURI: tokenMetadata,
});

const minted = await mint.wait();
console.log(minted);

// READ API
// Get contract metadata
const contractMetadata = await sdk.getContractMetadata({
  contractAddress: newContract.contractAddress,
});
console.log('contractMetadata', contractMetadata);

// Get the token metadata
const tokenMetadataResult = await sdk.getTokenMetadata({
  contractAddress: newContract.contractAddress,
  tokenId: 0,
});
console.log('tokenMetadataResult', tokenMetadataResult);
