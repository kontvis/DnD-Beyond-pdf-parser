import axios from 'axios';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { parsePdfBuffer } from './parser.js';

const app = express();
const port = 8080;
const inputPdfsDir = 'input_pdfs';

app.get('/rolls', async (req, res) => {
	const { characterId, source = 'download' } = req.query;
	if (!characterId) {
		return res.status(400).send('Missing characterId query param');
	}

	let pdfBuffer;

	if (source === 'local') {
		// Try to load from input_pdfs folder
		const localPath = path.join(inputPdfsDir, `${characterId}.pdf`);
		try {
			pdfBuffer = fs.readFileSync(localPath);
		} catch (err) {
			return res.status(400).send(`PDF not found in ${inputPdfsDir}/${characterId}.pdf`);
		}
	} else if (source === 'download') {
		// Download from D&D Beyond
		const fileResponse = await axios.get(`https://www.dndbeyond.com/sheet-pdfs/${characterId}.pdf`, {
			responseType: 'arraybuffer'
		}).catch(err => err);

		if (fileResponse.status !== 200) {
			return res.status(400).send('Could not get pdf from D&D Beyond');
		}

		pdfBuffer = fileResponse.data;
	} else {
		return res.status(400).send('Invalid source parameter. Use "download" or "local".');
	}

	try {
		const result = await parsePdfBuffer(pdfBuffer);
		return res.send(result);
	} catch (err) {
		return res.status(500).send(`Could not parse rolls\n${err}`);
	}
});

app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
