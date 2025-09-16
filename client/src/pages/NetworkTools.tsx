import { useState } from 'react';
import { Globe, Wifi, Shield, Search, Key, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

type NetworkTool = 'ping' | 'traceroute' | 'dns' | 'whois' | 'ssl' | 'port';

export function NetworkTools() {
  const [selectedTool, setSelectedTool] = useState<NetworkTool>('ping');
  const [target, setTarget] = useState('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const tools = [
    { id: 'ping' as const, name: 'Ping', icon: Wifi, description: 'Check host availability' },
    { id: 'port' as const, name: 'Port Check', icon: Shield, description: 'Check TCP port status' },
    { id: 'dns' as const, name: 'DNS Lookup', icon: Globe, description: 'Query DNS records' },
    { id: 'whois' as const, name: 'WHOIS', icon: Search, description: 'Domain registration info' },
    { id: 'ssl' as const, name: 'SSL Check', icon: Key, description: 'Verify SSL certificate' },
    { id: 'traceroute' as const, name: 'Traceroute', icon: AlertCircle, description: 'Trace network path' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;

    setLoading(true);
    setResult('');

    try {
      const response = await fetch(`http://localhost:3001/api/network/${selectedTool}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      });

      const data = await response.json();
      setResult(data.result || data.error || 'No result');
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Network Diagnostic Tools</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Diagnose network issues and check connectivity
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={cn(
                "p-4 rounded-lg border-2 transition-all",
                selectedTool === tool.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              )}
            >
              <Icon className={cn(
                "h-6 w-6 mx-auto",
                selectedTool === tool.id ? "text-blue-600 dark:text-blue-400" : "text-gray-400"
              )} />
              <p className={cn(
                "mt-2 text-sm font-medium",
                selectedTool === tool.id
                  ? "text-blue-900 dark:text-blue-100"
                  : "text-gray-900 dark:text-gray-100"
              )}>
                {tool.name}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedTool === 'port' ? 'Host:Port' : 
               selectedTool === 'dns' ? 'Domain Name' :
               selectedTool === 'whois' ? 'Domain/IP' :
               selectedTool === 'ssl' ? 'HTTPS URL' : 'Target Host'}
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder={
                selectedTool === 'port' ? 'example.com:80' :
                selectedTool === 'ssl' ? 'https://example.com' :
                'example.com'
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !target}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Running...' : 'Run Test'}
          </button>
        </form>

        {result && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Result:</h3>
            <pre className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}