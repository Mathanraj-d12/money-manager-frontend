import { useEffect, useState } from "react";
import API from "../services/api";
import AddTransactionModal from "../components/AddTransactionModal";
import TransferForm from "../components/TransferForm";

function Home() {
  const [transactions, setTransactions] = useState([]);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  /* ================= FILTER STATE ================= */
  const [filters, setFilters] = useState({
    category: "",
    division: "",
    startDate: "",
    endDate: "",
  });

  /* ================= SUMMARY ================= */
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });

  /* ================= ANALYTICS ================= */
  const [analyticsType, setAnalyticsType] = useState("weekly");
  const [analytics, setAnalytics] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });

  /* ================= FETCH ================= */
  const fetchSummary = async () => {
    const res = await API.get("/transactions/summary");
    setSummary(res.data);
  };

  const fetchData = async () => {
    const res = await API.get("/transactions");
    setTransactions(res.data);
  };

  const fetchAnalytics = async (type) => {
    const res = await API.get(`/transactions/analytics?type=${type}`);
    setAnalytics(res.data);
  };

  useEffect(() => {
    fetchData();
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchAnalytics(analyticsType);
  }, [analyticsType]);

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete?")) return;
    await API.delete(`/transactions/${id}`);
    fetchData();
    fetchSummary();
    fetchAnalytics(analyticsType);
  };

  /* ================= FILTER ================= */
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = async () => {
    const params = new URLSearchParams(
      Object.entries(filters).filter(([_, v]) => v)
    ).toString();

    const res = await API.get(`/transactions/filter?${params}`);
    setTransactions(res.data);
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      division: "",
      startDate: "",
      endDate: "",
    });
    fetchData();
  };

  /* ================= TRANSFER GROUPING (LOGIC ONLY) ================= */
  const grouped = [];
  const usedTransferIds = new Set();

  transactions.forEach((t) => {
    if (t.category === "transfer" && t.transferId) {
      if (usedTransferIds.has(t.transferId)) return;

      const pair = transactions.filter(
        (x) => x.transferId === t.transferId
      );

      if (pair.length === 2) {
        const from = pair.find((x) => x.type === "expense");
        const to = pair.find((x) => x.type === "income");

        grouped.push({
          _id: t.transferId,
          transferId: t.transferId,
          isTransfer: true,
          amount: t.amount,
          fromAccount: from.account,
          toAccount: to.account,
          division: t.division,
        });

        usedTransferIds.add(t.transferId);
      }
    } else {
      grouped.push(t);
    }
  });

  return (
    <div className="min-h-screen bg-slate-100 py-10">
      <div className="max-w-5xl mx-auto px-4">

        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Money Manager
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track income & expenses professionally
            </p>
          </div>

          <button
            onClick={() => {
              setEditData(null);
              setOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700
            text-white px-5 py-2.5 rounded-xl
            text-sm font-semibold shadow-sm transition"
          >
            + Add Transaction
          </button>
        </div>

        {/* ================= ANALYTICS ================= */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Analytics
            </h2>

            <select
              value={analyticsType}
              onChange={(e) => setAnalyticsType(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-2 text-sm"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white border rounded-2xl p-6">
              <p className="text-sm text-slate-500">Income</p>
              <p className="text-2xl font-bold text-emerald-600 mt-2">
                ₹ {analytics.income}
              </p>
            </div>

            <div className="bg-white border rounded-2xl p-6">
              <p className="text-sm text-slate-500">Expense</p>
              <p className="text-2xl font-bold text-rose-500 mt-2">
                ₹ {analytics.expense}
              </p>
            </div>

            <div className="bg-white border rounded-2xl p-6">
              <p className="text-sm text-slate-500">Balance</p>
              <p className="text-2xl font-bold text-slate-800 mt-2">
                ₹ {analytics.balance}
              </p>
            </div>
          </div>
        </div>

        {/* ================= TRANSFER ================= */}
        <TransferForm
          onSuccess={() => {
            fetchData();
            fetchSummary();
            fetchAnalytics(analyticsType);
          }}
        />

        {/* ================= FILTERS ================= */}
<div className="bg-white border rounded-2xl p-6 mb-10">
  <h3 className="text-base font-semibold text-slate-800 mb-4">
    Filter Transactions
  </h3>

  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
    {/* CATEGORY */}
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">
        Category
      </label>
      <select
        name="category"
        value={filters.category}
        onChange={handleFilterChange}
        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
      >
        <option value="">All</option>
        <option value="food">Food</option>
        <option value="fuel">Fuel</option>
        <option value="movie">Movie</option>
        <option value="loan">Loan</option>
        <option value="medical">Medical</option>
        <option value="transfer">Transfer</option>
      </select>
    </div>

    {/* DIVISION */}
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">
        Division
      </label>
      <select
        name="division"
        value={filters.division}
        onChange={handleFilterChange}
        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
      >
        <option value="">All</option>
        <option value="personal">Personal</option>
        <option value="office">Office</option>
      </select>
    </div>

    {/* FROM DATE */}
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">
        From Date
      </label>
      <input
        type="date"
        name="startDate"
        value={filters.startDate}
        onChange={handleFilterChange}
        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
      />
    </div>

    {/* TO DATE */}
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">
        To Date
      </label>
      <input
        type="date"
        name="endDate"
        value={filters.endDate}
        onChange={handleFilterChange}
        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
      />
    </div>
  </div>

  {/* ACTION BUTTONS */}
  <div className="flex justify-end gap-4 mt-6">
    <button
      onClick={resetFilters}
      className="px-5 py-2 rounded-xl text-sm border border-slate-300 text-slate-600 hover:bg-slate-100"
    >
      Reset
    </button>

    <button
      onClick={applyFilters}
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-medium"
    >
      Apply Filters
    </button>
  </div>
</div>


        {/* ================= TRANSACTIONS ================= */}
<div className="space-y-4">
  {grouped.map((t) =>
    t.isTransfer ? (
      /* ===== TRANSFER CARD ===== */
      <div
        key={t._id}
        className="bg-white border rounded-2xl p-5 flex justify-between"
      >
        <div>
          <p className="font-medium text-slate-800">
            Transfer: {t.fromAccount} → {t.toAccount}
          </p>
          <p className="text-sm text-slate-500">{t.division}</p>
        </div>

        <div className="flex gap-6 items-center">
          <p className="font-semibold text-indigo-600">
            ₹ {t.amount}
          </p>

          {/* ✅ DELETE TRANSFER */}
          <button
            onClick={async () => {
              if (!window.confirm("Delete this transfer?")) return;

              await API.delete(
                `/transactions/transfer/${t.transferId}`
              );

              fetchData();
              fetchSummary();
              fetchAnalytics(analyticsType);
            }}
            className="text-rose-500 text-xs hover:underline"
          >
            Delete
          </button>
        </div>
      </div>
    ) : (
      /* ===== NORMAL TRANSACTION CARD ===== */
      <div
        key={t._id}
        className="bg-white border rounded-2xl p-5 flex justify-between"
      >
        <div>
          <p className="font-medium text-slate-800">
            {t.category} ({t.type})
          </p>
          <p className="text-sm text-slate-500">{t.division}</p>
        </div>

        <div className="flex gap-6 items-center">
  <p className="font-semibold text-indigo-600">
    ₹ {t.amount}
  </p>

  {/* ✏️ EDIT */}
  <button
    onClick={() => {
      setEditData(t);   
      setOpen(true);    
    }}
    className="text-indigo-600 text-xs hover:underline"
  >
    Edit
  </button>

  {/* 🗑 DELETE */}
  <button
    onClick={async () => {
      if (!window.confirm("Delete this transaction?")) return;

      await API.delete(`/transactions/${t._id}`);

      fetchData();
      fetchSummary();
      fetchAnalytics(analyticsType);
    }}
    className="text-rose-500 text-xs hover:underline"
  >
    Delete
  </button>
</div>

      </div>
    )
  )}
</div>
{/* ================= MODAL ================= */}
{open && (
  <AddTransactionModal
    initialData={editData}
    onSuccess={() => {
      fetchData();
      fetchSummary();
      fetchAnalytics(analyticsType);
      setOpen(false); 
    }}
    onClose={() => setOpen(false)}
  />
)}

      </div>
    </div>
  );
}

export default Home;
