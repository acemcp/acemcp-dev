'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

// MCP Configuration Types
export interface MCPConfig {
  file: File | null;
  serverLink: string;
  apiKey: string;
  isConfigured: boolean;
  configType: 'file' | 'server' | null; // Which option was selected
}

// Context Type
interface MCPContextType {
  mcpConfig: MCPConfig;
  setFile: (file: File | null) => void;
  setServerLink: (link: string) => void;
  setApiKey: (key: string) => void;
  setConfigType: (type: 'file' | 'server' | null) => void;
  configureMCP: (config: Partial<MCPConfig>) => void;
  clearConfig: () => void;
  isValidConfig: () => boolean;
}

// Create Context
const MCPContext = createContext<MCPContextType | undefined>(undefined);

// Provider Component
export function MCPProvider({ children }: { children: ReactNode }) {
  const [mcpConfig, setMcpConfig] = useState<MCPConfig>({
    file: null,
    serverLink: '',
    apiKey: '',
    isConfigured: false,
    configType: null,
  });

  console.log("mcpConfig", mcpConfig);
  

  const setFile = (file: File | null) => {
    setMcpConfig(prev => ({
      ...prev,
      file,
      configType: file ? 'file' : null,
      isConfigured: file ? true : (prev.serverLink ? true : false),
    }));
  };

  const setServerLink = (link: string) => {
    setMcpConfig(prev => ({
      ...prev,
      serverLink: link,
      configType: link ? 'server' : (prev.file ? 'file' : null),
      isConfigured: link ? true : (prev.file ? true : false),
    }));
  };

  const setApiKey = (key: string) => {
    setMcpConfig(prev => ({
      ...prev,
      apiKey: key,
      // API key doesn't change config type or configured status
      configType: prev.configType,
      isConfigured: prev.isConfigured,
    }));
  };

  const setConfigType = (type: 'file' | 'server' | null) => {
    setMcpConfig(prev => ({
      ...prev,
      configType: type,
    }));
  };

  const configureMCP = (config: Partial<MCPConfig>) => {
    setMcpConfig(prev => {
      const newConfig = { ...prev, ...config };

      // Auto-determine config type and validity
      let configType: 'file' | 'server' | null = null;
      let isConfigured = false;

      if (newConfig.file) {
        configType = 'file';
        isConfigured = true;
      } else if (newConfig.serverLink) {
        configType = 'server';
        isConfigured = true;
      }

      return {
        ...newConfig,
        configType,
        isConfigured,
      };
    });
  };

  const clearConfig = () => {
    setMcpConfig({
      file: null,
      serverLink: '',
      apiKey: '',
      isConfigured: false,
      configType: null,
    });
  };

  const isValidConfig = (): boolean => {
    return mcpConfig.isConfigured &&
      ((mcpConfig.configType === 'file' && mcpConfig.file !== null) ||
        (mcpConfig.configType === 'server' && mcpConfig.serverLink));
  };

  const value: MCPContextType = {
    mcpConfig,
    setFile,
    setServerLink,
    setApiKey,
    setConfigType,
    configureMCP,
    clearConfig,
    isValidConfig,
  };

  return (
    <MCPContext.Provider value={value}>
      {children}
    </MCPContext.Provider>
  );
}

// Custom Hook
export function useMCP() {
  const context = useContext(MCPContext);
  if (context === undefined) {
    throw new Error('useMCP must be used within an MCPProvider');
  }
  return context;
}

// Export the context for advanced usage
export { MCPContext };
