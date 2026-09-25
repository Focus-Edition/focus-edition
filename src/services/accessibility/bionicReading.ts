export interface BionicToken {
  prefix: string;
  bold: string;
  normal: string;
  suffix: string;
}

export function parseBionicWord(
  word: string,
  fixation: number = 0.45,
  opacity: number = 0.55
): BionicToken {
  if (!word || word.length <= 2) {
    return { prefix: '', bold: word, normal: '', suffix: '' };
  }

  // Separate non-alphanumeric leading and trailing punctuation
  const match = word.match(/^([^a-zA-Z0-9]*)([a-zA-Z0-9']+)([^a-zA-Z0-9]*)$/);
  if (!match) {
    return { prefix: '', bold: word, normal: '', suffix: '' };
  }

  const prefix = match[1];
  const core = match[2];
  const suffix = match[3];

  if (core.length <= 2) {
    return { prefix, bold: core, normal: '', suffix };
  }

  // Calculate fixation length (at least 1 char, up to fixation % of word)
  const boldLen = Math.max(1, Math.ceil(core.length * fixation));
  const bold = core.slice(0, boldLen);
  const normal = core.slice(boldLen);

  return {
    prefix,
    bold,
    normal,
    suffix
  };
}

export function tokenizeBionicText(
  text: string,
  fixation: number = 0.45,
  opacity: number = 0.55
): (BionicToken | string)[] {
  if (!text) return [];

  // Split by whitespace preserving tokens
  const words = text.split(/(\s+)/);
  return words.map(w => {
    if (/^\s+$/.test(w)) return w;
    return parseBionicWord(w, fixation, opacity);
  });
}

// HTML string output for web or HTML renderers
export function formatBionicHtml(
  text: string,
  fixation: number = 0.45,
  opacity: number = 0.55
): string {
  if (!text) return '';
  const tokens = tokenizeBionicText(text, fixation, opacity);
  return tokens
    .map(t => {
      if (typeof t === 'string') return t;
      return `${t.prefix}<b>${t.bold}</b><span style="opacity:${opacity}">${t.normal}</span>${t.suffix}`;
    })
    .join('');
}
