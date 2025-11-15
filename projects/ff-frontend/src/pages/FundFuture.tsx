import { useEffect, useMemo, useState } from "react";
import AddDepositModal, { DepositFormData } from "../components/future-fund/AddDepositModal";
import { ReadableFutureFund } from "../data/getters";
import { getFutureFunds } from "../data/getters";
import { showErrorToast, showSuccessToast, toastMessages } from "../utils/toast";
import { useWallet } from "@txnlab/use-wallet-react";
import { algorandClient, appClient, syncTimeOffsetInLocalNet } from "../data/clients";
import { APP_ADDRESS } from "../data/config";
import * as algokit from "@algorandfoundation/algokit-utils";

export default function FutureFundPage() {
  const { activeAddress, transactionSigner } = useWallet();
  const [deposits, setDeposits] = useState<ReadableFutureFund[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!activeAddress || !transactionSigner) {
      showErrorToast(toastMessages.futureFund.notConnected);
      return;
    }
    setLoading(true);
    getFutureFunds(activeAddress)
      .then((futureFunds) => {
        setDeposits(futureFunds);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [activeAddress]);

  const formatDate = (unixSec: number) => {
    const d = new Date(unixSec * 1000);
    return d.toLocaleString();
  };

  const isMatured = (unlockTime: number) => {
    return Math.floor(Date.now() / 1000) >= unlockTime;
  };

  const claimDeposit = async (id: number) => {
    const d = deposits.find((x) => x.id === id);
    if (!d) return;
    if (d.claimed) {
      showErrorToast(toastMessages.futureFund.alreadyClaimed);
      return;
    }
    if (!isMatured(d.unlockTime)) {
      showErrorToast(toastMessages.futureFund.notMatured);
      return;
    }
    if (!transactionSigner || (d.primary !== activeAddress && d.backup !== activeAddress)) {
      showErrorToast(toastMessages.futureFund.notAuthorized);
      return;
    }

    setProcessingId(id);
    try {
      const result = await appClient.send.claimFutureSelf({
        args: {
          fundId: id,
        },
        signer: transactionSigner,
        sender: activeAddress,
        populateAppCallResources: true,
        maxFee: algokit.microAlgos(2000),
        coverAppCallInnerTransactionFees: true,
      });
      showSuccessToast(toastMessages.futureFund.claimSuccess);

      setDeposits((prev) => prev.map((p) => (p.id === id ? { ...p, claimed: true } : p)));
    } catch (err) {
      console.error(err);
      showErrorToast(toastMessages.futureFund.claimFailed);
    } finally {
      setProcessingId(null);
    }
  };

  const refreshDeposits = async () => {
    if (!activeAddress || !transactionSigner) {
      showErrorToast(toastMessages.futureFund.notConnected);
      return;
    }
    setLoading(true);
    getFutureFunds(activeAddress)
      .then((futureFunds) => {
        setDeposits(futureFunds);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  const handleAddDeposit = async (data: DepositFormData) => {
    try {
      if (!activeAddress || !transactionSigner) {
        showErrorToast(toastMessages.futureFund.notConnectedToAddDeposit);
        return;
      }
      const paymentTxn = await algorandClient.createTransaction.payment({
        sender: activeAddress,
        receiver: APP_ADDRESS,
        amount: algokit.algos(data.amount),
        signer: transactionSigner,
      });
      await syncTimeOffsetInLocalNet();
      const result = await appClient.send.fundFutureSelf({
        args: {
          primary: data.primary,
          backup: data.backup,
          unlockTime: data.unlock_time,
          payment: paymentTxn,
        },
        signer: transactionSigner,
        sender: activeAddress,
        populateAppCallResources: true,
      });
      showSuccessToast(toastMessages.futureFund.addDepositSuccess);
      await refreshDeposits();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      showErrorToast(toastMessages.futureFund.addDepositFailed);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">FutureFund — Deposits</h1>
            <p className="text-sm text-slate-500">View previous deposits and claim matured funds.</p>
          </div>
          {activeAddress && (
            <div className="flex gap-2">
              <button onClick={refreshDeposits} className="px-3 py-2 bg-white border rounded-md shadow-sm text-sm" disabled={loading}>
                {loading ? "Refreshing..." : "Refresh"}
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium shadow hover:opacity-95"
              >
                Add Deposit
              </button>
            </div>
          )}
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
                {deposits.map((d) => {
                  const matured = isMatured(d.unlockTime);
                  return (
                    <tr key={d.id} className="border-b last:border-b-0">
                      <td className="py-3 px-2 text-sm font-mono">{d.primary.slice(0, 6)}...{d.primary.slice(-4)}</td>
                      <td className="py-3 px-2 text-sm font-mono">{d.backup.slice(0, 6)}...{d.backup.slice(-4)}</td>
                      <td className="py-3 px-2 text-sm">{formatDate(d.unlockTime)}</td>
                      <td className="py-3 px-2 text-sm">{algokit.microAlgos(BigInt(d.amount)).algos} ALGO</td>
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
                            onClick={() => {
                              navigator.clipboard?.writeText(d.primary);
                              showSuccessToast(toastMessages.general.copied);
                            }}
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
          </div>
        </main>
      </div>
      <AddDepositModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddDeposit} />
    </div>
  );
}
