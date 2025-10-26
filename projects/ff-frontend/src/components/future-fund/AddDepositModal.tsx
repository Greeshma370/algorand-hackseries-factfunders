import React, { useState } from "react";

type Address = string;

export type DepositFormData = {
  primary: Address;
  backup: Address;
  unlock_time: number; // unix seconds
  amount: number; // in microAlgos
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DepositFormData) => Promise<void>;
};

export default function AddDepositModal({ isOpen, onClose, onSubmit }: Props) {
  const [primary, setPrimary] = useState("");
  const [backup, setBackup] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [unlockTime, setUnlockTime] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primary || !backup || !unlockDate || !unlockTime || !amount) {
      alert("Please fill all fields.");
      return;
    }

    // Combine date and time and convert to unix timestamp
    const unlockTimestamp = new Date(`${unlockDate}T${unlockTime}`).getTime() / 1000;

    setIsSubmitting(true);
    try {
      await onSubmit({
        primary,
        backup,
        unlock_time: unlockTimestamp,
        amount: parseFloat(amount), // convert ALGO to microAlgos
      });
      // Reset form and close modal is handled by parent
    } catch (err) {
      console.error("Submission failed", err);
      // alert(...) or other error handling can be done in parent via onSubmit reject
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 shadow-xl max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Add New Deposit</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Primary Address</label>
              <input
                type="text"
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Primary ALGO Address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Backup Address</label>
              <input
                type="text"
                value={backup}
                onChange={(e) => setBackup(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Backup ALGO Address"
              />
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Unlock Date</label>
                <input
                  type="date"
                  value={unlockDate}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Unlock Time</label>
                <input
                  type="time"
                  value={unlockTime}
                  onChange={(e) => setUnlockTime(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount (ALGO)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 10"
                min="0.1"
                step="0.000001"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Deposit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
