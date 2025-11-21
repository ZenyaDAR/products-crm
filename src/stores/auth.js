import { defineStore } from 'pinia';
import axios from '@/api/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null
  }),

actions: {
    async login(login, password) {
      const response = await axios.post('/auth/login', { login, password });

      const token = response.data.token;
      const user = response.data.user;

      if (!token) {
        throw new Error("Сервер не прислал токен!");
      }

      this.token = token;
      this.user = user;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return true;
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
    },
    
    init() {
      if (this.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      }
    }
  }
});