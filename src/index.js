import axios from 'axios';
import express from 'express';
import PDFParser from 'pdf2json';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 8080;
const inputPdfsDir = 'input_pdfs';

/**
 * Find a value off of a page
 * @param {Page} page the page to search
 * @param {string} id the id to search for
 * @returns {string} The value
 */
function findValue(page, id) {
	return page.Fields.find(field => field.id.Id === id)?.V;
}

/**
 * @param {Page} page The page to search
 * @param {Array<string[]>} ids a list of [id, ?name] tuples
 * @returns {{name: string, roll: number}[]}
 */
function getValueList(page, ids) {
	const out = [];
	ids.forEach(([id, name]) => {
		const roll = parseInt(findValue(page, id));

		if (isNaN(roll)) return;

		out.push({
			name: name ?? id,
			roll
		});
	});

	return out;
}

/**
 * @param {Page[]} pages The list of pages
 * @param {string} text The text to search for
 * @returns {Page} The page containing the text
 */
function findPage(pages, text) {
	return pages.find(page => page.Texts.map(element => element.R[0]?.T).includes(text));
}


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

	const pdfParser = new PDFParser();

	const rolls = new Promise((resolve, reject) => {
		pdfParser.on('pdfParser_dataError', errData => {
			reject(errData);
		});
		pdfParser.on('pdfParser_dataReady', pdfData => {
			const characterName = findValue(pdfData.Pages[0], 'CharacterName');

			const weaponNames = pdfData.Pages[0].Fields
				.filter(field => /Wpn_Name(_[1-6])?/.test(field.id.Id))
				.map(field => field.V);
			const weaponAttack = pdfData.Pages[0].Fields
				.filter(field => /Wpn[1-6]_AtkBonus/.test(field.id.Id))
				.map(field => parseInt(field.V));
			const weaponDamage = pdfData.Pages[0].Fields
			.filter(field => /Wpn[1-6]_Damage/.test(field.id.Id))
			.map(field => field.V);

			const attacks = weaponNames
				.map((name, idx) => {
				const maybeDamage = weaponDamage[idx]?.split(' ')[0];
					return {
						name,
						roll: weaponAttack[idx],
						damage: maybeDamage?.includes('d') ? maybeDamage : undefined
					};
				})
				.filter(({ roll: attack }) => !isNaN(attack));

			const spellAttack = parseInt(findValue(findPage(pdfData.Pages, 'SPELLCASTING'), 'spellAtkBonus0'));
			if (!isNaN(spellAttack)) {
				attacks.push({ name: 'Spell Attack', roll: spellAttack });
			}

			const abilityChecks = getValueList(pdfData.Pages[0], [
				['Init', 'Initiative'],
				['Acrobatics'],
				['Animal', 'Animal Handling'],
				['Arcana'],
				['Athletics'],
				['Deception'],
				['History'],
				['Insight'],
				['Intimidation'],
				['Investigation'],
				['Medicine'],
				['Nature'],
				['Perception'],
				['Performance'],
				['Persuasion'],
				['Religion'],
				['SleightofHand', 'Sleight of Hand'],
				['Stealth_', 'Stealth'],
				['Survival']
			]);

			const attributes = getValueList(pdfData.Pages[0], [
				['STR', 'Strength'],
				['DEX', 'Dexterity'],
				['CON', 'Constitution'],
				['INT', 'Intelligence'],
				['WIS', 'Wisdom'],
				['CHA', 'Charisma']
			]);

			const saves = getValueList(pdfData.Pages[0], [
				['ST_Strength', 'Strength Save'],
				['ST_Dexterity', 'Dexterity Save'],
				['ST_Constitution', 'Constitution Save'],
				['ST_Intelligence', 'Intelligence Save'],
				['ST_Wisdom', 'Wisdom Save'],
				['ST_Charisma', 'Charisma Save']
			]);

			resolve({ characterName, attacks, abilityChecks, attributes, saves });
		});
	});

	pdfParser.parseBuffer(pdfBuffer);

	try {
		return res.send(await rolls);
	} catch (err) {
		return res.status(500).send(`Could not parse rolls\n${err}`);
	}
});

app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
