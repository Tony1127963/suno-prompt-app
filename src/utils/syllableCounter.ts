export function countSyllables(text: string): number {
  if (!text || !text.trim()) return 0;
  
  // Split into words, bypassing punctuation
  const words = text.toLowerCase().match(/[\wáéíóúýůěďťňščžřäô]+/g) || [];
  if (words.length === 0) return 0;

  let totalSyllables = 0;

  for (const word of words) {
    totalSyllables += countWordSyllables(word);
  }

  return totalSyllables;
}

function countWordSyllables(word: string): number {
  if (word.length <= 2) return 1;

  // Remove common English silent suffixes if there are no Czech/Slovak diacritics
  const hasDiacritics = /[áéíóúýůěďťňščžřäô]/.test(word);
  let processed = word;
  
  if (!hasDiacritics) {
    processed = processed.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    processed = processed.replace(/^y/, '');
  }

  // Count vowel clusters (consecutive vowels represent diphthongs/single vowel sounds)
  const vowelsRegex = /[aeiouyáéíóúýůěäô]+/g;
  const vowelMatches = processed.match(vowelsRegex);
  let count = vowelMatches ? vowelMatches.length : 0;

  // In Czech and Slovak, liquid 'r' and 'l' can form syllables without vowels (e.g. krk, vlk, smrt, plný)
  // They act as vocalic nuclei when sandwiched between consonants or at word boundaries
  let vocalicCount = 0;
  const allVowels = /[aeiouyáéíóúýůěäô]/;
  for (let i = 0; i < processed.length; i++) {
    const char = processed[i];
    if (char === 'r' || char === 'l') {
      const prevIsConsonant = i === 0 || !allVowels.test(processed[i - 1]);
      const nextIsConsonant = i === processed.length - 1 || !allVowels.test(processed[i + 1]);
      if (prevIsConsonant && nextIsConsonant) {
        vocalicCount++;
      }
    }
  }
  
  count += vocalicCount;

  return count > 0 ? count : 1;
}

