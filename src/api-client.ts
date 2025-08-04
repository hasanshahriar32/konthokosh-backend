import axios from 'axios';
import { logAudit } from './utils/log';

const apiClient = axios.create();

// Request interceptor
apiClient.interceptors.request.use((config) => {
  (config as any).metadata = { startTime: Date.now() };
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    const { method, url, data } = response.config;
    const status = response.status;
    const responseLength = JSON.stringify(response.data).length;
    const duration = Date.now() - (response.config as any).metadata.startTime;

    logAudit(
      `${method?.toUpperCase()} ${url} ${status} ${duration} ms - ${responseLength} ${JSON.stringify(data)}`
    );
    return response;
  },
  (error) => {
    const config = error.config || {};
    const { method, url, data } = config;
    const duration = Date.now() - (config?.metadata?.startTime || Date.now());
    const status = error.response?.status || 'ERROR';
    const responseLength = error.response
      ? JSON.stringify(error.response.data).length
      : 0;

    logAudit(
      `${method?.toUpperCase()} ${url} ${status} ${duration} ms - ${responseLength} ${JSON.stringify(data)}`
    );
    return Promise.reject(error);
  }
);

export default apiClient;
