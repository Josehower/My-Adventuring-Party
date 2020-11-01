import argon2 from 'argon2';
import cookie from 'cookie';
import Tokens from 'csrf';

const tokens = new Tokens();

export default async (req, res) => {
  const { username, email, password, nickname, token } = req.body;

  console.log(token);

  res.status(200).send({ success: true });
};
