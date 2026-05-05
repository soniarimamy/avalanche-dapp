# Avalanche DApp

Application décentralisée (DApp) développée sur la blockchain Avalanche, permettant d'envoyer des transactions ETH/AVAX entre wallets via une interface React connectée à MetaMask.

---

## Objectif du projet

Ce projet est une DApp pédagogique qui démontre :

- La connexion d'un wallet MetaMask à une application web React
- L'envoi de transactions natives (ETH sur Hardhat Local / AVAX sur Fuji Testnet)
- Le déploiement d'un smart contract Solidity (`SimpleStorage`) sur un réseau local ou testnet
- L'utilisation d'un nœud Hardhat local comme environnement de développement blockchain

---

## Architecture du projet

```
avalanche-dapp/
├── frontend/                        # Application React (Vite + TypeScript)
│   ├── src/
│   │   ├── abi/                     # ABI des smart contracts compilés
│   │   ├── assets/                  # Images et ressources statiques
│   │   ├── components/
│   │   │   └── WalletConnect.tsx    # Composant bouton connexion MetaMask
│   │   ├── config/
│   │   │   └── index.ts             # Configuration des réseaux (Fuji, Mainnet)
│   │   ├── contexts/
│   │   │   └── Web3Context.tsx      # Context React : état du wallet (compte, chainId)
│   │   ├── hooks/
│   │   │   └── useWeb3.ts           # Hook d'accès au Web3Context
│   │   ├── services/
│   │   │   └── blockchain.service.ts # Service ethers.js : balance, transactions
│   │   ├── types/
│   │   │   └── index.ts             # Types TypeScript partagés
│   │   ├── utils/                   # Utilitaires divers
│   │   ├── App.tsx                  # Composant principal : envoi de transaction
│   │   └── main.tsx                 # Point d'entrée React
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── smart-contracts/                 # Contrats Solidity + Hardhat
    ├── contracts/
    │   └── SimpleStorage.sol        # Contrat de stockage de données on-chain
    ├── scripts/
    │   └── deploy.cjs               # Script de déploiement du contrat
    ├── hardhat.config.js            # Configuration Hardhat (réseaux, compilateur)
    └── package.json
```

---

## Prérequis

Avant de lancer le projet, assurez-vous d'avoir installé :

| Outil | Version minimale | Vérification |
|-------|-----------------|--------------|
| **nvm** | 0.39+ | `nvm --version` |
| **Node.js** | 22.x (via nvm) | `node --version` |
| **npm** | 10+ | `npm --version` |
| **yarn** | 1.22+ | `yarn --version` |
| **MetaMask** | 13+ | Extension navigateur Chrome/Firefox |

> **Important :** Node.js doit être en version 22 minimum car Hardhat 2.x le requiert.  
> Utilisez `nvm use 22` pour activer la bonne version.

---

## Lancement du projet

### 1. Activer la bonne version de Node.js

```bash
nvm use 22
```

### 2. Lancer le nœud Hardhat local

Le nœud Hardhat simule une blockchain locale avec **20 comptes pré-chargés de 10 000 ETH chacun**. Il doit tourner en permanence pendant que vous utilisez la DApp.

```bash
cd smart-contracts
npx hardhat node --config hardhat.config.js
```

**Ce que fait cette commande :**
- Démarre un serveur JSON-RPC local sur `http://127.0.0.1:8545`
- Génère 20 wallets de test avec leurs clés privées affichées dans le terminal
- Simule le minage de blocs à chaque transaction
- Permet de tester sans frais réels ni connexion internet

> Laissez ce terminal ouvert. Chaque redémarrage réinitialise la blockchain et les soldes.

### 3. Lancer le frontend

Dans un **nouveau terminal** :

```bash
cd frontend
yarn install     # première fois uniquement
yarn dev
```

L'application est accessible sur **http://localhost:3000**

---

## Liaison Hardhat Local avec la DApp

La DApp se connecte automatiquement au réseau actif de MetaMask via `window.ethereum` (l'API injectée par l'extension). Le service `blockchain.service.ts` utilise `ethers.js` pour :

1. Lire le solde de l'adresse connectée via `provider.getBalance(address)`
2. Envoyer des transactions via `signer.sendTransaction({ to, value })`

**Le provider est recréé à chaque lecture** pour toujours refléter le réseau actif de MetaMask (Hardhat Local ou Fuji).

Les réseaux acceptés sont définis dans `src/contexts/Web3Context.tsx` :
```typescript
const ACCEPTED_CHAINS = [1337, 43113]; // Hardhat Local + Fuji Testnet
```

---

## Configuration MetaMask — Réseau Hardhat Local

Ajoutez le réseau manuellement dans MetaMask :  
*Paramètres → Réseaux → Ajouter un réseau manuellement*

| Champ | Valeur |
|-------|--------|
| Nom du réseau | `Hardhat Local` |
| URL RPC | `http://127.0.0.1:8545` |
| Identifiant de chaîne | `1337` |
| Symbole de devise | `ETH` |
| Explorateur de blocs | *(laisser vide)* |

---

## Créditer un compte avec Hardhat Local

### Option A — Importer un compte Hardhat dans MetaMask

Quand le nœud Hardhat est lancé, il affiche 20 comptes. Prenez la **clé privée** du compte #0 :

```
Compte #0 : 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10 000 ETH)
Clé privée : 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

Dans MetaMask :
1. Cliquez sur l'**avatar** en haut à droite
2. *Ajouter un compte ou un matériel* → **Importer un compte**
3. Sélectionnez le type **Clé privée**
4. Collez la clé privée ci-dessus → **Importer**

Le compte apparaîtra avec **10 000 ETH** sur le réseau Hardhat Local.

> Ces clés sont publiques et connues de tous. Ne les utilisez **jamais** sur un réseau réel.

### Option B — Envoyer des ETH vers votre adresse existante

Si vous préférez utiliser votre propre adresse MetaMask, exécutez ce script depuis le dossier `smart-contracts` (nœud Hardhat actif requis) :

```bash
npx hardhat run --network localhost scripts/fund-account.cjs
```

---

## Faire une transaction entre deux wallets

**Prérequis :**
- Le nœud Hardhat tourne sur `http://127.0.0.1:8545`
- MetaMask est sur le réseau **Hardhat Local**
- Le compte actif a un solde > 0 ETH
- La DApp est ouverte sur `http://localhost:3000`

**Étapes :**

1. Ouvrez `http://localhost:3000` dans votre navigateur
2. Cliquez **Connect Wallet** et approuvez dans MetaMask
3. Vérifiez que le solde affiché est correct (ex: `10 000.0000 ETH`)
4. Dans le champ **Recipient Address**, collez l'adresse du compte destinataire  
   *(ex: compte Hardhat #1 : `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`)*
5. Dans le champ **Amount (ETH)**, entrez le montant (ex: `1`)
6. Cliquez **Send Transaction**
7. MetaMask ouvre une popup de confirmation → cliquez **Confirmer**
8. La transaction est minée et le solde se met à jour automatiquement

---

## Déployer le smart contract SimpleStorage (optionnel)

Le contrat `SimpleStorage.sol` permet de stocker et lire une valeur `uint256` on-chain.

**Sur Hardhat Local :**
```bash
cd smart-contracts
npx hardhat run scripts/deploy.cjs --network hardhat
```

**Sur Fuji Testnet** (requiert des AVAX de test et une clé privée dans `.env`) :
```bash
cd smart-contracts
npx hardhat run scripts/deploy.cjs --network fuji
```

Après déploiement, copiez l'adresse du contrat dans `frontend/src/config/index.ts` :
```typescript
export const CONTRACT_ADDRESS = '0x...'; // adresse obtenue après déploiement
```

---

## Technologies utilisées

| Couche | Technologie |
|--------|-------------|
| Frontend | React 19, TypeScript, Vite 8 |
| UI | Material UI (MUI) 9 |
| Web3 | ethers.js 5.7 |
| Smart Contracts | Solidity 0.8.19 |
| Environnement blockchain | Hardhat 2.22 |
| Réseau de test | Avalanche Fuji Testnet (43113) / Hardhat Local (1337) |
| Wallet | MetaMask 13+ |

---

## Réseaux supportés

| Réseau | Chain ID | RPC | Usage |
|--------|----------|-----|-------|
| Hardhat Local | 1337 | `http://127.0.0.1:8545` | Développement local |
| Avalanche Fuji Testnet | 43113 | `https://api.avax-test.network/ext/bc/C/rpc` | Tests sur testnet |
| Avalanche Mainnet | 43114 | `https://api.avax.network/ext/bc/C/rpc` | Production |
