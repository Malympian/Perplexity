chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'processText') {
    const result = obfuscateText(request.settings);
    sendResponse(result);
  }
});

function obfuscateText(settings) {
  // Safe invisible characters only.
  // All bidi/directional chars removed — they cause text reversal (\u202E was the main culprit).
  const invisibleHairs = [
    "\u200B",  // Zero-width space
    "\u200C",  // Zero-width non-joiner
    "\u200D",  // Zero-width joiner
    "\u2060",  // Word joiner
    "\u2061",  // Function application (invisible)
    "\u2062",  // Invisible times
    "\u2063",  // Invisible separator
    "\u2064",  // Invisible plus
    "\uFEFF",  // Zero-width no-break space
    "\uFE00",  // Variation selector-1
    "\uFE01",  // Variation selector-2
    "\uFE02",  // Variation selector-3
    "\uFE03",  // Variation selector-4
    "\uFE04",  // Variation selector-5
    "\uFE05",  // Variation selector-6
    "\uFE06",  // Variation selector-7
    "\uFE07",  // Variation selector-8
    "\uFE08",  // Variation selector-9
    "\uFE09",  // Variation selector-10
    "\uFE0A",  // Variation selector-11
    "\uFE0B",  // Variation selector-12
    "\uFE0C",  // Variation selector-13
    "\uFE0D",  // Variation selector-14
    "\uFE0E",  // Variation selector-15
    "\uFE0F",  // Variation selector-16
    // Excluded (cause text reversal / layout bugs):
    //   \u200E  LTR mark
    //   \u200F  RTL mark
    //   \u202A  LTR embedding
    //   \u202B  RTL embedding
    //   \u202C  Pop directional formatting
    //   \u202D  LTR override
    //   \u202E  RTL override  <-- main culprit for reversed text
  ];

  const homoglyphs = {
    'A': 'А',   // Cyrillic A
    'a': 'а',   // Cyrillic a
    'B': 'Β',   // Greek Beta
    'C': 'С',   // Cyrillic S
    'c': 'с',   // Cyrillic s
    'E': 'Е',   // Cyrillic E
    'e': 'е',   // Cyrillic e
    'H': 'Н',   // Cyrillic N
    'I': 'І',   // Cyrillic Byelorussian-Ukrainian I
    'i': 'і',   // Cyrillic Byelorussian-Ukrainian i
    'J': 'Ј',   // Cyrillic J
    'j': 'ј',   // Cyrillic j
    'K': 'К',   // Cyrillic K
    'M': 'М',   // Cyrillic M
    'N': 'Ν',   // Greek Nu
    'O': 'О',   // Cyrillic O
    'o': 'о',   // Cyrillic o
    'P': 'Р',   // Cyrillic R
    'p': 'р',   // Cyrillic r
    'S': 'Ѕ',   // Cyrillic Dze
    's': 'ѕ',   // Cyrillic dze
    'T': 'Т',   // Cyrillic T
    'X': 'Х',   // Cyrillic H (no trailing space)
    'x': 'х',   // Cyrillic h
    'Y': 'Υ',   // Greek Upsilon
    'y': 'у',   // Cyrillic u
  };

  const text = settings.text;
  let result = "";

  const sentences = text.split(/(?<=[.!?])\s+/);

  for (let sentIdx = 0; sentIdx < sentences.length; sentIdx++) {
    let sentence = sentences[sentIdx].trim();
    if (!sentence) continue;

    let words = sentence.split(" ");

    for (let wordIdx = 0; wordIdx < words.length; wordIdx++) {
      let word = words[wordIdx];

      if (word && word.length > 1) {
        if (settings.hairsWithin && Math.random() < settings.freqWithin) {
          const insertPos = Math.floor(Math.random() * (word.length - 1)) + 1;
          const hair = invisibleHairs[Math.floor(Math.random() * invisibleHairs.length)];
          word = word.slice(0, insertPos) + hair + word.slice(insertPos);
        }

        if (settings.homoglyphs && Math.random() < settings.freqHomoglyph) {
          word = word.split('').map(char => {
            if (Math.random() < settings.freqHomoglyph) {
              return homoglyphs[char] || char;
            }
            return char;
          }).join('');
        }
      }

      words[wordIdx] = word;
    }

    result += words.join(" ");
    if (sentIdx < sentences.length - 1) result += " ";
  }

  if (settings.hairsBetween) {
    const words = result.split(' ');
    result = words.map((word, idx) => {
      if (idx !== words.length - 1 && Math.random() < settings.freqBetween) {
        if (!invisibleHairs.some(h => word.endsWith(h))) {
          return word + invisibleHairs[Math.floor(Math.random() * invisibleHairs.length)];
        }
      }
      return word;
    }).join(' ');
  }

  return result;
}