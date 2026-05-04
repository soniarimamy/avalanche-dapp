export const CONTRACT_ADDRESS = '0x...'; // À remplacer après déploiement

export const AVALANCHE_NETWORKS = {
  FUJI: {
    chainId: '0xa869', // 43113 en hex
    chainName: 'Avalanche Fuji Testnet',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
    rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://testnet.snowtrace.io/'],
  },
  MAINNET: {
    chainId: '0xa86a', // 43114 en hex
    chainName: 'Avalanche Mainnet',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://snowtrace.io/'],
  },
};

export const DEFAULT_NETWORK = AVALANCHE_NETWORKS.FUJI;
