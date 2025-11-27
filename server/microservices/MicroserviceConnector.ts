/**
 * FANZ Unified Ecosystem - Microservice Connector Base Class
 * Base class for connecting to individual microservices
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { serviceRegistry } from './ServiceRegistry';

export interface MicroserviceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

export abstract class MicroserviceConnector {
  protected axios: AxiosInstance;
  protected serviceId: string;
  protected serviceName: string;
  protected baseURL: string;

  constructor(serviceId: string) {
    this.serviceId = serviceId;
    const service = serviceRegistry.getService(serviceId);

    if (!service) {
      throw new Error(`Service ${serviceId} not found in registry`);
    }

    this.serviceName = service.name;
    this.baseURL = `http://localhost:${service.port}${service.endpoint}`;

    this.axios = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Connector': this.serviceName
      }
    });

    // Request interceptor
    this.axios.interceptors.request.use(
      (config) => {
        console.log(`📤 Request to ${this.serviceName}: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error(`❌ Request error for ${this.serviceName}:`, error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axios.interceptors.response.use(
      (response) => {
        console.log(`📥 Response from ${this.serviceName}: ${response.status}`);
        return response;
      },
      (error) => {
        console.error(`❌ Response error from ${this.serviceName}:`, error.message);
        if (error.code === 'ECONNREFUSED') {
          serviceRegistry.updateServiceStatus(this.serviceId, 'error');
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Make a GET request
   */
  protected async get<T = any>(path: string, config?: AxiosRequestConfig): Promise<MicroserviceResponse<T>> {
    try {
      const response = await this.axios.get<T>(path, config);
      return {
        success: true,
        data: response.data,
        statusCode: response.status
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Make a POST request
   */
  protected async post<T = any>(path: string, data?: any, config?: AxiosRequestConfig): Promise<MicroserviceResponse<T>> {
    try {
      const response = await this.axios.post<T>(path, data, config);
      return {
        success: true,
        data: response.data,
        statusCode: response.status
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Make a PUT request
   */
  protected async put<T = any>(path: string, data?: any, config?: AxiosRequestConfig): Promise<MicroserviceResponse<T>> {
    try {
      const response = await this.axios.put<T>(path, data, config);
      return {
        success: true,
        data: response.data,
        statusCode: response.status
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Make a PATCH request
   */
  protected async patch<T = any>(path: string, data?: any, config?: AxiosRequestConfig): Promise<MicroserviceResponse<T>> {
    try {
      const response = await this.axios.patch<T>(path, data, config);
      return {
        success: true,
        data: response.data,
        statusCode: response.status
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Make a DELETE request
   */
  protected async delete<T = any>(path: string, config?: AxiosRequestConfig): Promise<MicroserviceResponse<T>> {
    try {
      const response = await this.axios.delete<T>(path, config);
      return {
        success: true,
        data: response.data,
        statusCode: response.status
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * Handle errors from microservice calls
   */
  private handleError(error: any): MicroserviceResponse {
    if (error.response) {
      return {
        success: false,
        error: error.response.data?.message || error.message,
        statusCode: error.response.status
      };
    } else if (error.code === 'ECONNREFUSED') {
      return {
        success: false,
        error: `Service ${this.serviceName} is unavailable`,
        statusCode: 503
      };
    } else if (error.code === 'ETIMEDOUT') {
      return {
        success: false,
        error: `Request to ${this.serviceName} timed out`,
        statusCode: 504
      };
    } else {
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
        statusCode: 500
      };
    }
  }

  /**
   * Check if the service is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.axios.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Get service information
   */
  getServiceInfo() {
    return {
      serviceId: this.serviceId,
      serviceName: this.serviceName,
      baseURL: this.baseURL
    };
  }
}
