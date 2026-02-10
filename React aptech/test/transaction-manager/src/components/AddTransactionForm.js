import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    TextField,
    Button,
    Container,
    MenuItem,
    Typography,
} from "@mui/material";
import Transaction from "../models/Transaction";

function AddTransactionForm({ onSave, transactions = [] }) {
    const navigate = useNavigate();
    const { id } = useParams();

    const existingTransaction = transactions.find(
        (t) => t.id === Number(id)
    );

    const [description, setDescription] = useState("");
    const [type, setType] = useState("Income");
    const [amount, setAmount] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (existingTransaction) {
            setDescription(existingTransaction.description);
            setType(existingTransaction.type);
            setAmount(existingTransaction.amount);
        }
    }, [existingTransaction]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!description.trim()) {
            setError("Description cannot be empty");
            return;
        }

        if (amount <= 0) {
            setError("Amount must be a positive number");
            return;
        }

        const transaction = new Transaction(
            existingTransaction ? existingTransaction.id : Date.now(),
            description,
            type,
            Number(amount)
        );

        onSave(transaction);
        navigate("/");
    };

    return (
        <Container>
            <Typography variant="h5" gutterBottom>
                {existingTransaction ? "Edit Transaction" : "Add New Transaction"}
            </Typography>

            {error && <Typography color="error">{error}</Typography>}

            <form onSubmit={handleSubmit}>
                <TextField
                    label="Description"
                    fullWidth
                    margin="normal"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <TextField
                    select
                    label="Type"
                    fullWidth
                    margin="normal"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                >
                    <MenuItem value="Income">Income</MenuItem>
                    <MenuItem value="Expense">Expense</MenuItem>
                </TextField>

                <TextField
                    label="Amount"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />

                <Button type="submit" variant="contained" sx={{ marginTop: 2 }}>
                    Save
                </Button>
            </form>
        </Container>
    );
}

export default AddTransactionForm;
