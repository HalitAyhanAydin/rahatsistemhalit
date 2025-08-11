const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Tüm hesap verilerini getir (kırılımlı yapıda)
router.get('/accounts', async (req, res) => {
  try {
    const allAccounts = await prisma.accountData.findMany({
      orderBy: { hesapKodu: 'asc' }
    });

    // Kırılımları oluştur
    const hierarchicalData = buildHierarchy(allAccounts);
    
    res.json({
      success: true,
      data: hierarchicalData,
      total: allAccounts.length
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API loglarını getir
router.get('/logs', async (req, res) => {
  try {
    const logs = await prisma.apiLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Kırılımlı yapı oluştur
function buildHierarchy(accounts) {
  const groupMap = {};
  
  // Group accounts by hesapKodu patterns
  accounts.forEach(account => {
    const parts = account.hesapKodu.split('.');
    
    if (parts.length >= 1) {
      const mainCode = parts[0];
      if (!groupMap[mainCode]) {
        groupMap[mainCode] = {
          hesapKodu: mainCode,
          hesapAdi: mainCode,
          toplamBorc: 0,
          seviye: 'Ana Grup',
          children: {}
        };
      }
    }
    
    if (parts.length >= 2) {
      const mainCode = parts[0];
      const subCode = `${parts[0]}.${parts[1]}`;
      if (!groupMap[mainCode].children[subCode]) {
        groupMap[mainCode].children[subCode] = {
          hesapKodu: subCode,
          hesapAdi: subCode,
          toplamBorc: 0,
          seviye: 'Alt Grup',
          children: []
        };
      }
    }
    
    // Add the actual account as a detail
    if (parts.length >= 3) {
      const mainCode = parts[0];
      const subCode = `${parts[0]}.${parts[1]}`;
      groupMap[mainCode].children[subCode].children.push({
        hesapKodu: account.hesapKodu,
        hesapAdi: account.hesapKodu,
        toplamBorc: parseFloat(account.toplamBorc) || 0,
        seviye: 'Detay Hesap'
      });
    }
  });

  // Calculate totals
  Object.values(groupMap).forEach(mainGroup => {
    Object.values(mainGroup.children).forEach(subGroup => {
      subGroup.toplamBorc = subGroup.children.reduce((sum, detail) => sum + detail.toplamBorc, 0);
    });
    
    mainGroup.toplamBorc = Object.values(mainGroup.children).reduce((sum, subGroup) => sum + subGroup.toplamBorc, 0);
    
    // Convert children object to array
    mainGroup.children = Object.values(mainGroup.children);
  });

  return Object.values(groupMap);
}

module.exports = router;
