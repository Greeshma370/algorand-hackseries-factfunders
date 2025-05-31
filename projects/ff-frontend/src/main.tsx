import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {
  NetworkId,
  WalletId,
  WalletManager,
  WalletProvider,
} from '@txnlab/use-wallet-react'
import { WalletUIProvider } from '@txnlab/use-wallet-ui-react'

const walletManager = new WalletManager({
  wallets: [
    WalletId.PERA,
    WalletId.DEFLY,
    WalletId.LUTE,
    // Add more wallets as needed
  ],
  defaultNetwork: NetworkId.TESTNET,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WalletProvider manager={walletManager}>
      <WalletUIProvider>
    <App />
      </WalletUIProvider>
    </WalletProvider>
  </StrictMode>
);
