import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Button, Dialog, DialogContent, DialogActions, DialogTitle, TextField } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    category: '',
    image: ''
  });

  const navigate = useNavigate();

  const getUser = () =>
    JSON.parse(localStorage.getItem('user'));

  const isAdmin = () =>
    getUser()?.role === 'admin';

  useEffect(() => {
    axios.get('https://fakestoreapi.com/products')
      .then(res => setProducts(res.data));
  }, []);

  return (
    <Paper sx={{ m: 3 }}>
      {isAdmin() && (
        <Button
          variant="contained"
          sx={{ m: 2 }}
          onClick={() => setAddProductOpen(true)}
        >
          Add Product
        </Button>
      )}
      <Dialog open={addProductOpen} onClose={() => setAddProductOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Product</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            margin="normal"
            value={newProduct.title}
            onChange={e => setNewProduct({ ...newProduct, title: e.target.value })}
          />

          <TextField
            fullWidth
            label="Price"
            type="number"
            margin="normal"
            value={newProduct.price}
            onChange={e =>
              setNewProduct({ ...newProduct, price: Number(e.target.value) })
            }
          />

          <TextField
            fullWidth
            label="Category"
            margin="normal"
            value={newProduct.category}
            onChange={e =>
              setNewProduct({ ...newProduct, category: e.target.value })
            }
          />

          <TextField
            fullWidth
            label="Image URL"
            margin="normal"
            value={newProduct.image}
            onChange={e =>
              setNewProduct({ ...newProduct, image: e.target.value })
            }
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setAddProductOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setProducts([
                ...products,
                { ...newProduct, id: products.length + 1 }
              ]);
              setNewProduct({ title: '', price: '', category: '', image: '' });
              setAddProductOpen(false);
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

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
          {products.map(p => (
            <TableRow key={p.id}>
              <TableCell>{p.title}</TableCell>
              <TableCell>${p.price}</TableCell>
              <TableCell>{p.category}</TableCell>
              <TableCell>
                <img src={p.image} width={40} alt={p.title} />
              </TableCell>
              <TableCell>
                <Button onClick={() => navigate(`/products/${p.id}`)}>
                  View
                </Button>

                {isAdmin() && (
                  <>
                    <Button onClick={() => setEditProduct(p)}>Edit</Button>
                    <Button
                      color="error"
                      onClick={() =>
                        setProducts(products.filter(x => x.id !== p.id))
                      }
                    >
                      Delete
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog
        open={!!editProduct}
        onClose={() => setEditProduct(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Product</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            margin="normal"
            value={editProduct?.title || ''}
            onChange={e =>
              setEditProduct({ ...editProduct, title: e.target.value })
            }
          />

          <TextField
            fullWidth
            label="Price"
            type="number"
            margin="normal"
            value={editProduct?.price || ''}
            onChange={e =>
              setEditProduct({
                ...editProduct,
                price: Number(e.target.value)
              })
            }
          />

          <TextField
            fullWidth
            label="Category"
            margin="normal"
            value={editProduct?.category || ''}
            onChange={e =>
              setEditProduct({ ...editProduct, category: e.target.value })
            }
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditProduct(null)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setProducts(
                products.map(p =>
                  p.id === editProduct.id ? editProduct : p
                )
              );
              setEditProduct(null);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

    </Paper>
  );
};

export default Products;
