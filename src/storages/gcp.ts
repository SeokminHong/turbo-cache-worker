import { Context } from 'hono';
import { SignJWT, importPKCS8 } from 'jose';

import { Env } from '../types';

const API_URL = 'https://storage.googleapis.com';
const SCOPE = 'https://www.googleapis.com/auth/cloud-platform';

async function encodeJwt({ env }: Context<Env>) {
  const config = JSON.parse(atob(env.GOOGLE_SERVICE_ACCOUNT));
  const alg = 'RS256';
  const privateKey = await importPKCS8(config.private_key, alg);
  const s = new SignJWT({ scope: SCOPE })
    .setProtectedHeader({ alg })
    .setIssuer(config.client_email)
    .setIssuedAt()
    .setExpirationTime('1h')
    .setAudience('https://www.googleapis.com/oauth2/v4/token')
    .sign(privateKey);

  return s;
}

type Token = {
  expires_in: string;
  access_token?: string;
  id_token?: string;
  token_type: string;
};

async function requestToken(c: Context<Env>) {
  const cachedToken = await c.env.GCP_TOKEN?.get<string>('key');
  if (cachedToken) {
    return cachedToken;
  }
  const url = 'https://www.googleapis.com/oauth2/v4/token';
  const jwt = await encodeJwt(c);
  const grantType = 'urn:ietf:params:oauth:grant-type:jwt-bearer';

  const token = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=${grantType}&assertion=${jwt}`,
  }).then((res) => res.json<Token>());

  const tokenString = token.access_token || token.id_token;
  if (!tokenString) {
    throw new Error('No token found');
  }
  c.env.GCP_TOKEN?.put('key', tokenString, {
    expirationTtl: 60 * 55,
  });
  return tokenString;
}

const BUCKET_NAME = encodeURIComponent('momenti-prod-registry-0');
const object = encodeURIComponent(`registry_npm/%40mure%2Fpackage-1.0.0.tgz`);
export async function get(c: Context<Env>) {
  const token = await requestToken(c);
  const res = await fetch(
    `${API_URL}/storage/v1/b/${BUCKET_NAME}/o/${object}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  ).then((r) => r.json());
  return c.json(res);
}

export async function read(c: Context<Env>) {
  const id = c.req.param('id');
  const token = await requestToken(c);
  const bucket = encodeURIComponent(c.env.BUCKET_NAME);
  const object = encodeURIComponent(id);
  return fetch(`${API_URL}/storage/v1/b/${bucket}/o/${object}?alt=media`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function write(c: Context<Env>) {
  const id = c.req.param('id');
  const token = await requestToken(c);
  const bucket = encodeURIComponent(c.env.BUCKET_NAME);
  const object = encodeURIComponent(id);
  return fetch(
    `${API_URL}/upload/storage/v1/b/${bucket}/o?uploadType=multipart&name=${object}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: await c.req.arrayBuffer(),
    }
  );
}
