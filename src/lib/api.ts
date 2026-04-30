import axios, { AxiosError } from 'axios'
import { auth } from './firebase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3070/'
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const getAuthToken = (): Promise<string | null> => {
  return new Promise((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser.getIdToken());
      return;
    }
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      if (user) {
        resolve(user.getIdToken());
      } else {
        resolve(null);
      }
    });
  });
}

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      const currentEntidadId = localStorage.getItem('currentEntidadId')
      if (currentEntidadId) {
        config.headers['x-entidad-id'] = currentEntidadId
      }
    } catch (error) {
      console.error('Error al obtener token de Firebase:', error);
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

export const fetcher = (url: string) => api.get(url).then(res => res.data)

export default api
