import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';

export default function Volunteers() {
  const { token } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [certLoadingId, setCertLoadingId] = useState<string | null>(null);

  const fetchVolunteers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/volunteers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch volunteers');
      setRows(data.volunteers || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching volunteers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVolunteers(); }, [token]);

  const handleAction = async (id: string, action: 'activate' | 'deactivate') => {
    setActionLoading(true);
    try {
      const url = `/api/admin/volunteers/${id}/${action === 'activate' ? 'verify' : 'reject'}`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to update volunteer');
      await fetchVolunteers();
      setSelected(null);
    } catch (err: any) {
      alert(err.message || 'Error updating volunteer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendCertificate = async (volunteer: any) => {
    setCertLoadingId(volunteer.id);
    try {
      const res = await fetch(`/api/admin/volunteers/${volunteer.id}/send-certificate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send certificate');
      alert(`Certificate sent to ${volunteer.full_name} (${volunteer.email})!`);
    } catch (err: any) {
      alert(err.message || 'Error sending certificate');
    } finally {
      setCertLoadingId(null);
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'full_name', headerName: 'Name', flex: 1, minWidth: 180 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
    { field: 'status', headerName: 'Status', width: 120, renderCell: (params: any) => <Chip label={params.value} color={params.value === 'active' ? 'success' : params.value === 'pending' ? 'warning' : 'default'} size="small" /> },
    { field: 'skills', headerName: 'Skills', flex: 1, minWidth: 200, renderCell: (params: any) => Array.isArray(params.value) ? params.value.join(', ') : params.value },
    { field: 'created_at', headerName: 'Registered', width: 140, renderCell: (params: any) => new Date(params.value).toLocaleDateString() },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 320,
      sortable: false,
      renderCell: (params: any) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => setSelected(params.row)}>View</Button>
          {(params.row.status === 'pending' || params.row.status === 'inactive') && (
            <Button size="small" color="success" variant="contained" onClick={() => handleAction(params.row.id, 'activate')}>Activate</Button>
          )}
          {params.row.status !== 'inactive' && <Button size="small" color="error" variant="contained" onClick={() => handleAction(params.row.id, 'deactivate')}>Deactivate</Button>}
          <Button size="small" color="info" variant="contained" onClick={() => handleSendCertificate(params.row)} disabled={certLoadingId === params.row.id}>Send Certificate</Button>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%', px: 0, py: 0, fontFamily: 'sans-serif', background: '#f8f9fa' }}>
      <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 800, mb: 3, mt: 2, ml: 2 }}>
        Volunteer Management
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
        <DialogTitle>Volunteer Details</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Box>
              <Typography><b>ID:</b> {selected.id}</Typography>
              <Typography><b>Name:</b> {selected.full_name}</Typography>
              <Typography><b>Email:</b> {selected.email}</Typography>
              <Typography><b>Status:</b> <Chip label={selected.status} color={selected.status === 'active' ? 'success' : selected.status === 'pending' ? 'warning' : 'default'} size="small" /></Typography>
              <Typography><b>Skills:</b> {Array.isArray(selected.skills) ? selected.skills.join(', ') : selected.skills}</Typography>
              <Typography><b>Registered:</b> {new Date(selected.created_at).toLocaleDateString()}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)} color="primary">Close</Button>
          {selected && (selected.status === 'pending' || selected.status === 'inactive') && <Button onClick={() => handleAction(selected.id, 'activate')} color="success" variant="contained" disabled={actionLoading}>Activate</Button>}
          {selected && selected.status !== 'inactive' && <Button onClick={() => handleAction(selected.id, 'deactivate')} color="error" variant="contained" disabled={actionLoading}>Deactivate</Button>}
          {selected && <Button onClick={() => handleSendCertificate(selected)} color="info" variant="contained" disabled={certLoadingId === selected.id}>Send Certificate</Button>}
        </DialogActions>
      </Dialog>
    </Box>
  );
} 