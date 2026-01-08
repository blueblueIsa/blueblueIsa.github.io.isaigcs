#!/usr/bin/env node
/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import Joi from 'joi';
import { log } from './utils/logger.js';

const args = process.argv.slice(2);
const argMap = {};
for (const a of args) {
  const m = /^--([^=]+)=(.+)$/.exec(a);
  if (m) argMap[m[1]] = m[2];
  else if (a === '--strict') argMap.strict = '1';
}

const schemaPath = argMap.schema || './src/data/syllabus.schema.json';
const syllabusPath = path.join('./src/data', 'syllabus.json');

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function validateJsonSchema(schema, data) {
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const ok = validate(data);
  return { ok, errors: validate.errors };
}

const unitSchema = Joi.object({
  unitId: Joi.string().pattern(/^cs-\d+|apl-\d+|unit([1-9]|10)$/),
  title: Joi.string().min(1),
  learningObjectives: Joi.array().items(Joi.string()),
  keyConcepts: Joi.array().items(Joi.string()),
  assessmentCriteria: Joi.array().items(Joi.string())
});

const syllabusSchema = Joi.object({
  metadata: Joi.object({
    source: Joi.string().uri(),
    version: Joi.string().min(1),
    extractedAt: Joi.string().isoDate()
  }).required(),
  units: Joi.array().items(unitSchema).min(1).required(),
  programming_key_terms: Joi.array().items(Joi.object({
    term: Joi.string().min(1),
    definition: Joi.string().min(1)
  })),
  pseudocode_syntax: Joi.object({
    version: Joi.string(),
    rules: Joi.array().items(Joi.string())
  }),
  display_key_terms: Joi.array().items(Joi.object({
    term: Joi.string(),
    usage: Joi.string()
  }))
});

function main() {
  const schema = loadJson(schemaPath);
  const data = loadJson(syllabusPath);
  const res = validateJsonSchema(schema, data);
  if (!res.ok) {
    log('ERROR', 'schema validation failed', { errors: res.errors });
    process.exit(2);
  }
  const { error } = syllabusSchema.validate(data, { abortEarly: false });
  if (error) {
    log('ERROR', 'joi validation failed', { details: error.details });
    process.exit(3);
  }
  log('INFO', 'validation ok', { path: syllabusPath });
}

main();
