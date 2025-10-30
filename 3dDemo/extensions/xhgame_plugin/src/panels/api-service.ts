/**
 * API 服务模块
 * 用于调用后端 Node.js 服务 (xhgame_nodejs_service)
 */

const API_BASE_URL = 'http://localhost:3001/api';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

class ApiService {
    private async request<T = any>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const url = `${API_BASE_URL}${endpoint}`;
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || `HTTP ${response.status}`,
                    message: data.message
                };
            }

            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('API request failed:', error);
            return {
                success: false,
                error: 'Network error',
                message: error instanceof Error ? error.message : String(error)
            };
        }
    }

    // 包管理 API
    async getPackages() {
        return this.request('/packages');
    }

    async getVersion() {
        return this.request('/cocos-editor/version');
    }

    async getPackageDetails(packageName: string) {
        return this.request(`/packages/${encodeURIComponent(packageName)}`);
    }

    async extractPackage(packageName: string) {
        return this.request(`/packages/${encodeURIComponent(packageName)}/extract`, {
            method: 'POST'
        });
    }

    // 文件操作 API
    async copyFile(source: string, destination: string) {
        return this.request('/files/copy', {
            method: 'POST',
            body: JSON.stringify({ source, destination })
        });
    }

    async moveFile(source: string, destination: string) {
        return this.request('/files/move', {
            method: 'POST',
            body: JSON.stringify({ source, destination })
        });
    }

    async deleteFile(filePath: string) {
        return this.request('/files/delete', {
            method: 'DELETE',
            body: JSON.stringify({ filePath })
        });
    }

    async readFile(filePath: string) {
        return this.request(`/files/read?filePath=${encodeURIComponent(filePath)}`);
    }

    async writeFile(filePath: string, content: string) {
        return this.request('/files/write', {
            method: 'POST',
            body: JSON.stringify({ filePath, content })
        });
    }

    // 健康检查
    async healthCheck() {
        try {
            const response = await fetch('http://localhost:3001/health');
            return response.ok;
        } catch {
            return false;
        }
    }

    // 检查服务是否可用
    async isServiceAvailable(): Promise<boolean> {
        return this.healthCheck();
    }
    async nodejsMessage(target: string, method: string, ...args: any[]): Promise<any> {
        let options = {
            method: 'POST',
            body: JSON.stringify(args)
        }
        console.log('options', options)
        return this.request('/' + method, options);
    }
}

// 导出单例实例
export const apiService = new ApiService();

// 导出类型
export type { ApiResponse };