const kana = ['あ','い','う','え','お','か','き','く','け','こ','きゃ','きゅ','きょ','が','ぎ','ぐ', 'げ','ご','ぎゃ','ぎゅ','ぎょ','さ','し','す','せ','そ','しゃ','しゅ','しょ','ざ','じ','ず','ぜ','ぞ','じゃ','じゅ','じょ','た','ち','つ','っ','て','と','ちゃ','ちゅ','ちょ','だ','づ','で','ど','な','に','ぬ','ね','の','にゃ','にゅ','にょ','は','ひ','ふ','へ','ほ','ひゃ','ひゅ','ひょ','ば','び','ぶ','べ','ぼ','びゃ','びゅ','びょ','ぱ','ぴ','ぷ','ぺ','ぽ','ぴゃ','ぴゅ','ぴょ','ま','み','む','め','も','みゃ','みゅ','みょ','や','ゆ','よ','ら','り','る','れ','ろ','りゃ','りゅ','りょ','わ','を','ん'];

let index = {}; // Declare index globally

function populateColumns() {
  for (let i = 1; i <= 6; i++) {
    const col = document.getElementById(`column${i}`);
    // Clear previous contents
    col.innerHTML = '';

    // Add a blank option at the top
    const blankDivTop = document.createElement('div');
    blankDivTop.style.height = '20px'; // Adjust height for top space
    col.appendChild(blankDivTop);

    // Add kana items
    kana.forEach(k => {
      const div = document.createElement('div');
      div.textContent = k;
      div.classList.add('kana-item');
      col.appendChild(div);
    });

    // Add extra blank space at the bottom
    const blankDivBottom = document.createElement('div');
    blankDivBottom.style.height = '400px'; // Double padding at the bottom
    col.appendChild(blankDivBottom);
  }
}

function setupListeners() {
  for (let i = 1; i <= 6; i++) {
    const col = document.getElementById(`column${i}`);
    col.addEventListener('scroll', updateDisplay);
  }
}

function getSelectedKana() {
    const selectedKana = [];
  
    for (let i = 1; i <= 6; i++) {
      const col = document.getElementById(`column${i}`);
      const divs = col.querySelectorAll('div');
      const scrollTop = col.scrollTop;
      const clientHeight = col.clientHeight;
  
      let closestDiv = null;
      let minDistance = Infinity;
  
      // Determine the top position of the visible area
      const topVisibleArea = scrollTop;
      // Determine the bottom position of the visible area
      const bottomVisibleArea = scrollTop + clientHeight;
  
      // Find the div closest to the top of the column
      divs.forEach(div => {
        const divTop = div.offsetTop;
        const divBottom = divTop + div.clientHeight;
  
        // Check if the div is within the visible area or close to the edge
        if ((divTop <= bottomVisibleArea && divBottom >= topVisibleArea)) {
          const distance = Math.abs(divTop - topVisibleArea);
          if (distance < minDistance) {
            minDistance = distance;
            closestDiv = div;
          }
        }
      });
  
      // Add blank if closestDiv is empty
      selectedKana.push(closestDiv ? closestDiv.textContent : '');
    }
  
    return selectedKana.join('');
  }
  

function updateDisplay() {
    const selectedWord = getSelectedKana();
    const matches = index[selectedWord] || [];

    const displayArea = document.getElementById('displayArea');
    if (matches.length > 0) {
        displayArea.innerHTML = matches.map(entry => {
            const kanjiDisplay = entry.kanji ? `Kanji: ${entry.kanji}` : 'No kanji available';
            const kanaDisplay = entry.word ? `Kana: ${entry.word}` : 'No kana available';
            const sensesDisplay = entry.senses.map(sense => 
              `${sense.pos ? `POS: ${sense.pos}` : ''} ${sense.glosses.join(', ')}`
            ).join('; ');

            return `<div>${kanjiDisplay}<br>${kanaDisplay}<br>Meanings: ${sensesDisplay}</div><hr>`;
        }).join('');
    } else {
        displayArea.textContent = 'No match found';
    }
}

async function loadAndParseXML(url) {
  try {
    const response = await fetch(url);
    const xmlString = await response.text();
    const dictionary = parseXML(xmlString);

    index = dictionary.reduce((acc, entry) => {
      // Use both kanji and reading for indexing
      if (entry.word) {
        if (!acc[entry.word]) {
          acc[entry.word] = [];
        }
        acc[entry.word].push(entry);
      }
      return acc;
    }, {});

    console.log('Dictionary:', dictionary);
    console.log('Index:', index);
  } catch (error) {
    console.error('Error loading or parsing XML:', error);
  }
}

function parseXML(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

  const entries = xmlDoc.querySelectorAll('entry');
  return Array.from(entries).map(entry => {
    const kanji = entry.querySelector('k_ele > keb') ? entry.querySelector('k_ele > keb').textContent : '';
    const reading = entry.querySelector('r_ele > reb') ? entry.querySelector('r_ele > reb').textContent : '';

    const senses = Array.from(entry.querySelectorAll('sense')).map(sense => ({
      pos: Array.from(sense.querySelectorAll('pos')).map(pos => pos.textContent).join(', '),
      glosses: Array.from(sense.querySelectorAll('gloss')).map(gloss => gloss.textContent)
    }));

    return { word: reading, kanji, senses };
  });
}

document.addEventListener('DOMContentLoaded', () => {
  populateColumns();
  setupListeners();
  loadAndParseXML('data/JMdict.xml'); // Update path if necessary
});
