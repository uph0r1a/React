import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TransactionList from "./components/TransactionList";
import AddTransactionForm from "./components/AddTransactionForm";
import Transaction from "./models/Transaction";

function App() {
  const [transactions, setTransactions] = useState([
    new Transaction(1, "Salary", "Income", 3000),
    new Transaction(2, "Groceries", "Expense", 200),
    new Transaction(3, "Investment", "Income", 500),
  ]);

  const addTransaction = (transaction) => {
    setTransactions([...transactions, transaction]);
  };

  const updateTransaction = (updatedTransaction) => {
    setTransactions(
      transactions.map((t) =>
        t.id === updatedTransaction.id ? updatedTransaction : t
      )
    );
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <TransactionList
              transactions={transactions}
              onDelete={deleteTransaction}
            />
          }
        />
        <Route
          path="/add"
          element={<AddTransactionForm onSave={addTransaction} />}
        />
        <Route
          path="/edit/:id"
          element={
            <AddTransactionForm
              transactions={transactions}
              onSave={updateTransaction}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
