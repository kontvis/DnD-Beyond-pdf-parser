import PDFParser from 'pdf2json';

function findValue(page, id) {
  return page.Fields.find(field => field.id.Id === id)?.V;
}

function findValueInPages(pages, idVariants) {
  if (!pages || !Array.isArray(pages)) return null;
  const variants = Array.isArray(idVariants) ? idVariants : [idVariants];
  for (const page of pages) {
    if (!page.Fields) continue;
    for (const field of page.Fields) {
      const fid = (field.id && field.id.Id) ? String(field.id.Id).toLowerCase() : '';
      for (const v of variants) {
        const vi = String(v).toLowerCase();
        if (!vi) continue;
        if (fid === vi || fid.includes(vi) || fid.startsWith(vi) || fid.endsWith(vi)) {
          if (field.V !== undefined && field.V !== null && String(field.V).trim() !== '') return field.V;
        }
      }
    }
  }
  return null;
}

function getValueList(page, ids) {
  const out = [];
  ids.forEach(([id, name]) => {
    const roll = parseInt(findValue(page, id));
    if (isNaN(roll)) return;
    out.push({ name: name ?? id, roll });
  });
  return out;
}

function findPage(pages, text) {
  return pages.find(page => page.Texts.map(element => element.R[0]?.T).includes(text));
}

function decodeText(t) {
  try {
    return decodeURIComponent(String(t));
  } catch (e) {
    return String(t);
  }
}

// Extract the FEATURES & TRAITS box content from pdfData.Pages (generic across sheets)
export function extractFeaturesFromPdfData(pdfData) {
  const pages = pdfData.Pages || [];

  // helper: find pages with feature-like fields or text (handle percent-encoding)
  function findFeaturesPages() {
    const matches = [];
    for (const page of pages) {
      const rawTexts = (page.Texts || []).map(t => String(t.R[0]?.T || ''));
      const decoded = rawTexts.map(tt => {
        try { return decodeURIComponent(tt); } catch (e) { return tt; }
      });
      const combined = rawTexts.concat(decoded).map(s => String(s).replace(/%20/g, ' ').replace(/%26/g, '&'));
      if (combined.some(tt => /FEATURES\s*&\s*TRAITS/i.test(tt) || /ADDITIONAL\s+FEATURES/i.test(tt))) matches.push(page);
      else if ((page.Fields || []).some(f => /Actions\d*|Actions|Features|Traits|Personality|PersonalityTraits_/i.test(String(f.id.Id)))) matches.push(page);
    }
    return matches;
  }

  const matchedPages = findFeaturesPages();
  if (!matchedPages.length) return null;

  // Try to collect column text from dedicated fields (e.g., Actions1, Actions2, Actions3) across matched pages
  const featureFieldPattern = /^(Actions|Actions\d+|Features|Traits|Personality|PersonalityTraits_)/i;
  const featureFields = matchedPages.flatMap(p => (p.Fields || []).filter(f => featureFieldPattern.test(String(f.id.Id))).map(f => ({ page: p, field: f })));

  let columns = [];
  if (featureFields.length) {
    // map any numbered suffix to order; fallback to original order
    const mapped = featureFields.map(ff => {
      const fid = ff.field && ff.field.id ? String(ff.field.id.Id) : String(ff.id || '');
      const m = fid.match(/(\d+)/);
      const idx = m ? parseInt(m[1], 10) : 0;
      return { id: fid, idx, text: ff.field && ff.field.V ? ff.field.V : '' };
    });
    mapped.sort((a, b) => a.idx - b.idx);
    columns = mapped.map(m => String(m.text || '').replace(/\r/g, '\n'));
  }

  // Fallback: cluster Texts by x into 3 columns
  if (!columns.length) {
    // gather texts from all matched pages
    const texts = matchedPages.flatMap(p => (p.Texts || []).map(t => ({
      x: t.x ?? t.X ?? 0,
      y: t.y ?? t.Y ?? 0,
      text: decodeText(t.R[0]?.T || '')
    }))).filter(t => t.text && t.text.trim());

    if (!texts.length) return null;

    const xs = texts.map(t => t.x).sort((a, b) => a - b);
    const minX = xs[0];
    const maxX = xs[xs.length - 1];
    const span = Math.max(1, maxX - minX);
    const buckets = [[], [], []];
    texts.forEach(t => {
      const b = Math.min(2, Math.floor(((t.x - minX) / span) * 3));
      buckets[b].push(t);
    });
    columns = buckets.map(b => b.sort((a, b) => a.y - b.y).map(i => i.text).join('\n'));
  }

  // Column-major reading: top->bottom per column, left->right
  const readText = columns.map(c => String(c || '').trim()).filter(Boolean).join('\n\n');

  // Parse into headings and entries
  const lines = readText.split(/\r?\n/).map(l => l.trim()).filter((l, i, arr) => !(l === '' && (arr[i-1] === '' || arr[i+1] === '')));

  const features = {};
  let currentHeading = 'FEATURES';
  let currentEntry = null;

  function pushEntry() {
    if (!currentEntry) return;
    const { heading, key, lines } = currentEntry;
    if (!features[heading]) features[heading] = {};
    features[heading][key] = { text: lines.join('\n').trim() };
    currentEntry = null;
  }

  const headingRegex = /^=+\s*([A-Z0-9'’\s-]+)\s*=+$/;
  const subEffectRegex = /^\s*[•\*-]\s*(.+)$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h = line.match(headingRegex);
    if (h) {
      // new heading
      pushEntry();
      currentHeading = h[1].trim();
      continue;
    }

    // detect entry start: a line that begins with '*' or contains '• PHB-'
    const isEntryStart = line.startsWith('*') || /•\s*PHB-/i.test(line) || (/^[A-Z][A-Za-z0-9'’\s,():-]{3,60}$/.test(line) && line === line.toUpperCase());
    if (isEntryStart) {
      pushEntry();
      // normalize key: strip leading '*' and trailing punctuation
      let key = line.replace(/^\*\s*/, '').trim();
      currentEntry = { heading: currentHeading, key, lines: [] };
      continue;
    }

    // continuation or sub-effect
    if (!currentEntry) {
      // treat as headingless preamble
      currentEntry = { heading: currentHeading, key: 'SUMMARY', lines: [] };
    }

    // treat all lines as part of current entry text (sub-effect parsing can be added later)
    currentEntry.lines.push(line);
  }
  pushEntry();

  return features;
}

export function parsePdfBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataError', errData => reject(errData));
    pdfParser.on('pdfParser_dataReady', pdfData => {
      try {
        const characterName = findValue(pdfData.Pages[0], 'CharacterName');
        const classLevel = findValue(pdfData.Pages[0], 'CLASS_LEVEL');
        const race = findValue(pdfData.Pages[0], 'RACE');
        const background = findValue(pdfData.Pages[0], 'BACKGROUND');
        const ac = parseInt(findValue(pdfData.Pages[0], 'AC')) || 0;
        const maxHP = parseInt(findValue(pdfData.Pages[0], 'MaxHP')) || 0;
        const profBonus = parseInt(findValue(pdfData.Pages[0], 'ProfBonus')) || 0;
        const initiative = parseInt(findValue(pdfData.Pages[0], 'Init')) || 0;
        const passivePerception = parseInt(findValue(pdfData.Pages[0], 'Passive1')) || 0;
        const passiveInsight = parseInt(findValue(pdfData.Pages[0], 'Passive2')) || 0;
        const passiveInvestigation = parseInt(findValue(pdfData.Pages[0], 'Passive3')) || 0;

        // Appearance & personality: search across pages with resilient id matching
        const pages = pdfData.Pages || [];
        const gender = findValueInPages(pages, ['GENDER', 'Gender', 'SEX']) || null;
        const age = findValueInPages(pages, ['AGE', 'Age']) || null;
        const height = findValueInPages(pages, ['HEIGHT', 'Ht', 'Height']) || null;
        const weight = findValueInPages(pages, ['WEIGHT', 'Wt', 'Weight']) || null;
        const alignment = findValueInPages(pages, ['ALIGNMENT', 'Alignment']) || null;
        const faith = findValueInPages(pages, ['FAITH', 'Faith', 'Religion']) || null;
        const skin = findValueInPages(pages, ['SKIN', 'Skin']) || null;
        const eyes = findValueInPages(pages, ['EYES', 'Eyes']) || null;
        const hair = findValueInPages(pages, ['HAIR', 'Hair']) || null;
        const personalityTraits = findValueInPages(pages, ['PersonalityTraits_', 'PersonalityTraits', 'Personality_Traits', 'Personality']) || null;
        const ideals = findValueInPages(pages, ['Ideals', 'Ideal']) || null;
        const bonds = findValueInPages(pages, ['Bonds', 'Bond']) || null;
        const flaws = findValueInPages(pages, ['Flaws', 'Flaw']) || null;
        const alliesAndOrganizations = findValueInPages(pages, ['Allies', 'AlliesAndOrganizations', 'Allies_Organizations', 'Allies & Organizations', 'AlliesOrganizations']) || null;

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

        const spellPage = findPage(pdfData.Pages, 'SPELLCASTING');
        const spellAttack = spellPage ? parseInt(findValue(spellPage, 'spellAtkBonus0')) : NaN;
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

        resolve({
          characterName,
          classLevel,
          race,
          background,
          ac,
          maxHP,
          profBonus,
          initiative,
          passivePerception,
          passiveInsight,
          passiveInvestigation,
          appearance: {
            gender,
            age,
            height,
            weight,
            alignment,
            faith,
            skin,
            eyes,
            hair
          },
          traits: {
            personalityTraits,
            ideals,
            bonds,
            flaws
          },
          alliesAndOrganizations,
          attacks,
          features: extractFeaturesFromPdfData(pdfData) || {},
          abilityChecks,
          attributes,
          saves
        });
      } catch (err) {
        reject(err);
      }
    });

    pdfParser.parseBuffer(buffer);
  });
}
