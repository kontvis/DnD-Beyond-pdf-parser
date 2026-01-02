#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import PDFParser from 'pdf2json';

async function main() {
  const filePath = process.argv[2] || 'input_pdfs/Big Lou - Character Sheet v1.pdf';
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const buffer = fs.readFileSync(filePath);
  const pdfParser = new PDFParser();

  pdfParser.on('pdfParser_dataError', errData => {
    console.error('PDF error:', errData);
    process.exit(1);
  });

  pdfParser.on('pdfParser_dataReady', pdfData => {
    console.log(`\n=== Exploring ${path.basename(filePath)} ===\n`);
    
    // Page count
    console.log(`Total pages: ${pdfData.Pages.length}\n`);

    // List all fields from first page (main character sheet)
    if (pdfData.Pages[0] && pdfData.Pages[0].Fields) {
      console.log(`Fields on Page 1 (${pdfData.Pages[0].Fields.length} total):\n`);
      const fields = pdfData.Pages[0].Fields;
      
      // Group by prefix for easier exploration
      const grouped = {};
      fields.forEach(field => {
        const id = field.id.Id;
        const prefix = id.split('_')[0] || id;
        if (!grouped[prefix]) grouped[prefix] = [];
        grouped[prefix].push({ id, value: field.V });
      });

      // Sort by prefix and print
      Object.keys(grouped).sort().forEach(prefix => {
        console.log(`\n[${prefix}]`);
        grouped[prefix].forEach(f => {
          const val = f.value ? `"${f.value}"` : '(empty)';
          console.log(`  ${f.id}: ${val}`);
        });
      });
    }

    // Check other pages for relevant sections
    if (pdfData.Pages.length > 1) {
      console.log(`\n\n=== Other Pages ===\n`);
      pdfData.Pages.forEach((page, idx) => {
        if (idx === 0) return;
        const text = page.Texts?.map(t => t.R[0]?.T).filter(Boolean).join(' ') || '';
        console.log(`Page ${idx + 1}: ${text.substring(0, 100)}...`);
      });
    }
  });

  pdfParser.parseBuffer(buffer);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
