import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import { CheckCircle, Error, Schedule, Sync } from '@mui/icons-material';
import apiService from '../services/apiService';

function SyncStatus() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    loadLogs();
    // Her 30 saniyede bir logları güncelle
    const interval = setInterval(loadLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadLogs = async () => {
    try {
      const response = await apiService.getLogs();
      if (response.success) {
        setLogs(response.data.slice(0, 5)); // Son 5 log
        if (response.data.length > 0) {
          setLastSync(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle color="success" />;
      case 'ERROR':
        return <Error color="error" />;
      default:
        return <Schedule color="info" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS':
        return 'success';
      case 'ERROR':
        return 'error';
      default:
        return 'info';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Sync sx={{ mr: 2, color: 'info.main' }} />
          <Typography variant="h6">
            Senkronizasyon Durumu
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            {lastSync && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {getStatusIcon(lastSync.status)}
                  <Chip
                    label={lastSync.status}
                    color={getStatusColor(lastSync.status)}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Son Senkronizasyon: {formatDate(lastSync.createdAt)}
                </Typography>
                {lastSync.recordCount && (
                  <Typography variant="body2" color="textSecondary">
                    İşlenen Kayıt: {lastSync.recordCount}
                  </Typography>
                )}
              </Box>
            )}

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Son İşlemler:
            </Typography>
            <List dense>
              {logs.map((log, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getStatusIcon(log.status)}
                        <Chip
                          label={log.status}
                          color={getStatusColor(log.status)}
                          size="small"
                          sx={{ ml: 1, mr: 1 }}
                        />
                        <Typography variant="caption">
                          {formatDate(log.createdAt)}
                        </Typography>
                      </Box>
                    }
                    secondary={log.message}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default SyncStatus;
