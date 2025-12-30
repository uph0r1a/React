import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';


const Products = () => {
  const [products, setProducts] = useState([]);
  const fetchProducts = async () => {
    const res = await axios.get('https://fakestoreapi.com/products');
    return res.data;
  };

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  const handleDelete = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Image</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map(product => (
            <TableRow key={product.id}>
              <TableCell>{product.title}</TableCell>
              <TableCell>${product.price}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell><Avatar src={product.image} variant="square" /></TableCell>
              <TableCell>
                <Link to={`/products/${product.id}`}>View</Link>
                <Button color="error" onClick={() => handleDelete(product.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Products;
