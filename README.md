# @tychilabs/react-ugf

[![npm](https://img.shields.io/npm/v/@tychilabs/react-ugf)](https://www.npmjs.com/package/@tychilabs/react-ugf)

> Pay gas in USDC across any EVM chain — drop-in React component powered by Universal Gas Framework

No paymasters. No bundlers. No ERC-4337. Just sign and execute.

---

## Demo

![UGF Demo](./assets/demo.gif)

Users pay gas in USDC instead of native tokens — transaction executes on another chain without needing ETH, AVAX, or any gas token.

---

## Payment Modal (What users see)

![UGF Modal](./assets/modal.png)

Users choose how to pay gas — USDC across any supported chain.  
UGF handles pricing, balances, and execution automatically.

---

## How it works

1. **Trigger** — call `openUGF()` with your transaction
2. **Pay** — user selects token (USDC, etc.) and signs payment
3. **Execute** — UGF sponsors gas and executes on destination chain

Your users never need native gas tokens.

---

## Install

```bash
npm install @tychilabs/react-ugf
```

Peer dependencies:

```bash
npm install ethers
```

---

## Quick Start

### Wrap your app

```tsx
import { UGFProvider } from "@tychilabs/react-ugf";

export default function App() {
  return (
    <UGFProvider>
      <YourApp />
    </UGFProvider>
  );
}
```

---

### Use in your component

```tsx
import { useUGFModal } from "@tychilabs/react-ugf";

const { openUGF } = useUGFModal();

openUGF({
  signer,
  tx: {
    to: CONTRACT_ADDRESS,
    data,
    value: 0n,
  },
  destChainId: "43114", // Avalanche
});
```

---

## Testnet Usage (Base Sepolia)

`react-ugf` also runs in testnet mode against **Base Sepolia**.

### Wrap your app in testnet mode

```tsx
import { UGFProvider } from "@tychilabs/react-ugf";

export default function App() {
  return (
    <UGFProvider mode="testnet">
      <YourApp />
    </UGFProvider>
  );
}
```

### Use `openUGF()` same way

```tsx
import { useUGFModal } from "@tychilabs/react-ugf";

const { openUGF } = useUGFModal();

openUGF({
  signer,
  tx: {
    to: CONTRACT_ADDRESS,
    data,
    value: 0n,
  },
  destChainId: "84532", // Base Sepolia
});
```

### Testnet notes

- `mode="testnet"` makes `react-ugf` use `@tychilabs/ugf-testnet-js` under the hood
- destination chain is Base Sepolia (`84532`)
- settlement coin is `TYI_MOCK_USD`
- `openUGF()` API stays same
- if you do not pass `mode`, provider stays in production mode

### Gasless on Base Sepolia

In testnet mode, execution on Base Sepolia is gasless for the end user:

- user pays in **MOCK TYI USD** (`TYI_MOCK_USD`) inside the UGF modal
- UGF covers native gas onchain on Base Sepolia for the user's transaction
- destination call executes on Base Sepolia without the user holding Base Sepolia ETH

What the dApp does **not** need to operate to get this:

- no app-side paymaster
- no bundler
- no ERC-4337 / smart wallet migration
- no app-managed gas tank or sponsorship backend

The dApp only encodes the destination call and opens the modal. UGF handles quote, MOCK TYI USD payment, and gas on Base Sepolia.

### Faucets

Get MOCK TYI USD and other testnet assets here:

- [https://universalgasframework.com/faucets](https://universalgasframework.com/faucets)

---

## Example Flow

- User connects wallet
- Clicks action (swap / mint / send)
- Sees payment modal
- Pays gas in USDC (or supported token)
- Transaction executes on destination chain

---

## Supported

**Chains**

- Ethereum (EVM)
- Base (EVM)
- Optimism (EVM)
- Polygon (EVM)
- Avalanche (EVM)
- BNB Chain (EVM)
- Arbitrum (EVM)

---

## What UGF handles

- Payment modal (token selection + balances)
- Gas estimation and conversion
- Cross-chain execution
- Wallet chain switching
- Gas sponsorship

---

## Requirements

- EVM-compatible wallet (MetaMask, Rabby, etc.)
- ethers.js signer

---

## Demo

Live demo: [https://universalgasframework.com/dapp-integration](https://universalgasframework.com/dapp-integration) — connect your wallet and try it.

Example repo: [https://github.com/TychiWallet/demo_react_ugf](https://github.com/TychiWallet/demo_react_ugf)

### Try it locally

```bash
git clone https://github.com/TychiWallet/demo_react_ugf.git
cd demo_react_ugf
npm install
npm run dev
```

Open the dev server, connect your wallet, and trigger a transaction — the UGF modal handles payment and execution.

---

## API

### `openUGF`

```ts
openUGF({
  signer,
  tx,
  destChainId,
});
```

| Field       | Type                 | Description          |
| ----------- | -------------------- | -------------------- |
| signer      | `Signer`             | ethers signer        |
| tx          | `TransactionRequest` | transaction object   |
| destChainId | `string`             | destination chain ID |

---

## Compatibility

| Environment  | Status       |
| ------------ | ------------ |
| React        | Full support |
| Vite 5       | Supported    |
| Next.js      | Supported    |
| React Native | Coming soon  |

---

## Examples

Full working demo: [TychiWallet/demo_react_ugf](https://github.com/TychiWallet/demo_react_ugf)

Includes:

- Counter interaction (EVM → EVM)
- Token payment flow
- Modal UI integration
- Mainnet + testnet (Base Sepolia) modes

---

## About

[Tychi Labs](https://tychilabs.com) builds infrastructure for gasless and agentic Web3 execution.

`react-ugf` is the simplest way to integrate UGF into frontend apps.
---

## Links

- npm: [https://www.npmjs.com/package/@tychilabs/react-ugf](https://www.npmjs.com/package/@tychilabs/react-ugf)
- GitHub: [https://github.com/TychiWallet](https://github.com/TychiWallet)
- Docs: [https://universalgasframework.com](https://universalgasframework.com)
- Contact: [yash@tychilabs.com](mailto:yash@tychilabs.com)


