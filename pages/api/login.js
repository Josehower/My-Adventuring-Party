import crypto from 'crypto';
import argon2 from 'argon2';
import cookie from 'cookie';

export default (req, res) => {
  res.statusCode = 200;
  res.json({ name: 'John Doe' });
};
