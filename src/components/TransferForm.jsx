import { useState } from "react";
import API from "../services/api";

function TransferForm({ onSuccess }) {
  const [fromAccount, setFromAccount] = useState("Bank");
  const [toAccount, setToAccount] = useState("Cash");
  const [amount, setAmount] = useState("");

  const handleTransfer = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter valid amount");
      return;
    }

    if (fromAccount === toAccount) {
      alert("From and To account cannot be same");
      return;
    }

    try {
      await API.post("/transactions/transfer", {
        fromAccount,
        toAccount,
        amount: Number(amount),
      });

      setAmount("");
      onSuccess && onSuccess();
    } catch (err) {
      alert("Transfer failed");
      console.log(err);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-10">
      <h3 className="font-semibold text-slate-800 mb-6">
        Account Transfer
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">

        {/* FROM */}
        <div>
          <label className="text-xs text-slate-500">From Account</label>
          <select
            value={fromAccount}
            onChange={(e) => {
              setFromAccount(e.target.value);
              setToAccount(e.target.value === "Bank" ? "Cash" : "Bank");
            }}
            className="w-full border rounded-xl px-3 py-2 text-sm"
          >
            <option value="Bank">Bank</option>
            <option value="Cash">Cash</option>
          </select>
        </div>

        <div className="text-center text-xl text-slate-400">→</div>

        {/* TO */}
        <div>
          <label className="text-xs text-slate-500">To Account</label>
          <select
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-sm"
          >
            {fromAccount !== "Bank" && <option value="Bank">Bank</option>}
            {fromAccount !== "Cash" && <option value="Cash">Cash</option>}
          </select>
        </div>

        {/* AMOUNT */}
        <div>
          <label className="text-xs text-slate-500">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full border rounded-xl px-3 py-2 text-sm"
          />
        </div>

        <button
          onClick={handleTransfer}
          className="bg-indigo-600 hover:bg-indigo-700
          text-white rounded-xl px-4 py-2 text-sm font-medium"
        >
          Transfer
        </button>
      </div>
    </div>
  );
}

export default TransferForm;
