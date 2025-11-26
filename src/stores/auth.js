import { defineStore } from 'pinia';
import axios from '@/api/axios';
import { jwtDecode } from 'jwt-decode';

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
    checkToken() {
      if (!this.token) return;

      try {
        const decoded = jwtDecode(this.token);
        const now = Date.now() / 1000;

        if (decoded.exp < now) {
          this.logout();
        } else {
          axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        }
      } catch {
        this.logout();
      }
    }
  }
});