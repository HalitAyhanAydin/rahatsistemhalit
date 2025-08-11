import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Snackbar
} from '@mui/material';
import { Refresh, Timeline, AccountBalance } from '@mui/icons-material';
import AccountHierarchy from './components/AccountHierarchy';
import SyncStatus from './components/SyncStatus';
import apiService from './services/apiService';

function App() {
  const [hierarchyData, setHierarchyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [stats, setStats] = useState({ total: 0, totalDebt: 0 });
  const [selectedAccountDebt, setSelectedAccountDebt] = useState(0);

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAccounts();
      
      if (response.success) {
        setHierarchyData(response.data);
        calculateStats(response.data);
      } else {
        setError('Veri yüklenirken hata oluştu');
      }
    } catch (err) {
      setError('Sunucuya bağlanılamadı');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    let total = 0;
    let totalDebt = 0;

    const countAccounts = (items) => {
      items.forEach(item => {
        if (item.level === 3) {
          total++;
          totalDebt += item.toplamBorc;
        }
        if (item.children && Array.isArray(item.children)) {
          countAccounts(item.children);
        }
      });
    };

    countAccounts(data);
    setStats({ total, totalDebt });
  };

  const handleManualSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      
      const response = await apiService.manualSync();
      
      if (response.success) {
        setSyncSuccess(true);
        await loadData(); // Verileri yeniden yükle
      } else {
        setError('Senkronizasyon başarısız');
      }
    } catch (err) {
      setError('Senkronizasyon sırasında hata oluştu');
      console.error('Sync error:', err);
    } finally {
      setSyncing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const handleAccountSelect = (account) => {
    setSelectedAccountDebt(account.toplamBorc);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <AccountBalance sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Rahat Sistem - Hesap Kodu Analizi
          </Typography>
          <Button
            color="inherit"
            onClick={handleManualSync}
            disabled={syncing}
            startIcon={syncing ? <CircularProgress size={20} /> : <Refresh />}
          >
            {syncing ? 'Senkronize Ediliyor...' : 'Manuel Senkronizasyon'}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl">
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* İstatistikler */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Timeline sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Toplam Hesap Sayısı
                    </Typography>
                    <Typography variant="h4">
                      {stats.total}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountBalance sx={{ mr: 2, color: 'secondary.main' }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Toplam Borç
                    </Typography>
                    <Typography variant="h4">
                      {formatCurrency(selectedAccountDebt > 0 ? selectedAccountDebt : stats.totalDebt)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <SyncStatus />
          </Grid>
        </Grid>

        {/* Ana İçerik */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Hesap Kodu Hiyerarşisi
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Hesap kodları 3 seviyeli kırılım ile gösterilmektedir: İlk 3 rakam, İlk 5 rakam, Tam kod
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <AccountHierarchy data={hierarchyData} onAccountSelect={handleAccountSelect} />
          )}
        </Paper>

        {/* Başarı mesajı */}
        <Snackbar
          open={syncSuccess}
          autoHideDuration={4000}
          onClose={() => setSyncSuccess(false)}
        >
          <Alert severity="success" onClose={() => setSyncSuccess(false)}>
            Veriler başarıyla senkronize edildi!
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default App;
