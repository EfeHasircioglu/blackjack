const DEFAULT_ACE_VALUE = 11; // the default value of the ace card
function transformToNumerical(variable) {
	let sum = 0;
	// eğer girdi array değilse array'a çeviriyoruz.
	if (variable.constructor !== Array) {
		variable = [variable];
	}
	let aceCount = 0;
	for (let item of variable) {
		if (!isNaN(item.value)) {
			sum = Number(item.value) + sum;
		} else if (
			item.value === "J" ||
			item.value === "Q" ||
			item.value === "K"
		) {
			//bu kartların hepsi 10 eder
			sum = 10 + sum;
		}
		// eğer as 11 olurken kartların değeri 21'i geçiyorsa o zaman otomatik olarak as 1 olur, ama eğer geçmiyorsa as 11 olur.
		else if (item.value === "A") {
			aceCount += 1;
		}
	}
	if (aceCount > 0) {
		for (let i = 0; i < aceCount; i++) {
			sum += DEFAULT_ACE_VALUE;
		}
		while (sum >= 22 && aceCount > 0) {
			sum -= 10;
			aceCount -= 1;
		}
	}

	return sum;
}

async function wait(time) {
	new Promise(resolve => setTimeout(resolve, time))
}

function getRandomNum(array) {
	let num = Math.floor(Math.random() * array.length);
	return num;
}

// shuffling helper function (fisher-yates shuffle)
function shuffle(array) {
	let currentIndex = array.length;

	// if there are elements to shuffle..
	while (currentIndex != 0) {
		//pick a remaining element..
		let randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// swap with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex],
			array[currentIndex],
		];
	}
	return array;
}

export { transformToNumerical, getRandomNum, shuffle, wait };