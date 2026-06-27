const invisibleHairs = [
  "\u200D",  // Zero-width joiner only
];

const homoglyphs = {
  'A':'А','a':'а','B':'Β','C':'С','c':'с',
  'E':'Е','e':'е','H':'Н','I':'І','i':'і',
  'J':'Ј','j':'ј','K':'К','M':'М','N':'Ν',
  'O':'О','o':'о','P':'Р','p':'р','S':'Ѕ',
  's':'ѕ','T':'Т','X':'Х','x':'х','Y':'Υ','y':'у'
};

function randomHair() {
  return invisibleHairs[Math.floor(Math.random() * invisibleHairs.length)];
}

function obfuscate(text, settings) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  let result = sentences.map(sentence => {
    let words = sentence.trim().split(" ");
    words = words.map(word => {
      if (!word || word.length <= 1) return word;

      if (settings.hairsWithin && Math.random() < settings.freqWithin) {
        const pos = Math.floor(Math.random() * (word.length - 1)) + 1;
        word = word.slice(0, pos) + randomHair() + word.slice(pos);
      }

      if (settings.homoglyphs && Math.random() < settings.freqHomoglyph) {
        word = word.split('').map(ch =>
          (Math.random() < settings.freqHomoglyph) ? (homoglyphs[ch] || ch) : ch
        ).join('');
      }

      return word;
    });
    return words.join(' ');
  }).join(' ');

  if (settings.hairsBetween) {
    const words = result.split(' ');
    result = words.map((word, idx) => {
      if (idx === words.length - 1) return word;
      if (Math.random() < settings.freqBetween && !invisibleHairs.some(h => word.endsWith(h))) {
        return word + randomHair();
      }
      return word;
    }).join(' ');
  }

  return result;
}

// Slider displays
['Between', 'Within', 'Homoglyph'].forEach(name => {
  const slider = document.getElementById('freq' + name);
  const display = document.getElementById('val' + name);
  slider.addEventListener('input', () => { display.textContent = slider.value; });
});

function getSettings() {
  return {
    hairsBetween:   document.getElementById('hairsBetween').checked,
    freqBetween:    parseInt(document.getElementById('freqBetween').value) / 100,
    hairsWithin:    document.getElementById('hairsWithin').checked,
    freqWithin:     parseInt(document.getElementById('freqWithin').value) / 100,
    homoglyphs:     document.getElementById('homoglyphs').checked,
    freqHomoglyph:  parseInt(document.getElementById('freqHomoglyph').value) / 100,
  };
}

function processText() {
  const input = document.getElementById('input').value;
  if (!input.trim()) return;
  const result = obfuscate(input, getSettings());
  document.getElementById('output').textContent = result;
}

function copyOutput() {
  const output = document.getElementById('output').textContent;
  if (!output) return;
  navigator.clipboard.writeText(output).then(() => {
    const fb = document.getElementById('feedback');
    fb.style.display = 'block';
    setTimeout(() => { fb.style.display = 'none'; }, 2000);
  });
}

document.getElementById('input').addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') processText();
});


document.getElementById('btnProcess').addEventListener('click', processText);
document.getElementById('btnCopy').addEventListener('click', copyOutput);
