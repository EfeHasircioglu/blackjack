// defining the paths of sound files
const CLICK_OMD = "/sounds/click-1.wav"; // click sound on mouse down
const CLICK_OMU = "/sounds/click-2.wav"; // click sound on mouse up
const WIN = "/sounds/win.wav";
const CARD_PLACEMENT = "/sounds/card-placement.wav";
const LOSE = "/sounds/lose.wav";
const BIG_WIN = "/sounds/big-win.wav";
const BANKRUPCY = "/sounds/bankrupcy.wav";
// checking if AudioContext is supported by the browser.
const audioContext = new AudioContext();
// putting all of the sounds to ram first, for performance.
export let play = (forNow) => {};

if (AudioContext) {
	try {
		const omdResponse = await fetch(CLICK_OMD);
		const omuResponse = await fetch(CLICK_OMU);
		const winResponse = await fetch(WIN);
		const placementResponse = await fetch(CARD_PLACEMENT);
		const loseResponse = await fetch(LOSE);
		const bigWinResponse = await fetch(BIG_WIN);
		const bankrupcyResponse = await fetch(BANKRUPCY);

		// checks if the files are properly loaded
		// if not, we won't play the audio.
		if (
			!omdResponse.ok ||
			!omuResponse.ok ||
			!winResponse.ok ||
			!placementResponse.ok ||
			!loseResponse.ok ||
			!bigWinResponse.ok ||
			!bankrupcyResponse.ok
		) {
			throw new Error(
				"Error while fetching a file, audio won't be played.",
			);
		}

		// getting the arrayBuffers of the responses
		const omuBuffer = await omuResponse.arrayBuffer();
		const omdBuffer = await omdResponse.arrayBuffer();
		const winBuffer = await winResponse.arrayBuffer();
		const placementBuffer = await placementResponse.arrayBuffer();
		const bigWinBuffer = await bigWinResponse.arrayBuffer();
		const loseBuffer = await loseResponse.arrayBuffer();
		const bankrupcyBuffer = await bankrupcyResponse.arrayBuffer();
		// decoding the files and turning them into audio buffer
		const omuAudio = await audioContext.decodeAudioData(omuBuffer);
		const omdAudio = await audioContext.decodeAudioData(omdBuffer);
		const winAudio = await audioContext.decodeAudioData(winBuffer);
		const placementAudio =
			await audioContext.decodeAudioData(placementBuffer);
		const bigWinAudio = await audioContext.decodeAudioData(bigWinBuffer);
		const loseAudio = await audioContext.decodeAudioData(loseBuffer);
		const bankrupcyAudio =
			await audioContext.decodeAudioData(bankrupcyBuffer);
		play = (audioToPlay) => {
			switch (audioToPlay) {
				case "OMU":
					const omuSource = audioContext.createBufferSource();
					omuSource.buffer = omuAudio;
					omuSource.connect(audioContext.destination);
					omuSource.start(0);
					break;
				case "OMD":
					const omdSource = audioContext.createBufferSource();
					omdSource.buffer = omdAudio;
					omdSource.connect(audioContext.destination);
					omdSource.start(0);
					break;
				case "WIN":
					const winSource = audioContext.createBufferSource();
					winSource.buffer = winAudio;
					winSource.connect(audioContext.destination);
					winSource.start(0);
					break;
				case "PLACEMENT":
					const placementSource = audioContext.createBufferSource();
					placementSource.buffer = placementAudio;
					placementSource.connect(audioContext.destination);
					placementSource.start(0);
					break;
				case "BIGWIN":
					const bigWinSource = audioContext.createBufferSource();
					bigWinSource.buffer = bigWinAudio;
					bigWinSource.connect(audioContext.destination);
					bigWinSource.start(0);
					break;
				case "LOSE":
					const loseSource = audioContext.createBufferSource();
					loseSource.buffer = loseAudio;
					loseSource.connect(audioContext.destination);
					loseSource.start(0);
					break;
				case "BANKRUPCY":
					const bankrupcySource = audioContext.createBufferSource();
					bankrupcySource.buffer = bankrupcyAudio;
					bankrupcySource.connect(audioContext.destination);
					bankrupcySource.start(0);
					break;
			}
		};
	} catch (error) {
		console.error("Internal Error \n" + error);
	}
} else {
	console.warn(
		"Your browser does not support Web Audio API, no audio will be played.",
	);
}
