import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class ApiService {
  constructor() {
    this.axios = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Response interceptor for error handling
    this.axios.interceptors.response.use(
      response => response,
      error => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // Hesap verilerini getir
  async getAccounts() {
    try {
      const response = await this.axios.get('/api/accounts');
      return response.data;
    } catch (error) {
      throw new Error('Hesap verileri alınamadı');
    }
  }

  // Manuel senkronizasyon
  async manualSync() {
    try {
      const response = await this.axios.post('/api/sync');
      return response.data;
    } catch (error) {
      throw new Error('Senkronizasyon başarısız');
    }
  }

  // API loglarını getir
  async getLogs() {
    try {
      const response = await this.axios.get('/api/logs');
      return response.data;
    } catch (error) {
      throw new Error('Log verileri alınamadı');
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.axios.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('Sunucu bağlantısı başarısız');
    }
  }
}

const apiService = new ApiService();
export default apiService;
