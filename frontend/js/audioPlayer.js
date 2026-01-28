function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

async function playChord(tabData, chordName) {
  const ctx = getAudioContext();

  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  try {
    const frequencies = getFrequenciesFromTabData(tabData);
    const now = ctx.currentTime;

    frequencies.forEach((freq, index) => {
      if (freq) {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.value = freq;

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        const strumDelay = index * 0.05;

        gainNode.gain.setValueAtTime(0, now + strumDelay);
        gainNode.gain.linearRampToValueAtTime(0.3, now + strumDelay + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + strumDelay + 1.5);

        osc.start(now + strumDelay);
        osc.stop(now + strumDelay + 2);
      }
    });

    console.log(`Playing chord ${chordName}`);
  } catch (error) {
    console.error("Грешка при свирене на акорд:", error);
  }
}

function getFrequenciesFromTabData(tabData) {
  const frets = tabData.split("");

  // Guitar strings: E A D G B e (from thickest to thinnest)
  const openStringFrequencies = [
    82.41, // E2 (thickest string)
    110.0, // A2
    146.83, // D3
    196.0, // G3
    246.94, // B3
    329.63, // E4 (thinnest string)
  ];

  const frequencies = [];

  for (let i = 0; i < 6; i++) {
    const fretValue = frets[i];

    if (fretValue === "x") {
      frequencies.push(null);
      continue;
    }

    const fretNum = parseInt(fretValue);
    const openFreq = openStringFrequencies[i];

    const frequency = openFreq * Math.pow(2, fretNum / 12);
    frequencies.push(frequency);
  }

  return frequencies;
}
