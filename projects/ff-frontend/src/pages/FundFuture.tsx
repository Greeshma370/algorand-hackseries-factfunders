import React, { useEffect, useMemo, useState } from "react";

// FutureFundPage.tsx
// React + TypeScript component to display previous deposits, claim matured deposits,
// and a placeholder button to add deposits.
// TODO: Replace mock data / simulated actions with real Algorand SDK calls and
// wallet integration (e.g. algosdk or @algo-builder or wallet-connect).

type Address = string;

type FutureFund = {
  id: string; // local id for UI
  primary: Address;
  backup: Address;
  unlock_time: number; // unix seconds
  amount: number; // amount in microAlgos (or smallest unit)
  claimed: boolean;
};

export default function FutureFundPage() {
  const [deposits, setDeposits] = useState<FutureFund[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // mock initial data — replace with on-chain fetch
  useEffect(() => {
    setLoading(true);
    // simulate fetch delay
    const t = setTimeout(() => {
      const now = Math.floor(Date.now() / 1000);
      setDeposits([
        {
          id: "d1",
          primary: "ALGO_PRIMARY_ADDRESS_1",
          backup: "ALGO_BACKUP_ADDRESS_1",
          unlock_time: now - 60 * 60 * 24, // matured yesterday
          amount: 5_000_000, // 5 ALGO (if microAlgos)
          claimed: false,
        },
        {
          id: "d2",
          primary: "ALGO_PRIMARY_ADDRESS_2",
          backup: "ALGO_BACKUP_ADDRESS_2",
          unlock_time: now + 60 * 60 * 24 * 3, // in 3 days
          amount: 10_000_000,
          claimed: false,
        },
        {
          id: "d3",
          primary: "ALGO_PRIMARY_ADDRESS_3",
          backup: "ALGO_BACKUP_ADDRESS_3",
          unlock_time: now - 60 * 60 * 24 * 10,
          amount: 2_500_000,
          claimed: true,
        },
      ]);
      setLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const nowSec = useMemo(() => Math.floor(Date.now() / 1000), []);

  const formatDate = (unixSec: number) => {
    const d = new Date(unixSec * 1000);
    return d.toLocaleString();
  };

  const microAlgosToAlgos = (micro: number) => {
    return (micro / 1_000_000).toFixed(6).replace(/\.0+$/g, "");
  };

  const isMatured = (unlock_time: number) => {
    return Math.floor(Date.now() / 1000) >= unlock_time;
  };

  // Placeholder: claim action (UI-only simulation)
  const claimDeposit = async (id: string) => {
    const d = deposits.find((x) => x.id === id);
    if (!d) return;
    if (d.claimed) {
      alert("This deposit is already claimed.");
      return;
    }
    if (!isMatured(d.unlock_time)) {
      alert("This deposit has not matured yet.");
      return;
    }

    // Simulate transaction processing
    setProcessingId(id);
    try {
      // TODO: Integrate Algorand SDK here. Example flow:
      // 1. Connect wallet (MyAlgo/WalletConnect/WalletConnect v2)
      // 2. Build a transaction that calls the smart contract or transfers funds
      // 3. Sign & send transaction
      // 4. Wait for confirmation and update on-chain state

      await new Promise((res) => setTimeout(res, 1000)); // fake delay

      setDeposits((prev) => prev.map((p) => (p.id === id ? { ...p, claimed: true } : p)));
      alert("Claim simulated: deposit marked as claimed (UI-only). Replace with on-chain call.");
    } catch (err) {
      console.error(err);
      alert("Failed to claim — see console for details.");
    } finally {
      setProcessingId(null);
    }
  };

  const refreshDeposits = async () => {
    setLoading(true);
    // TODO: Replace with real fetch from contract state / indexer
    await new Promise((res) => setTimeout(res, 700));
    setLoading(false);
    // for demo we just toggle a refresh timestamp (no-op)
  };

  const handleAddDepositClick = () => {
    // Placeholder: real UI should open a form/modal and then perform on-chain deposit
    alert("Add Deposit button clicked — functionality to be implemented (TODO).");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">FutureFund — Deposits</h1>
            <p className="text-sm text-slate-500">View previous deposits and claim matured funds.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refreshDeposits}
              className="px-3 py-2 bg-white border rounded-md shadow-sm text-sm"
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={handleAddDepositClick}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium shadow hover:opacity-95"
            >
              Add Deposit
            </button>
          </div>
        </header>

        <main>
          <div className="bg-white rounded-2xl shadow p-4">
            <table className="min-w-full text-left">
              <thead>
                <tr className="text-slate-600 text-sm border-b">
                  <th className="py-3 px-2">Primary</th>
                  <th className="py-3 px-2">Backup</th>
                  <th className="py-3 px-2">Unlock Time</th>
                  <th className="py-3 px-2">Amount</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deposits.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No deposits found.
                    </td>
                  </tr>
                )}
                {deposits.map((d)=> {
                  const matured = isMatured(d.unlock_time);
                  return (
                    <tr key={d.id} className="border-b last:border-b-0">
                      <td className="py-3 px-2 text-sm font-mono">{d.primary}</td>
                      <td className="py-3 px-2 text-sm font-mono">{d.backup}</td>
                      <td className="py-3 px-2 text-sm">{formatDate(d.unlock_time)}</td>
                      <td className="py-3 px-2 text-sm">{microAlgosToAlgos(d.amount)} ALGO</td>
                      <td className="py-3 px-2 text-sm">
                        {d.claimed ? (
                          <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Claimed</span>
                        ) : matured ? (
                          <span className="inline-block px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">Matured</span>
                        ) : (
                          <span className="inline-block px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-600">Locked</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => claimDeposit(d.id)}
                            disabled={!matured || d.claimed || processingId === d.id}
                            className={`px-3 py-1 rounded-md text-sm border ${
                              matured && !d.claimed ? "bg-white hover:bg-slate-50" : "opacity-60 cursor-not-allowed"
                            }`}
                          >
                            {processingId === d.id ? "Processing..." : "Claim"}
                          </button>
                          <button
                            onClick={() => navigator.clipboard?.writeText(d.primary)}
                            className="px-3 py-1 rounded-md text-sm border bg-white"
                          >
                            Copy Primary
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mt-4 text-sm text-slate-500">
              <strong>Note:</strong> This UI is a frontend prototype. Integrate with Algorand SDK and a wallet to
              perform real on-chain actions. Unlock/claim behavior should be verified on-chain before executing.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
