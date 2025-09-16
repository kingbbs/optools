import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import dns from 'dns';
import net from 'net';

const router = Router();
const execAsync = promisify(exec);
const dnsLookup = promisify(dns.lookup);
const dnsResolve4 = promisify(dns.resolve4);

router.post('/ping', async (req, res) => {
  try {
    const { target } = req.body;
    if (!target) {
      return res.status(400).json({ error: 'Target is required' });
    }

    const command = process.platform === 'win32' 
      ? `ping -n 4 ${target}`
      : `ping -c 4 ${target}`;

    const { stdout, stderr } = await execAsync(command, { timeout: 10000 });
    res.json({ result: stdout || stderr });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/port', async (req, res) => {
  try {
    const { target } = req.body;
    if (!target) {
      return res.status(400).json({ error: 'Target is required' });
    }

    const [host, port] = target.split(':');
    if (!host || !port) {
      return res.status(400).json({ error: 'Format should be host:port' });
    }

    const client = new net.Socket();
    const timeout = 5000;

    const promise = new Promise((resolve, reject) => {
      client.setTimeout(timeout);
      
      client.on('connect', () => {
        client.destroy();
        resolve(`Port ${port} is open on ${host}`);
      });

      client.on('timeout', () => {
        client.destroy();
        reject(new Error(`Connection timeout`));
      });

      client.on('error', (err) => {
        reject(new Error(`Port ${port} is closed or unreachable: ${err.message}`));
      });

      client.connect(parseInt(port), host);
    });

    const result = await promise;
    res.json({ result });
  } catch (error: any) {
    res.json({ result: error.message });
  }
});

router.post('/dns', async (req, res) => {
  try {
    const { target } = req.body;
    if (!target) {
      return res.status(400).json({ error: 'Target is required' });
    }

    const results: any = {};
    
    try {
      const address = await dnsLookup(target);
      results.A = address.address;
    } catch (e) {}

    try {
      const addresses = await dnsResolve4(target);
      results.A_records = addresses;
    } catch (e) {}

    res.json({ result: JSON.stringify(results, null, 2) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/traceroute', async (req, res) => {
  try {
    const { target } = req.body;
    if (!target) {
      return res.status(400).json({ error: 'Target is required' });
    }

    const command = process.platform === 'win32'
      ? `tracert ${target}`
      : `traceroute ${target}`;

    const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
    res.json({ result: stdout || stderr });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;