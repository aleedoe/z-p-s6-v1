import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from './config';

class ApiClient {
    private instance: AxiosInstance;

    constructor() {
        this.instance = axios.create(API_CONFIG);
        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor
        this.instance.interceptors.request.use(
            (config) => {
                // Tambahkan token dari localStorage jika ada
                const token = this.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.instance.interceptors.response.use(
            (response) => response,
            (error) => {
                this.handleResponseError(error);
                return Promise.reject(error);
            }
        );
    }

    private getToken(): string | null {
        // Implementasi sesuai kebutuhan
        // return localStorage.getItem('token');
        return null;
    }

    private handleResponseError(error: any): void {
        if (error.response) {
            console.error('Response Error:', error.response.data);

            // Handle specific status codes
            switch (error.response.status) {
                case 401:
                    // Unauthorized - redirect to login
                    console.error('Unauthorized access');
                    break;
                case 403:
                    // Forbidden
                    console.error('Access forbidden');
                    break;
                case 404:
                    console.error('Resource not found');
                    break;
                case 500:
                    console.error('Internal server error');
                    break;
            }
        } else if (error.request) {
            console.error('Request Error:', error.request);
        } else {
            console.error('Error:', error.message);
        }
    }

    public getAxiosInstance(): AxiosInstance {
        return this.instance;
    }
}

export const apiClient = new ApiClient();