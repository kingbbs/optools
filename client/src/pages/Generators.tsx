import { useState } from 'react';
import { Key, FileCode, Fingerprint, Hash } from 'lucide-react';
import { cn } from '../lib/utils';

type GeneratorTool = 'password' | 'uuid' | 'gitignore' | 'sshkey';

export function Generators() {
  const [selectedTool, setSelectedTool] = useState<GeneratorTool>('password');
  const [output, setOutput] = useState('');

  const [passwordOptions, setPasswordOptions] = useState({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const [gitignoreOptions, setGitignoreOptions] = useState({
    language: 'node',
  });

  const tools = [
    { id: 'password' as const, name: 'Password', icon: Key, description: 'Generate secure password' },
    { id: 'uuid' as const, name: 'UUID', icon: Fingerprint, description: 'Generate unique ID' },
    { id: 'gitignore' as const, name: '.gitignore', icon: FileCode, description: 'Generate gitignore file' },
    { id: 'sshkey' as const, name: 'SSH Key', icon: Hash, description: 'Generate SSH keypair' },
  ];

  const generatePassword = () => {
    let charset = '';
    if (passwordOptions.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (passwordOptions.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (passwordOptions.numbers) charset += '0123456789';
    if (passwordOptions.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!charset) {
      setOutput('Please select at least one character type');
      return;
    }

    let password = '';
    for (let i = 0; i < passwordOptions.length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setOutput(password);
  };

  const generateUuid = () => {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    setOutput(uuid);
  };

  const generateGitignore = () => {
    const templates: Record<string, string> = {
      node: `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production
/build
/dist

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Testing
/coverage

# Logs
logs/
*.log`,
      python: `# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# Virtual Environment
venv/
env/
ENV/
.venv

# Distribution / packaging
.Python
build/
develop-eggs/
dist/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# PyCharm
.idea/

# Jupyter Notebook
.ipynb_checkpoints

# Environment
.env
.env.local

# macOS
.DS_Store`,
      java: `# Compiled class file
*.class

# Log file
*.log

# Package Files
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar

# Maven
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next

# Gradle
.gradle/
build/

# IntelliJ IDEA
.idea/
*.iws
*.iml
*.ipr
out/

# Eclipse
.classpath
.project
.settings/

# macOS
.DS_Store`,
    };

    setOutput(templates[gitignoreOptions.language] || 'Template not found');
  };

  const generateSshKey = () => {
    setOutput(`To generate SSH keys, run these commands in your terminal:

# Generate new SSH key pair
ssh-keygen -t ed25519 -C "your_email@example.com"

# Or for RSA (legacy systems)
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Start SSH agent
eval "$(ssh-agent -s)"

# Add key to SSH agent
ssh-add ~/.ssh/id_ed25519

# Copy public key to clipboard (macOS)
pbcopy < ~/.ssh/id_ed25519.pub

# Copy public key to clipboard (Linux)
xclip -selection clipboard < ~/.ssh/id_ed25519.pub`);
  };

  const handleGenerate = () => {
    switch (selectedTool) {
      case 'password':
        generatePassword();
        break;
      case 'uuid':
        generateUuid();
        break;
      case 'gitignore':
        generateGitignore();
        break;
      case 'sshkey':
        generateSshKey();
        break;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Generators</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Generate passwords, UUIDs, and configuration files
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => {
                setSelectedTool(tool.id);
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
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {tool.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        {selectedTool === 'password' && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password Length: {passwordOptions.length}
              </label>
              <input
                type="range"
                min="8"
                max="64"
                value={passwordOptions.length}
                onChange={(e) => setPasswordOptions({ ...passwordOptions, length: parseInt(e.target.value) })}
                className="mt-1 w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={passwordOptions.uppercase}
                  onChange={(e) => setPasswordOptions({ ...passwordOptions, uppercase: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Uppercase (A-Z)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={passwordOptions.lowercase}
                  onChange={(e) => setPasswordOptions({ ...passwordOptions, lowercase: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Lowercase (a-z)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={passwordOptions.numbers}
                  onChange={(e) => setPasswordOptions({ ...passwordOptions, numbers: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Numbers (0-9)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={passwordOptions.symbols}
                  onChange={(e) => setPasswordOptions({ ...passwordOptions, symbols: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Symbols (!@#$...)</span>
              </label>
            </div>
          </div>
        )}

        {selectedTool === 'gitignore' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Project Type
            </label>
            <select
              value={gitignoreOptions.language}
              onChange={(e) => setGitignoreOptions({ language: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm px-3 py-2"
            >
              <option value="node">Node.js</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
          </div>
        )}

        <button
          onClick={handleGenerate}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Generate
        </button>

        {output && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Result
            </label>
            <pre className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 text-sm text-gray-800 dark:text-gray-200 overflow-x-auto font-mono">
              {output}
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="mt-2 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Copy to Clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}