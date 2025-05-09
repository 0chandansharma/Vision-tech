// src/pages/admin/UserManagementPage.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchUsers, deleteUser } from '../../store/admin/adminSlice';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { formatDate } from '../../utils/date.utils';
import UserAddEditDialog from '../../components/admin/UserAddEditDialog';

const UserManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, isLoading } = useSelector((state: RootState) => state.admin);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowAddDialog(true);
  };

  const handleAddDialogClose = () => {
    setShowAddDialog(false);
    setEditingUser(null);
  };

  const handleDeleteClick = (user: any) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      await dispatch(deleteUser(userToDelete.id));
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddDialog(true)}
        >
          Add User
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role.name} 
                        color={user.role.name === 'admin' ? 'error' : 
                              user.role.name === 'engineer' ? 'info' : 'success'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.is_active ? 'Active' : 'Inactive'} 
                        color={user.is_active ? 'success' : 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>{user.last_login ? formatDate(user.last_login) : 'Never'}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEditUser(user)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteClick(user)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit User Dialog */}
      <UserAddEditDialog
        open={showAddDialog}
        onClose={handleAddDialogClose}
        user={editingUser}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user "{userToDelete?.username}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementPage;