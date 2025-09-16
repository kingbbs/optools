import { useState } from 'react';
import { FileText, Hash, Code, FileJson, Calendar, Lock } from 'lucide-react';
import { cn } from '../lib/utils';

type EncoderTool = 'base64' | 'url' | 'jwt' | 'json' | 'yaml' | 'cron';

export function EncodersDecoders() {
  const [selectedTool, setSelectedTool] = useState<EncoderTool>('base64');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [action, setAction] = useState<'encode' | 'decode' | 'format'>('encode');

  const tools = [
    { id: 'base64' as const, name: 'Base64', icon: FileText, actions: ['encode', 'decode'] },
    { id: 'url' as const, name: 'URL', icon: Hash, actions: ['encode', 'decode'] },
    { id: 'jwt' as const, name: 'JWT', icon: Lock, actions: ['decode'] },
    { id: 'json' as const, name: 'JSON', icon: FileJson, actions: ['format', 'minify'] },
    { id: 'yaml' as const, name: 'YAML', icon: Code, actions: ['format', 'validate'] },
    { id: 'cron' as const, name: 'Cron', icon: Calendar, actions: ['parse', 'generate'] },
  ];

  const handleBase64 = () => {
    try {
      if (action === 'encode') {
        setOutput(btoa(input));
      } else {
        setOutput(atob(input));
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Invalid input'}`);
    }
  };

  const handleUrl = () => {
    try {
      if (action === 'encode') {
        setOutput(encodeURIComponent(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Invalid input'}`);
    }
  };

  const handleJwt = () => {
    try {
      const parts = input.split('.');
      if (parts.length !== 3) {
        setOutput('Error: Invalid JWT format');
        return;
      }
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      setOutput(JSON.stringify({ header, payload }, null, 2));
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Invalid JWT'}`);
    }
  };

  const handleJson = () => {
    try {
      const parsed = JSON.parse(input);
      if (action === 'format') {
        setOutput(JSON.stringify(parsed, null, 2));
      } else {
        setOutput(JSON.stringify(parsed));
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
    }
  };

  const handleProcess = () => {
    switch (selectedTool) {
      case 'base64':
        handleBase64();
        break;
      case 'url':
        handleUrl();
        break;
      case 'jwt':
        handleJwt();
        break;
      case 'json':
        handleJson();
        break;
      default:
        setOutput('Tool not implemented yet');
    }
  };

  const currentTool = tools.find(t => t.id === selectedTool);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Encoders & Decoders</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Encode, decode, and format various data formats
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => {
                setSelectedTool(tool.id);
                setAction(tool.actions[0] as any);
                setInput('');
                setOutput('');
              }}
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
        {currentTool && (
          <div className="mb-4 flex gap-2">
            {currentTool.actions.map((act) => (
              <button
                key={act}
                onClick={() => setAction(act as any)}
                className={cn(
                  "px-3 py-1 rounded-md text-sm font-medium",
                  action === act
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                )}
              >
                {act.charAt(0).toUpperCase() + act.slice(1)}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Input
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Enter text to ${action}...`}
              className="w-full h-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-3 font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Output
            </label>
            <textarea
              value={output}
              readOnly
              placeholder="Result will appear here..."
              className="w-full h-64 rounded-md border-gray-300 shadow-sm bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white p-3 font-mono text-sm"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleProcess}
            disabled={!input}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Process
          </button>
          <button
            onClick={() => {
              setInput('');
              setOutput('');
            }}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Clear
          </button>
          {output && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Copy Output
            </button>
          )}
        </div>
      </div>
    </div>
  );
}