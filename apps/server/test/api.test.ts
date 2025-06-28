import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { readJson, writeJson } from '../fileHandler';
import { z } from 'zod';
import { RecipeSchema } from '../index';

// Minimal mock app for API endpoint tests
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/recipes', async (req, res) => {
  const parseResult = RecipeSchema.safeParse(req.body);
  if (!parseResult.success) return res.status(400).json({ error: 'Invalid recipe input' });
  res.status(201).json(parseResult.data);
});

describe('API /api/recipes', () => {
  it('should accept valid recipe', async () => {
    const validRecipe = { id: 'r1', nome: 'Test', ingredienti: ['a'] };
    const res = await request(app).post('/api/recipes').send(validRecipe);
    expect(res.status).toBe(201);
    expect(res.body.id).toBe('r1');
  });

  it('should reject invalid recipe', async () => {
    const invalidRecipe = { nome: 'No ID', ingredienti: [] };
    const res = await request(app).post('/api/recipes').send(invalidRecipe);
    expect(res.status).toBe(400);
  });
});
