// This helper will enable us to utilize Web Audio API to play our sound effects.
// creates a new AudioContext
try {
  let audioContext = new AudioContext();
} catch(e) {
	console.error("Error occured while initialising AudioContext. No audio will be played. \n Error details: \n" + e);
}