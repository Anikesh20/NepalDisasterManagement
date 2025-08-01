import { Box, Chip, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';

export default function Users() {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
        setUsers(data.users || []);
      } catch (err: any) {
        setError(err.message || 'Error fetching users');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [token]);

  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'full_name', headerName: 'Name', flex: 1, minWidth: 180 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
    { field: 'district', headerName: 'District', flex: 1, minWidth: 120 },
    { field: 'is_volunteer', headerName: 'Volunteer', width: 120, renderCell: (params: any) => <Chip label={params.value ? 'Yes' : 'No'} color={params.value ? 'success' : 'default'} size="small" /> },
    { field: 'created_at', headerName: 'Created', width: 140, renderCell: (params: any) => new Date(params.value).toLocaleDateString() },
  ];

  return (
    <Box sx={{ width: '100%', px: 0, py: 0, fontFamily: 'sans-serif', background: '#f8f9fa', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 800, mb: 3, mt: 2, ml: 2 }}>
        User Management
      </Typography>
      <Typography sx={{ color: '#444', mb: 2, ml: 2, fontWeight: 600 }}>
        {users.length} users registered
      </Typography>
      {error && <Typography color="error" sx={{ mb: 2, ml: 2 }}>{error}</Typography>}
      <Box sx={{
        height: 600,
        width: '100%',
        background: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: 3,
        boxShadow: '0 2px 12px #0001',
        p: 0,
        mx: 0,
      }}>
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          pageSize={15}
          rowsPerPageOptions={[15, 30, 50]}
          getRowId={row => row.id}
          sx={{
            fontSize: 17,
            '& .MuiDataGrid-columnHeaders': {
              fontSize: 19,
              fontWeight: 800,
              background: '#f3f6fa',
              borderBottom: '2px solid #e0e0e0',
              textAlign: 'center',
              '& .MuiDataGrid-columnHeaderTitle': {
                width: '100%',
                textAlign: 'center',
                justifyContent: 'center',
                display: 'flex',
              },
            },
            '& .MuiDataGrid-cell': {
              py: 2,
              textAlign: 'center',
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex',
            },
            '& .MuiDataGrid-footerContainer': {
              background: '#f3f6fa',
            },
          }}
        />
      </Box>
    </Box>
  );
} 