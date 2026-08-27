import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { WalletProvider } from "./context/WalletContext";
import { VotingProvider } from "./context/VotingContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WalletProvider>
      <VotingProvider>
        <App />
      </VotingProvider>
    </WalletProvider>
  </React.StrictMode>
);