import { ContractFactory, ethers } from 'ethers';
import ERC721Mintable from '../lib/ContractTemplates/ERC721Mintable/ERC721Mintable';
import { ACCOUNT_ADDRESS, CONTRACT_ADDRESS, ACCOUNT_ADDRESS_2 } from './__mocks__/utils';

let eRC721Mintable;
let signer;
let contractAddress;

jest.mock('ethers');

describe('SDK', () => {
  const contractFactoryMock = jest
    .spyOn(ContractFactory.prototype, 'deploy')
    .mockImplementation(() => ({
      deployed: () => ({
        mintWithTokenURI: () => ({}),
        'safeTransferFrom(address,address,uint256)': () => ({}),
        setContractURI: jest.fn(),
        grantRole: jest.fn(),
        revokeRole: jest.fn(),
        renounceRole: jest.fn(),
        hasRole: jest.fn(),
      }),
    }));

  jest.spyOn(ethers.utils, 'isAddress').mockImplementation(() => true);
  jest.spyOn(ethers, 'Contract').mockImplementation(() => ({}));

  beforeAll(() => {
    signer = 'signer';
  });

  afterEach(() => {
    contractFactoryMock.mockClear();
  });

  it('should create "ERC721Mintable" instance', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    expect(eRC721Mintable).not.toBe(null);
  });

  it('[Deploy] - should return an Error if signer not defined ', () => {
    eRC721Mintable = new ERC721Mintable(null, contractAddress);

    const contract = async () =>
      eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });

    expect(contract).rejects.toThrow(
      '[ERC721Mintable.deploy] Signer instance is required to interact with contract.',
    );
  });

  it('[Deploy] - should return an Error if Name is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer, contractAddress);

    const contract = async () =>
      eRC721Mintable.deploy({ name: '', symbol: 'symbol', contractURI: 'URI' });

    expect(contract).rejects.toThrow('[ERC721Mintable.deploy] Name cannot be empty');
  });

  it('[Deploy] - should return an Error if symbol is undefined', () => {
    eRC721Mintable = new ERC721Mintable(signer, contractAddress);

    const contract = async () => eRC721Mintable.deploy({ name: 'name', contractURI: 'URI' });

    expect(contract).rejects.toThrow('[ERC721Mintable.deploy] symbol cannot be undefined');
  });

  it('[Deploy] - should return an Error if contractURI is undefined', () => {
    eRC721Mintable = new ERC721Mintable(signer, contractAddress);

    const contract = async () => eRC721Mintable.deploy({ name: 'name', symbol: 'symbol' });

    expect(contract).rejects.toThrow('[ERC721Mintable.deploy] contractURI cannot be undefined');
  });

  it('[Deploy] - should return a contract', async () => {
    eRC721Mintable = new ERC721Mintable(signer, contractAddress);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });

    expect(ContractFactory.prototype.deploy).toHaveBeenCalledTimes(1);
  });

  it('[Mint] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const myNFT = async () =>
      eRC721Mintable.mint(ACCOUNT_ADDRESS, 'https://infura.io/images/404.png');
    expect(myNFT).rejects.toThrow(
      '[ERC721Mintable.mint] A contract should be deployed or loaded first',
    );
  });

  it('[Mint] - should return an Error if the address is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const myNFT = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.mint('', 'https://infura.io/images/404.png');
    };
    expect(myNFT).rejects.toThrow('[ERC721Mintable.mint] A valid address is required to mint.');
  });

  it('[Mint] - should return an Error if the tokenURI is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const myNFT = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.mint('0xE26a682fa90322eC48eB9F3FA66E8961D799177C', '');
    };
    expect(myNFT).rejects.toThrow('[ERC721Mintable.mint] A tokenURI is required to mint.');
  });

  it('[Mint] - should mint a token', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    const tx = await eRC721Mintable.mint(ACCOUNT_ADDRESS, 'https://infura.io/images/404.png');

    // TODO expect something
  });

  it('[LoadContract] - should return an Error if contract is already deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const contract = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.loadContract(CONTRACT_ADDRESS);
    };
    expect(contract).rejects.toThrow(
      '[ERC721Mintable.loadContract] The contract has already been loaded!',
    );
  });

  it('[LoadContract] - should return an Error if the address is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const contract = async () => {
      await eRC721Mintable.loadContract();
    };
    expect(contract).rejects.toThrow(
      '[ERC721Mintable.loadContract] A valid contract address is required to load a contract.',
    );
  });

  it('[LoadContract] - should load the contract', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    await eRC721Mintable.loadContract(CONTRACT_ADDRESS);

    expect(ethers.Contract).toHaveBeenCalledTimes(1);
  });

  it('[Transfer] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const transferNft = async () =>
      eRC721Mintable.transfer({ from: ACCOUNT_ADDRESS, to: ACCOUNT_ADDRESS_2, tokenId: 1 });
    expect(transferNft).rejects.toThrow(
      '[ERC721Mintable.transfer] A contract should be deployed or loaded first',
    );
  });

  it('[Transfer] - should return an Error if from address is not valid', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const transferNft = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'sumbol', contractURI: 'URI' });
      await eRC721Mintable.transfer({
        from: '',
        to: ACCOUNT_ADDRESS_2,
        tokenId: 1,
      });
    };
    expect(transferNft).rejects.toThrow(
      '[ERC721Mintable.transfer] A valid address "from" is required to transfer.',
    );
  });

  it('[Transfer] - should return an Error if to address is not valid', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const transferNft = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'sumbol', contractURI: 'URI' });
      await eRC721Mintable.transfer({
        from: ACCOUNT_ADDRESS,
        to: '',
        tokenId: 1,
      });
    };
    expect(transferNft).rejects.toThrow(
      '[ERC721Mintable.transfer] A valid address "to" is required to transfer.',
    );
  });

  it('[Transfer] - should return an Error if to tokenID is not valid', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const transferNft = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'sumbol', contractURI: 'URI' });
      await eRC721Mintable.transfer({
        from: ACCOUNT_ADDRESS,
        to: ACCOUNT_ADDRESS_2,
        tokenId: 'test',
      });
    };
    expect(transferNft).rejects.toThrow('[ERC721Mintable.transfer] TokenId should be an integer.');
  });

  it('[Transfer] - should transfer nft', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const transferNft = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'sumbol', contractURI: 'URI' });
      await eRC721Mintable.transfer({
        from: ACCOUNT_ADDRESS,
        to: ACCOUNT_ADDRESS_2,
        tokenId: 1,
      });
    };

    expect(transferNft).not.toThrow();
  });

  it('[SetContractURI] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    expect(() =>
      eRC721Mintable.setContractURI(
        'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
      ),
    ).rejects.toThrow(
      '[ERC721Mintable.setContractURI] A contract should be deployed or loaded first!',
    );
  });

  it('[SetContractURI] - should return an Error if the contractURI is empty', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    const uri = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.setContractURI(null);
    };
    expect(uri).rejects.toThrow(
      '[ERC721Mintable.setContractURI] A valid contract uri is required!',
    );
  });

  it('[SetContractURI] - should set the contractURI', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    await eRC721Mintable.setContractURI(
      'https://www.cryptotimes.io/wp-content/uploads/2022/03/BAYC-835-Website-800x500.jpg',
    );

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[addAdmin] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    expect(() =>
      eRC721Mintable.addAdmin('0xB3C24BB465b682225F8C87b29a031921B764Ed94'),
    ).rejects.toThrow('[ERC721Mintable.addAdmin] A contract should be deployed or loaded first!');
  });

  it('[addAdmin] - should return an Error because of bad address', () => {
    eRC721Mintable = new ERC721Mintable(signer);
    const admin = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.addAdmin('');
    };
    expect(admin).rejects.toThrow(
      '[ERC721Mintable.addAdmin] A valid address is required to add the admin role.',
    );
  });

  it('[addAdmin] - should add admin', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    await eRC721Mintable.addAdmin('0x417C0309d43C27593F8a4DFEC427894306f6CE67');

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[removeAdmin] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    expect(() =>
      eRC721Mintable.removeAdmin('0xB3C24BB465b682225F8C87b29a031921B764Ed94'),
    ).rejects.toThrow(
      '[ERC721Mintable.removeAdmin] A contract should be deployed or loaded first!',
    );
  });

  it('[removeAdmin] - should return an Error because of bad address', () => {
    eRC721Mintable = new ERC721Mintable(signer);
    const admin = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.removeAdmin('');
    };
    expect(admin).rejects.toThrow(
      '[ERC721Mintable.removeAdmin] A valid address is required to remove the admin role.',
    );
  });

  it('[removeAdmin] - should remove admin', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    await eRC721Mintable.removeAdmin('0x417C0309d43C27593F8a4DFEC427894306f6CE67');

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[renounceAdmin] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    expect(() =>
      eRC721Mintable.renounceAdmin('0xB3C24BB465b682225F8C87b29a031921B764Ed94'),
    ).rejects.toThrow(
      '[ERC721Mintable.renounceAdmin] A contract should be deployed or loaded first!',
    );
  });

  it('[renounceAdmin] - should return an Error because of bad address', () => {
    eRC721Mintable = new ERC721Mintable(signer);
    const admin = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.renounceAdmin('');
    };
    expect(admin).rejects.toThrow(
      '[ERC721Mintable.renounceAdmin] A valid address is required to renounce the admin role.',
    );
  });

  it('[renounceAdmin] - should renounce admin', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    await eRC721Mintable.renounceAdmin('0x417C0309d43C27593F8a4DFEC427894306f6CE67');

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });

  it('[isAdmin] - should return an Error if contract is not deployed', () => {
    eRC721Mintable = new ERC721Mintable(signer);

    expect(() =>
      eRC721Mintable.isAdmin('0xB3C24BB465b682225F8C87b29a031921B764Ed94'),
    ).rejects.toThrow('[ERC721Mintable.isAdmin] A contract should be deployed or loaded first!');
  });

  it('[isAdmin] - should return an Error because of bad address', () => {
    eRC721Mintable = new ERC721Mintable(signer);
    const admin = async () => {
      await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
      await eRC721Mintable.isAdmin('');
    };
    expect(admin).rejects.toThrow(
      '[ERC721Mintable.isAdmin] A valid address is required to check the admin role.',
    );
  });

  it('[isAdmin] - should renounce admin', async () => {
    eRC721Mintable = new ERC721Mintable(signer);

    await eRC721Mintable.deploy({ name: 'name', symbol: 'symbol', contractURI: 'URI' });
    await eRC721Mintable.isAdmin('0x417C0309d43C27593F8a4DFEC427894306f6CE67');

    expect(contractFactoryMock).toHaveBeenCalledTimes(1);
  });
});
