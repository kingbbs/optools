import { Router } from 'express';
import crypto from 'crypto';

const router = Router();

router.post('/password', async (req, res) => {
  try {
    const { length = 16, uppercase = true, lowercase = true, numbers = true, symbols = true } = req.body.options || {};
    
    let charset = '';
    if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) charset += '0123456789';
    if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!charset) {
      return res.status(400).json({ error: 'At least one character type must be selected' });
    }

    let password = '';
    const randomBytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      password += charset[randomBytes[i] % charset.length];
    }

    res.json({ result: password });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/uuid', async (req, res) => {
  try {
    const uuid = crypto.randomUUID();
    res.json({ result: uuid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/gitignore', async (req, res) => {
  try {
    const { language = 'node' } = req.body.options || {};
    
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

    const template = templates[language];
    if (!template) {
      return res.status(400).json({ error: 'Unsupported language' });
    }

    res.json({ result: template });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;