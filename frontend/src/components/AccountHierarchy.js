import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { ExpandMore, ExpandLess, AccountTree } from '@mui/icons-material';

function AccountHierarchy({ data, onAccountSelect }) {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [selectedAccount, setSelectedAccount] = useState(null);

  const toggleExpanded = (itemKey) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemKey)) {
      newExpanded.delete(itemKey);
    } else {
      newExpanded.add(itemKey);
    }
    setExpandedItems(newExpanded);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 1: return 'primary';
      case 2: return 'secondary';
      case 3: return 'success';
      default: return 'default';
    }
  };

  const getLevelLabel = (seviye) => {
    if (seviye) return seviye;
    return 'Bilinmiyor';
  };

  const handleAccountClick = (account) => {
    setSelectedAccount(account);
    if (onAccountSelect) {
      onAccountSelect(account);
    }
  };

  const renderAccountRow = (item, depth = 0, parentKey = '') => {
    const itemKey = `${parentKey}-${item.hesapKodu}`;
    const isExpanded = expandedItems.has(itemKey);
    const hasChildren = item.children && item.children.length > 0;

    const rows = [];

    // Ana satır
    rows.push(
      <TableRow 
        key={itemKey}
        sx={{ 
          backgroundColor: depth === 0 ? 'action.hover' : 'transparent',
          '&:hover': { backgroundColor: 'action.selected' },
          cursor: 'pointer'
        }}
        onClick={() => handleAccountClick(item)}
      >
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', pl: depth * 3 }}>
            {hasChildren && (
              <IconButton
                size="small"
                onClick={() => toggleExpanded(itemKey)}
                sx={{ mr: 1 }}
              >
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
            {!hasChildren && <Box sx={{ width: 40 }} />}
            <AccountTree sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body1" fontWeight={depth === 0 ? 'bold' : 'normal'}>
              {item.hesapKodu}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Typography 
            variant="body1" 
            fontWeight={depth === 0 ? 'bold' : 'normal'}
            color={item.toplamBorc > 0 ? 'error.main' : 'text.primary'}
          >
            {formatCurrency(item.toplamBorc)}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={getLevelLabel(item.seviye)}
            color={getLevelColor(item.level)}
            size="small"
            variant="outlined"
          />
        </TableCell>
      </TableRow>
    );

    // Alt öğeler (collapsed state)
    if (hasChildren) {
      rows.push(
        <TableRow key={`${itemKey}-collapse`}>
          <TableCell colSpan={3} sx={{ p: 0, border: 0 }}>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 2 }}>
                <Table size="small">
                  <TableBody>
                    {item.children.map(child => 
                      renderAccountRow(child, depth + 1, itemKey)
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      );
    }

    return rows;
  };

  if (!data || data.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="textSecondary">
          Henüz veri bulunmuyor
        </Typography>
        <Typography variant="body2" color="textSecondary">
          API'den veri senkronizasyonu bekleniyor...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {selectedAccount && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: 'primary.light', borderRadius: 1 }}>
          <Typography variant="h6" color="white">
            Seçilen Hesap: {selectedAccount.hesapKodu}
          </Typography>
          <Typography variant="h4" color="white" fontWeight="bold">
            {formatCurrency(selectedAccount.toplamBorc)}
          </Typography>
          <Typography variant="body2" color="white">
            Seviye: {getLevelLabel(selectedAccount.seviye)}
          </Typography>
        </Box>
      )}
      
      <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="h6">Hesap Kodu</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="h6">Toplam Borç</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="h6">Seviye</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(item => renderAccountRow(item))}
        </TableBody>
      </Table>
    </TableContainer>
    </>
  );
}

export default AccountHierarchy;
