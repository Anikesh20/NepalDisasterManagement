import { Box, Chip, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';

export default function Donations() {
  const { token } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDonations() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/payments/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch donations');
        setRows(data);
      } catch (err: any) {
        setError(err.message || 'Error fetching donations');
      } finally {
        setLoading(false);
      }
    }
    fetchDonations();
  }, [token]);

  const columns = [
    { field: 'id', headerName: 'ID', width: 120 },
    { field: 'amount', headerName: 'Amount', width: 120, renderCell: (params: any) => `Rs. ${params.value}` },
    { field: 'date', headerName: 'Date', width: 120 },
    { field: 'status', headerName: 'Status', width: 120, renderCell: (params: any) => <Chip label={params.value} color={params.value === 'completed' ? 'success' : params.value === 'pending' ? 'warning' : 'error'} size="small" /> },
    { field: 'campaign', headerName: 'Campaign', flex: 1, minWidth: 180 },
  ];

  return (
    <Box sx={{ width: '100%', px: 0, py: 0, fontFamily: 'sans-serif', background: '#f8f9fa' }}>
      <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 800, mb: 3, mt: 2, ml: 2 }}>
        Donation Management
      </Typography>
      <Box sx={{
        height: 650,
        width: '100%',
        background: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: 3,
        boxShadow: '0 2px 12px #0001',
        p: 0,
        mx: 0,
      }}>
        <DataGrid
          rows={rows}
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