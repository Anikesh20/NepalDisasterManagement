import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';

export default function Reports() {
  const { token } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reports/admin', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch reports');
      setRows(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [token]);

  const handleAction = async (id: string, action: 'verify' | 'reject') => {
    setActionLoading(true);
    try {
      const url = `/api/reports/${id}/status`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'verify' ? 'verified' : 'rejected' })
      });
      if (!res.ok) throw new Error('Failed to update report');
      await fetchReports();
      setSelected(null);
    } catch (err: any) {
      alert(err.message || 'Error updating report');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 120 },
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 180 },
    { field: 'type', headerName: 'Type', width: 120 },
    { field: 'district', headerName: 'District', width: 120 },
    { field: 'status', headerName: 'Status', width: 120, renderCell: (params: any) => <Chip label={params.value} color={params.value === 'verified' ? 'success' : params.value === 'pending' ? 'warning' : 'default'} size="small" /> },
    { field: 'timestamp', headerName: 'Date', width: 160, renderCell: (params: any) => new Date(params.value).toLocaleString() },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 220,
      sortable: false,
      renderCell: (params: any) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => setSelected(params.row)}>View</Button>
          {params.row.status === 'pending' && <Button size="small" color="success" variant="contained" onClick={() => handleAction(params.row.id, 'verify')}>Verify</Button>}
          {params.row.status === 'pending' && <Button size="small" color="error" variant="contained" onClick={() => handleAction(params.row.id, 'reject')}>Reject</Button>}
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%', px: 0, py: 0, fontFamily: 'sans-serif', background: '#f8f9fa' }}>
      <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 800, mb: 3, mt: 2, ml: 2 }}>
        Report Management
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
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Report Details</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Box>
              <Typography><b>ID:</b> {selected.id}</Typography>
              <Typography><b>Title:</b> {selected.title}</Typography>
              <Typography><b>Type:</b> {selected.type}</Typography>
              <Typography><b>District:</b> {selected.district}</Typography>
              <Typography><b>Status:</b> <Chip label={selected.status} color={selected.status === 'verified' ? 'success' : selected.status === 'pending' ? 'warning' : 'default'} size="small" /></Typography>
              <Typography><b>Date:</b> {new Date(selected.timestamp).toLocaleString()}</Typography>
              <Typography><b>Description:</b> {selected.description}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)} color="primary">Close</Button>
          {selected && selected.status === 'pending' && <Button onClick={() => handleAction(selected.id, 'verify')} color="success" variant="contained" disabled={actionLoading}>Verify</Button>}
          {selected && selected.status === 'pending' && <Button onClick={() => handleAction(selected.id, 'reject')} color="error" variant="contained" disabled={actionLoading}>Reject</Button>}
        </DialogActions>
      </Dialog>
    </Box>
  );
} 