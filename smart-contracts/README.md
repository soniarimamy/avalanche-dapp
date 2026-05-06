# SimpleStorage — Smart Contract Avalanche

## Utilité

`SimpleStorage` est un smart contract Solidity minimaliste déployé sur la blockchain Avalanche (ou en local via Hardhat). Il démontre les mécanismes fondamentaux d'un contrat EVM :

- **Stocker** une valeur entière sur la blockchain (persistance permanente).
- **Lire** cette valeur depuis n'importe quelle adresse, sans frais de gas.
- **Émettre un événement** horodaté à chaque modification, pour un suivi transparent et auditables on-chain.

C'est le point d'entrée idéal pour comprendre comment une DApp front-end interagit avec un contrat déployé.

---

## Définitions

| Terme | Définition |
|---|---|
| **Smart contract** | Programme autonome stocké et exécuté sur la blockchain, immuable après déploiement. |
| **Solidity** | Langage de programmation orienté objet pour écrire des smart contracts EVM. |
| **ABI** | *Application Binary Interface* — interface JSON décrivant les fonctions et événements du contrat, utilisée par le front-end pour interagir avec lui. |
| **EVM** | *Ethereum Virtual Machine* — machine virtuelle commune à Ethereum, Avalanche C-Chain, et d'autres réseaux compatibles. |
| **Hardhat** | Framework de développement local pour compiler, tester et déployer des smart contracts. |
| **Fuji** | Réseau de test (testnet) d'Avalanche, équivalent à un "bac à sable" gratuit avant le mainnet. |
| **`uint256`** | Type entier non signé de 256 bits — le type numérique natif de l'EVM. |
| **`private`** | Modificateur de visibilité : la variable `data` n'est pas accessible directement depuis l'extérieur du contrat. |
| **`view`** | Modificateur indiquant que la fonction ne modifie pas l'état — pas de transaction, pas de gas. |
| **`emit`** | Mot-clé Solidity pour déclencher un événement, enregistré dans les logs de la transaction. |
| **`indexed`** | Paramètre d'événement indexé, permettant un filtrage efficace dans les logs blockchain. |
| **`msg.sender`** | Adresse de l'appelant de la transaction en cours. |
| **`block.timestamp`** | Horodatage Unix du bloc courant, fourni par le réseau. |
| **`chainId`** | Identifiant unique du réseau blockchain (1337 = Hardhat local, 43113 = Fuji, 43114 = Avalanche mainnet). |

---

## Architecture du code

```
smart-contracts/
├── contracts/
│   └── SimpleStorage.sol      # Le smart contract principal
├── scripts/
│   └── deploy.cjs             # Script de déploiement Hardhat
├── artifacts/                 # ABI et bytecode générés après compilation
├── cache/                     # Cache de compilation Hardhat
├── hardhat.config.js          # Configuration des réseaux et du compilateur
├── package.json               # Dépendances et scripts npm
└── .env                       # Clé privée (ne jamais committer)
```

### Contrat `SimpleStorage.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 private data;                          // (1) Variable d'état

    event DataStored(                              // (2) Événement
        uint256 indexed newData,
        address indexed updater,
        uint256 timestamp
    );

    function set(uint256 _data) public {           // (3) Écriture
        data = _data;
        emit DataStored(_data, msg.sender, block.timestamp);
    }

    function get() public view returns (uint256) { // (4) Lecture
        return data;
    }
}
```

| # | Élément | Rôle |
|---|---|---|
| 1 | `uint256 private data` | Stocke la valeur entière. `private` empêche l'accès direct depuis d'autres contrats. |
| 2 | `event DataStored` | Journal on-chain émis à chaque `set()`. Contient la nouvelle valeur, l'adresse de l'appelant et l'horodatage. |
| 3 | `set(uint256 _data)` | Fonction publique d'écriture — crée une transaction, consomme du gas. |
| 4 | `get()` | Fonction publique de lecture — gratuite, ne crée pas de transaction. |

---

## Prérequis

- **Node.js** v18+ (géré via `nvm` recommandé)
- **npm** ou **yarn**
- Dépendances installées : `npm install` ou `yarn`

---

## Commandes

### 1. Activer la bonne version de Node.js

```bash
# Vérifier la version courante
node --version

# Avec nvm — utiliser Node 18 (LTS recommandé pour Hardhat)
nvm install 18
nvm use 18

# Vérifier que la version est bien active
node --version   # doit afficher v18.x.x
```

---

### 2. Lancer le nœud Hardhat local

Le nœud local simule une blockchain EVM en mémoire. Il génère automatiquement **20 comptes** pré-financés avec 10 000 ETH chacun.

```bash
npx hardhat node
```

> Le nœud tourne sur `http://127.0.0.1:8545` (chainId `1337`).  
> Laissez ce terminal ouvert — le nœud doit rester actif pendant le déploiement.

Exemple de sortie :

```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...
```

---

### 3. Créditer un compte avec Hardhat local

Les 20 comptes générés par Hardhat sont **déjà crédités** de 10 000 ETH fictifs. Pour envoyer des fonds d'un compte à un autre via le nœud local :

```bash
# Ouvrir la console Hardhat (dans un second terminal)
npx hardhat console --network localhost

# Dans la console interactive :
const [sender, receiver] = await ethers.getSigners();

# Vérifier le solde du destinataire
const balance = await ethers.provider.getBalance(receiver.address);
console.log(ethers.formatEther(balance), "ETH");

# Envoyer 5 ETH du compte #0 vers le compte #1
await sender.sendTransaction({
  to: receiver.address,
  value: ethers.parseEther("5.0")
});

# Vérifier le nouveau solde
const newBalance = await ethers.provider.getBalance(receiver.address);
console.log(ethers.formatEther(newBalance), "ETH");
```

---

### 4. Compiler le smart contract

```bash
npx hardhat compile
```

Génère l'ABI et le bytecode dans `artifacts/contracts/SimpleStorage.sol/SimpleStorage.json`.

---

### 5. Déployer le smart contract SimpleStorage

#### Sur le réseau Hardhat local

> Assurez-vous que le nœud local tourne (`npx hardhat node`) dans un autre terminal.

```bash
npx hardhat run scripts/deploy.cjs --network localhost
```

Sortie attendue :

```
Deploying SimpleStorage contract to Avalanche...
SimpleStorage deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Checking initial value...
Initial value: 0
Testing update...
New value after update: 42
✅ Deployment and test completed successfully!
```

#### Sur le testnet Avalanche Fuji

1. Créer un fichier `.env` à la racine de `smart-contracts/` :

```env
PRIVATE_KEY=votre_cle_privee_sans_prefixe_0x
```

2. S'assurer d'avoir des AVAX de test (obtenus sur [faucet.avax.network](https://faucet.avax.network)).

3. Lancer le déploiement :

```bash
npx hardhat run scripts/deploy.cjs --network fuji
```

#### Sur le mainnet Avalanche

```bash
npx hardhat run scripts/deploy.cjs --network avalanche
```

> **Attention** : le mainnet utilise de vrais AVAX. Vérifiez deux fois avant de déployer.

---

### 6. Lancer les tests

```bash
npx hardhat test
```

---

## Fonctionnalités du contrat

### `set(uint256 _data)`

| Attribut | Valeur |
|---|---|
| Visibilité | `public` |
| Type | Transaction (modifie l'état) |
| Gas | Oui (environ ~43 000 gas) |
| Paramètre | `_data` — entier 256 bits à stocker |

- Remplace la valeur stockée dans `data` par `_data`.
- Émet l'événement `DataStored` avec la nouvelle valeur, l'adresse de l'appelant (`msg.sender`) et l'horodatage du bloc (`block.timestamp`).
- N'importe quelle adresse peut appeler cette fonction (pas de contrôle d'accès).

---

### `get() → uint256`

| Attribut | Valeur |
|---|---|
| Visibilité | `public view` |
| Type | Lecture seule (ne modifie pas l'état) |
| Gas | Aucun (appel local) |

- Retourne la valeur actuelle de `data`.
- Peut être appelée sans signer de transaction, depuis n'importe quelle adresse.

---

### Événement `DataStored`

```solidity
event DataStored(
    uint256 indexed newData,
    address indexed updater,
    uint256 timestamp
);
```

Émis à chaque appel de `set()`. Les champs `indexed` permettent de filtrer les logs par valeur ou par adresse d'appelant depuis le front-end ou un explorateur de blocs.

---

## Réseaux configurés

| Réseau | URL RPC | ChainId | Usage |
|---|---|---|---|
| `hardhat` | `http://127.0.0.1:8545` | 1337 | Développement local |
| `fuji` | `https://api.avax-test.network/ext/bc/C/rpc` | 43113 | Tests publics (gratuit) |
| `avalanche` | `https://api.avax.network/ext/bc/C/rpc` | 43114 | Production (AVAX réels) |

---

## Sécurité

- Ne jamais committer le fichier `.env` contenant la clé privée.
- Le fichier `.gitignore` exclut déjà `.env`, `artifacts/` et `cache/`.
- Ce contrat n'implémente pas de contrôle d'accès (`Ownable`) : toute adresse peut modifier la valeur stockée. Pour un usage en production, ajouter un modificateur `onlyOwner`.
