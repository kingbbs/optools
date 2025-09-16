export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface NetworkDiagnostic {
  type: 'ping' | 'traceroute' | 'dns' | 'whois' | 'ssl';
  target: string;
  result?: any;
  timestamp: Date;
}

export interface EncodingRequest {
  type: 'base64' | 'url' | 'jwt' | 'json' | 'yaml';
  action: 'encode' | 'decode' | 'format' | 'validate';
  input: string;
}

export interface GeneratorRequest {
  type: 'password' | 'gitignore' | 'sshkey' | 'uuid';
  options?: Record<string, any>;
}