// Audio Player Module - Web Audio API for chord playback

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

async function playChord(tabData, chordName) {
  const ctx = getAudioContext();

  // Wake up audio context if suspended
  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  try {
    // Get frequencies for each string
    const frequencies = getFrequenciesFromTabData(tabData);
    const now = ctx.currentTime;

    // Play each string with strumming effect
    frequencies.forEach((freq, index) => {
      if (freq) {
        // Create oscillator (sound generator)
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = "triangle"; // Soft sound, similar to guitar
        osc.frequency.value = freq;

        // Connect audio nodes
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Strumming effect: delay each subsequent string by 50ms
        const strumDelay = index * 0.05;

        // Volume envelope (Attack, Decay, Sustain, Release)
        gainNode.gain.setValueAtTime(0, now + strumDelay);
        gainNode.gain.linearRampToValueAtTime(0.3, now + strumDelay + 0.05); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + strumDelay + 1.5); // Release

        osc.start(now + strumDelay);
        osc.stop(now + strumDelay + 2); // Stop after 2 seconds
      }
    });

    console.log(`Playing chord ${chordName}`);
  } catch (error) {
    console.error("Грешка при свирене на акорд:", error);
  }
}

// Convert tab data to frequencies
function getFrequenciesFromTabData(tabData) {
  const frets = tabData.split("");

  // Guitar strings: E A D G B e (from thickest to thinnest)
  // Standard tuning frequencies for open strings
  const openStringFrequencies = [
    82.41, // E2 (thickest string)
    110.0, // A2
    146.83, // D3
    196.0, // G3
    246.94, // B3
    329.63, // E4 (thinnest string)
  ];

  const frequencies = [];

  // Process each string
  for (let i = 0; i < 6; i++) {
    const fretValue = frets[i];

    if (fretValue === "x") {
      // Muted string - skip
      frequencies.push(null);
      continue;
    }

    const fretNum = parseInt(fretValue);
    const openFreq = openStringFrequencies[i];

    // Calculate frequency: each fret is a semitone (multiply by 2^(1/12))
    const frequency = openFreq * Math.pow(2, fretNum / 12);
    frequencies.push(frequency);
  }

  return frequencies;
}
