import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';

const UsersContainer = styled.div`
  padding: 1.5rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  background-color: #1e4620;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: #143016;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  background-color: #f5f5f5;
  border-bottom: 2px solid #ddd;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #ddd;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.delete ? '#e53935' : '#1e4620'};
  cursor: pointer;
  margin-right: 0.5rem;
  
  &:hover {
    opacity: 0.8;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
`;

const Input = styled(Field)`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const ErrorText = styled.div`
  color: #e53935;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const Checkbox = styled(Field)`
  margin-right: 0.5rem;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const CancelButton = styled.button`
  background-color: #f5f5f5;
  color: #333;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const SubmitButton = styled.button`
  background-color: #1e4620;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #143016;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const UserSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  name: Yup.string()
    .required('Full name is required'),
  password: Yup.string()
    .when('isEditing', {
      is: false,
      then: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
      otherwise: Yup.string().test('password', 'Password must be at least 6 characters if provided', 
        value => !value || value.length === 0 || value.length >= 6)
    }),
  isAdmin: Yup.boolean()
});

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users');
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setCurrentUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setCurrentUser({
      ...user,
      password: '',
      isEditing: true
    });
    setShowModal(true);
  };

  const handleDeleteConfirmation = (userId) => {
    setDeleteConfirmation(userId);
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmation) return;
    
    try {
      await axios.delete(`/api/users/${deleteConfirmation}`);
      setUsers(users.filter(user => user.id !== deleteConfirmation));
      setDeleteConfirmation(null);
      setError('');
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (values.isEditing) {
        // Update existing user
        const { id, isEditing, ...userData } = values;
        
        // If password is empty, remove it from the request
        if (!userData.password) {
          delete userData.password;
        }
        
        await axios.put(`/api/users/${id}`, userData);
        
        // Update local state
        setUsers(users.map(u => u.id === id ? { ...u, ...userData } : u));
      } else {
        // Create new user
        const response = await axios.post('/api/users', values);
        setUsers([...users, response.data]);
      }
      
      setShowModal(false);
      resetForm();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user.isAdmin) {
    return (
      <UsersContainer>
        <h1>Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </UsersContainer>
    );
  }

  return (
    <UsersContainer>
      <PageHeader>
        <h1>User Management</h1>
        <Button onClick={handleAddUser}>
          <FaUserPlus /> Add User
        </Button>
      </PageHeader>

      {error && <ErrorText>{error}</ErrorText>}

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Username</Th>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <Td>{user.username}</Td>
                <Td>{user.name}</Td>
                <Td>{user.email}</Td>
                <Td>{user.isAdmin ? 'Admin' : 'User'}</Td>
                <Td>
                  <ActionButton onClick={() => handleEditUser(user)}>
                    <FaEdit />
                  </ActionButton>
                  <ActionButton 
                    delete 
                    onClick={() => handleDeleteConfirmation(user.id)}
                    disabled={user.id === user.id} // Prevent deleting yourself
                  >
                    <FaTrash />
                  </ActionButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Add/Edit User Modal */}
      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h2>{currentUser ? 'Edit User' : 'Add New User'}</h2>
              <CloseButton onClick={() => setShowModal(false)}>&times;</CloseButton>
            </ModalHeader>
            
            <Formik
              initialValues={currentUser || {
                username: '',
                email: '',
                name: '',
                password: '',
                isAdmin: false,
                isEditing: false
              }}
              validationSchema={UserSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form>
                  <FormGroup>
                    <Label htmlFor="username">Username</Label>
                    <Input type="text" id="username" name="username" />
                    {errors.username && touched.username && (
                      <ErrorText>{errors.username}</ErrorText>
                    )}
                  </FormGroup>
                  
                  <FormGroup>
                    <Label htmlFor="email">Email</Label>
                    <Input type="email" id="email" name="email" />
                    {errors.email && touched.email && (
                      <ErrorText>{errors.email}</ErrorText>
                    )}
                  </FormGroup>
                  
                  <FormGroup>
                    <Label htmlFor="name">Full Name</Label>
                    <Input type="text" id="name" name="name" />
                    {errors.name && touched.name && (
                      <ErrorText>{errors.name}</ErrorText>
                    )}
                  </FormGroup>
                  
                  <FormGroup>
                    <Label htmlFor="password">
                      {currentUser ? 'Password (leave blank to keep current)' : 'Password'}
                    </Label>
                    <Input type="password" id="password" name="password" />
                    {errors.password && touched.password && (
                      <ErrorText>{errors.password}</ErrorText>
                    )}
                  </FormGroup>
                  
                  <CheckboxContainer>
                    <Checkbox type="checkbox" id="isAdmin" name="isAdmin" />
                    <Label htmlFor="isAdmin" style={{ display: 'inline', marginBottom: 0 }}>
                      Admin User
                    </Label>
                  </CheckboxContainer>
                  
                  <ModalFooter>
                    <CancelButton type="button" onClick={() => setShowModal(false)}>
                      Cancel
                    </CancelButton>
                    <SubmitButton type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Save User'}
                    </SubmitButton>
                  </ModalFooter>
                </Form>
              )}
            </Formik>
          </ModalContent>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h2>Confirm Delete</h2>
              <CloseButton onClick={() => setDeleteConfirmation(null)}>&times;</CloseButton>
            </ModalHeader>
            
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            
            <ModalFooter>
              <CancelButton onClick={() => setDeleteConfirmation(null)}>
                Cancel
              </CancelButton>
              <SubmitButton onClick={handleDeleteUser} style={{ backgroundColor: '#e53935' }}>
                Delete User
              </SubmitButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </UsersContainer>
  );
};

export default Users;