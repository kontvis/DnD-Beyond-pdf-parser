#!/usr/bin/env node
import fs from 'fs';
import PDFParser from 'pdf2json';

const buf = fs.readFileSync('input_pdfs/Arabella_Valesong - Character Sheet.pdf');
const p = new PDFParser();

p.on('pdfParser_dataReady', d => {
  d.Pages.forEach((page, idx) => {
    if (!page.Fields) return;
    page.Fields.forEach(f => {
      const id = f.id.Id || '';
      if (/Eq_/.test(id) && !/Weight|Attuned/.test(id)) {
        console.log(`Page ${idx}: ${id} = ${f.V || '(empty)'}`);
      }
    });
  });
  console.log('\n=== END ===');
});

p.parseBuffer(buf);
