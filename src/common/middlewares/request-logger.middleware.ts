import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log request details
  console.log('\n=== Incoming Request ===');
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  // console.log('Headers:', {
  //   'content-type': req.headers['content-type'],
  //   'user-agent': req.headers['user-agent'],
  //   'origin': req.headers['origin']
  // });
  
  // if (req.method !== 'GET') {
  //   console.log('Body:', req.body);
  // }

  // Log response
  // res.on('finish', () => {
  //   const duration = Date.now() - start;
  //   console.log(`[${new Date().toISOString()}] Response: ${res.statusCode} - ${duration}ms`);
  //   console.log('=== End Request ===\n');
  // });

  next();
}; 