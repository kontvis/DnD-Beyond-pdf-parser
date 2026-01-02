#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { parsePdfBuffer } from '../src/parser.js';

async function main() {
  const cwd = process.cwd();
  const inputDir = path.join(cwd, 'input_pdfs');
  const outputDir = path.join(cwd, 'output_json');

  await fs.promises.mkdir(outputDir, { recursive: true });

  let files;
  try {
    files = await fs.promises.readdir(inputDir);
  } catch (err) {
    console.error(`Could not read input directory ${inputDir}:`, err.message);
    process.exit(1);
  }

  for (const file of files) {
    if (!file.toLowerCase().endsWith('.pdf')) continue;
    const inPath = path.join(inputDir, file);
    const base = path.parse(file).name;
    const outPath = path.join(outputDir, `${base}.json`);

    try {
      const buf = await fs.promises.readFile(inPath);
      const parsed = await parsePdfBuffer(buf);
      await fs.promises.writeFile(outPath, JSON.stringify(parsed, null, 2), 'utf8');
      console.log(`Wrote ${outPath}`);
    } catch (err) {
      console.error(`Failed to parse ${file}:`, err.message || err);
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
