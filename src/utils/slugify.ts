// Maps common non-English characters to their English equivalents
const CHAR_MAP: Record<string, string> = {
  // Turkish
  ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i',
  ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u',
  // German
  ä: 'a', Ä: 'a', ß: 'ss',
  // French / Spanish / Portuguese
  à: 'a', á: 'a', â: 'a', ã: 'a', å: 'a', æ: 'ae',
  è: 'e', é: 'e', ê: 'e', ë: 'e',
  ì: 'i', í: 'i', î: 'i', ï: 'i',
  ò: 'o', ó: 'o', ô: 'o', õ: 'o', ø: 'o',
  ù: 'u', ú: 'u', û: 'u',
  ý: 'y', ÿ: 'y',
  ñ: 'n', Ñ: 'n',
  ć: 'c', č: 'c', ď: 'd', ě: 'e', ľ: 'l', ň: 'n',
  ř: 'r', š: 's', ť: 't', ž: 'z',
}

export function slugify(text: string): string {
  return text
    .split('')
    .map(char => CHAR_MAP[char] ?? char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')   // remove anything not a-z, 0-9, space, hyphen
    .trim()
    .replace(/\s+/g, '-')            // spaces → hyphens
    .replace(/-+/g, '-')             // collapse multiple hyphens
    .slice(0, 60)                    // max 60 chars
}

// Build the shareable URL path for a note
export function noteSharePath(category: string, title: string, id: string): string {
  return `/${category}/${slugify(title)}-${id.slice(-6)}`
}