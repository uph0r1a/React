import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    website: ''
  });

  const isUserFormValid = () => {
    return (
      newUser.name.trim() !== "" &&
      newUser.email.trim() !== "" &&
      newUser.phone.trim() !== "" &&
      newUser.website.trim() !== ""
    );
  };

  const navigate = useNavigate();

  const getUser = () =>
    JSON.parse(localStorage.getItem('user'));

  const isAdmin = () =>
    getUser()?.role === 'admin';

  useEffect(() => {
    axios.get('https://jsonplaceholder.typicode.com/users')
      .then(res => setUsers(res.data));
  }, []);

  return (
    <Paper sx={{ m: 3 }}>
      {isAdmin() && (
        <Button
          variant="contained"
          sx={{ m: 2 }}
          onClick={() => setAddUserOpen(true)}
        >
          Add User
        </Button>
      )}
      <Dialog open={addUserOpen} onClose={() => setAddUserOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add User</DialogTitle>

        <DialogContent>
          <TextField
            required
            fullWidth
            label="Name"
            placeholder='Enter name'
            type='text'
            margin="normal"
            value={newUser.name}
            onChange={e => setNewUser({ ...newUser, name: e.target.value })}
          />
          <TextField
            required
            fullWidth
            label="Email"
            placeholder='Enter email'
            type='email'
            margin="normal"
            value={newUser.email}
            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
          />
          <TextField
            required
            fullWidth
            label="Phone"
            placeholder='Enter phone number'
            type='tel'
            margin="normal"
            value={newUser.phone}
            onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
          />
          <TextField
            required
            fullWidth
            label="Website"
            placeholder='Enter website URL'
            type='url'
            margin="normal"
            value={newUser.website}
            onChange={e => setNewUser({ ...newUser, website: e.target.value })}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setAddUserOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!isUserFormValid()}
            onClick={() => {
              setUsers([
                ...users,
                { ...newUser, id: users.length + 1 }
              ]);
              setNewUser({ name: '', email: '', phone: '', website: '' });
              setAddUserOpen(false);
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Website</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {users.map(u => (
            <TableRow key={u.id}>
              <TableCell>{u.id}</TableCell>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.phone}</TableCell>
              <TableCell>{u.website}</TableCell>
              <TableCell>
                <Button onClick={() => navigate(`/users/${u.id}`)}>View</Button>

                {isAdmin() && (
                  <>
                    <Button onClick={() => setEditUser(u)}>Edit</Button>
                    <Button
                      color="error"
                      onClick={() =>
                        setUsers(users.filter(x => x.id !== u.id))
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

      <Dialog open={!!editUser} onClose={() => setEditUser(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit User</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            margin="normal"
            value={editUser?.name || ''}
            onChange={e =>
              setEditUser({ ...editUser, name: e.target.value })
            }
          />

          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={editUser?.email || ''}
            onChange={e =>
              setEditUser({ ...editUser, email: e.target.value })
            }
          />

          <TextField
            fullWidth
            label="Phone"
            margin="normal"
            value={editUser?.phone || ''}
            onChange={e =>
              setEditUser({ ...editUser, phone: e.target.value })
            }
          />

          <TextField
            fullWidth
            label="Website"
            margin="normal"
            value={editUser?.website || ''}
            onChange={e =>
              setEditUser({ ...editUser, website: e.target.value })
            }
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditUser(null)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setUsers(users.map(u =>
                u.id === editUser.id ? editUser : u
              ));
              setEditUser(null);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

    </Paper>
  );
};

export default Users;
