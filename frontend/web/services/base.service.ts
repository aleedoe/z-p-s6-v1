import { apiClient } from '@/config/api/client';
import { AxiosRequestConfig } from 'axios';

export class BaseService {
    protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await apiClient.getAxiosInstance().get<T>(url, config);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    protected async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await apiClient.getAxiosInstance().post<T>(url, data, config);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    protected async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await apiClient.getAxiosInstance().put<T>(url, data, config);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    protected async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await apiClient.getAxiosInstance().patch<T>(url, data, config);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await apiClient.getAxiosInstance().delete<T>(url, config);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    protected handleError(error: any): Error {
        if (error.response) {
            const message = error.response.data?.message ||
                error.response.data?.error ||
                'Server error occurred';
            return new Error(message);
        } else if (error.request) {
            return new Error('No response from server. Please check your connection.');
        } else {
            return new Error(error.message || 'An unexpected error occurred');
        }
    }
}