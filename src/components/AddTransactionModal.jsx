import { useState } from "react";
import API from "../services/api";

function AddTransactionModal({ onClose, onSuccess, initialData }) {
  const [form, setForm] = useState(
    initialData || {
      type: "expense",
      amount: "",
      category: "",
      division: "personal",
      account: "Cash",
      description: "",
    }
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      amount: Number(form.amount),
    };

    try {
      if (initialData) {
        await API.put(`/transactions/${initialData._id}`, payload);
      } else {
        await API.post("/transactions", payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      alert("Operation failed");
      console.log(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-96">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Edit Transaction" : "Add Transaction"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <input
            name="category"
            placeholder="Category (food, fuel...)"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <select
            name="division"
            value={form.division}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="personal">Personal</option>
            <option value="office">Office</option>
          </select>

          {/* ✅ ACCOUNT */}
          <select
            name="account"
            value={form.account}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="Cash">Cash</option>
            <option value="Bank">Bank</option>
            <option value="Wallet">Wallet</option>
          </select>

          <input
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTransactionModal;
