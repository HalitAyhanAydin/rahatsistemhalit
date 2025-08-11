const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const https = require('https');

const prisma = new PrismaClient();

// SSL doğrulama hatası için agent oluştur
const httpsAgent = new https.Agent({  
  rejectUnauthorized: false
});

class ApiService {
  constructor() {
    this.tokenUrl = process.env.TOKEN_URL;
    this.dataUrl = process.env.DATA_URL;
    this.username = process.env.API_USERNAME;
    this.password = process.env.API_PASSWORD;
    this.token = null;
  }

  // Basic Auth token oluştur
  getBasicAuthToken() {
    const credentials = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    return `Basic ${credentials}`;
  }

  // API token al
  async getToken() {
    try {
      const response = await axios.post(
        this.tokenUrl,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.getBasicAuthToken()
          },
          httpsAgent: httpsAgent
        }
      );

      if (response.data && response.data.response && response.data.response.token) {
        this.token = response.data.response.token;
        return this.token;
      } else {
        throw new Error('Token not found in response');
      }
    } catch (error) {
      console.error('Error getting token:', error.message);
      throw error;
    }
  }

  // Veri çek
  async fetchData() {
    try {
      if (!this.token) {
        await this.getToken();
      }

      const response = await axios.patch(
        this.dataUrl,
        {
          fieldData: {},
          script: "getData"
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          httpsAgent: httpsAgent
        }
      );

      if (response.data && response.data.response && response.data.response.scriptResult) {
        const scriptResult = response.data.response.scriptResult;
        
        // JSON string'i parse et
        let data;
        try {
          data = JSON.parse(scriptResult);
        } catch (parseError) {
          console.error('Error parsing scriptResult:', parseError);
          throw new Error('Invalid JSON in scriptResult');
        }

        return data;
      } else {
        throw new Error('No data found in response');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Token expired, get new token and retry
        this.token = null;
        await this.getToken();
        return this.fetchData();
      }
      console.error('Error fetching data:', error.message);
      throw error;
    }
  }

  // Verileri senkronize et
  async syncApiData() {
    try {
      console.log('Fetching data from API...');
      const apiData = await this.fetchData();
      
      if (!Array.isArray(apiData)) {
        throw new Error('API data is not an array');
      }

      console.log(`Received ${apiData.length} records from API`);

      let updatedCount = 0;
      let createdCount = 0;

      for (const item of apiData) {
        if (!item.hesap_kodu || item.borc === undefined) {
          console.warn('Skipping invalid item:', item);
          continue;
        }

        // API'den gelen veri formatı farklı - dönüştürme
        const hesapKodu = item.hesap_kodu;
        const toplamBorc = parseFloat(item.borc) || 0;

        const existingRecord = await prisma.accountData.findUnique({
          where: { hesapKodu: hesapKodu }
        });

        if (existingRecord) {
          if (existingRecord.toplamBorc !== toplamBorc) {
            await prisma.accountData.update({
              where: { hesapKodu: hesapKodu },
              data: { 
                toplamBorc: toplamBorc,
                updatedAt: new Date()
              }
            });
            updatedCount++;
          }
        } else {
          await prisma.accountData.create({
            data: {
              hesapKodu: hesapKodu,
              toplamBorc: toplamBorc
            }
          });
          createdCount++;
        }
      }

      // Log kaydı oluştur
      await prisma.apiLog.create({
        data: {
          status: 'SUCCESS',
          message: `Created: ${createdCount}, Updated: ${updatedCount}`,
          recordCount: apiData.length
        }
      });

      console.log(`Sync completed: ${createdCount} created, ${updatedCount} updated`);
      
      return {
        success: true,
        created: createdCount,
        updated: updatedCount,
        total: apiData.length
      };

    } catch (error) {
      console.error('Sync error:', error);
      
      // Hata logunu kaydet
      await prisma.apiLog.create({
        data: {
          status: 'ERROR',
          message: error.message,
          recordCount: 0
        }
      });

      throw error;
    }
  }
}

module.exports = new ApiService();
