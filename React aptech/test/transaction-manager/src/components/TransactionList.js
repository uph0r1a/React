import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    Container,
    Typography,
} from "@mui/material";

function TransactionList({ transactions, onDelete }) {
    const navigate = useNavigate();
    const [descending, setDescending] = useState(true);

    const sortedTransactions = [...transactions].sort((a, b) =>
        descending ? b.amount - a.amount : a.amount - b.amount
    );

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this transaction?")) {
            onDelete(id);
        }
    };

    return (
        <Container>
            <Typography variant="h4" align="center" gutterBottom>
                Financial Transaction Manager
            </Typography>

            <Button
                variant="contained"
                onClick={() => setDescending(!descending)}
                sx={{ marginRight: 2 }}
            >
                Sort by Amount
            </Button>

            <Button
                variant="contained"
                color="success"
                onClick={() => navigate("/add")}
            >
                Add New Transaction
            </Button>

            <Table sx={{ marginTop: 3 }}>
                <TableHead>
                    <TableRow>
                        <TableCell>Description</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {sortedTransactions.map((t) => (
                        <TableRow key={t.id}>
                            <TableCell>{t.description}</TableCell>
                            <TableCell>{t.type}</TableCell>
                            <TableCell>${t.amount}</TableCell>
                            <TableCell>
                                <Button
                                    onClick={() => navigate(`/edit/${t.id}`)}
                                    size="small"
                                >
                                    Edit
                                </Button>
                                <Button
                                    color="error"
                                    size="small"
                                    onClick={() => handleDelete(t.id)}
                                >
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Container>
    );
}

export default TransactionList;
