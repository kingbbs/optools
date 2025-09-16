export function Security() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Security Tools</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Security analysis and audit tools
      </p>

      <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Security Features</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Security tools will be implemented in phase 2, including:
        </p>
        <ul className="mt-4 list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <li>SSL/TLS certificate analysis</li>
          <li>Security header checker</li>
          <li>Password strength analyzer</li>
          <li>Hash calculator (MD5, SHA256, etc.)</li>
          <li>Vulnerability scanner integration</li>
        </ul>
      </div>
    </div>
  );
}