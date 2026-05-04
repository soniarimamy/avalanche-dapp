import { ethers } from 'ethers';
import { DEFAULT_NETWORK, CONTRACT_ADDRESS } from '../config';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class BlockchainService {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;

  async initProvider() {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    return this.provider;
  }

  async getSigner() {
    if (!this.provider) {
      await this.initProvider();
    }
    this.signer = this.provider!.getSigner();
    return this.signer;
  }

  async getAccount(): Promise<string> {
    const signer = await this.getSigner();
    return await signer.getAddress();
  }

  async switchNetwork(chainId: string) {
    if (!window.ethereum) throw new Error('MetaMask not installed');

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await this.addNetwork(chainId);
      }
      throw error;
    }
  }

  async addNetwork(chainId: string) {
    const network = chainId === '0xa869' ? DEFAULT_NETWORK : DEFAULT_NETWORK;

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: network.chainId,
          chainName: network.chainName,
          nativeCurrency: network.nativeCurrency,
          rpcUrls: network.rpcUrls,
          blockExplorerUrls: network.blockExplorerUrls,
        },
      ],
    });
  }

  async sendTransaction(to: string, amount: string): Promise<string> {
    const signer = await this.getSigner();
    const tx = await signer.sendTransaction({
      to,
      value: ethers.utils.parseEther(amount),
    });

    await tx.wait();
    return tx.hash;
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) await this.initProvider();
    const balance = await this.provider!.getBalance(address);
    return ethers.utils.formatEther(balance);
  }
}

export const blockchainService = new BlockchainService();
