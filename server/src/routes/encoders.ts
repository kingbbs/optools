import { Router } from 'express';

const router = Router();

router.post('/process', async (req, res) => {
  try {
    const { type, action, input } = req.body;
    
    if (!type || !action || !input) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let result = '';

    switch (type) {
      case 'base64':
        if (action === 'encode') {
          result = Buffer.from(input).toString('base64');
        } else {
          result = Buffer.from(input, 'base64').toString('utf-8');
        }
        break;
        
      case 'url':
        if (action === 'encode') {
          result = encodeURIComponent(input);
        } else {
          result = decodeURIComponent(input);
        }
        break;
        
      case 'jwt':
        try {
          const parts = input.split('.');
          if (parts.length !== 3) {
            throw new Error('Invalid JWT format');
          }
          const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          result = JSON.stringify({ header, payload }, null, 2);
        } catch (e) {
          result = 'Invalid JWT token';
        }
        break;
        
      case 'json':
        try {
          const parsed = JSON.parse(input);
          result = action === 'format' 
            ? JSON.stringify(parsed, null, 2)
            : JSON.stringify(parsed);
        } catch (e) {
          result = 'Invalid JSON';
        }
        break;
        
      default:
        result = 'Unsupported operation';
    }

    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;