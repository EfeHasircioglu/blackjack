<script>
  import "./app.css";
  import { fly, fade } from "svelte/transition";
  import { tick } from "svelte";
  import { play } from "./soundManager.svelte";
  import Button from "./Button.svelte";
  const DEFAULT_ACE_VALUE = 11; // the default value of the ace card
  let currentMoney = $state(1000); // the player starts with 1000 units of money
  let bet = $state(100); // default bet 100 birim
  let isStarted = $state(false);
  let isStay = $state(false);
  let isSwitching = $state(false);
  // oyuncu split yapmak istediği zaman bu true olur.
  let isSplit = $state(false);
  // oyuncu double down dediği zaman
  let isDoubledown = $state(false);
  // cards of the dealer and the player.
  let dealerCards = $state([]);
  let playerCards = $state([]);
  // cards of the dealer that will be shown depending on the situation
  let shownDealerCards = $state([]);
  // Text displayed on the screen.
  let stateText = $state("");
  // Stores the value of the second hand.
  let secondHand = $state([]);
  // secondhand oynanma durumunu tutuyor
  let isSecondHand = $state(false);
  // state of the take button being disabled
  let takeDisabled = $state(false);
  // If the player ran out of money
  let isBroke = $state(false);
  // Score of the dealer
  let dealerScore = $derived(transformToNumerical(dealerCards));
  // Score of the player
  let playerScore = $derived(transformToNumerical(playerCards));
  // If the player finishes a round
  let roundStarted = $state(false);
  // the code about sounds
  // SOUND LOGIC WILL BE REPLACED WITH THE AUDIO PROCESSOR LIBRARY WHEN THAT FINISHES
  // defining the sounds that will be used

  const cards = [
    { id: 1, value: "A", suit: "spades" },
    { id: 2, value: "2", suit: "spades" },
    { id: 3, value: "3", suit: "spades" },
    { id: 4, value: "4", suit: "spades" },
    { id: 5, value: "5", suit: "spades" },
    { id: 6, value: "6", suit: "spades" },
    { id: 7, value: "7", suit: "spades" },
    { id: 8, value: "8", suit: "spades" },
    { id: 9, value: "9", suit: "spades" },
    { id: 10, value: "10", suit: "spades" },
    { id: 11, value: "J", suit: "spades" },
    { id: 12, value: "Q", suit: "spades" },
    { id: 13, value: "K", suit: "spades" },
    { id: 14, value: "A", suit: "hearts" },
    { id: 15, value: "2", suit: "hearts" },
    { id: 16, value: "3", suit: "hearts" },
    { id: 17, value: "4", suit: "hearts" },
    { id: 18, value: "5", suit: "hearts" },
    { id: 19, value: "6", suit: "hearts" },
    { id: 20, value: "7", suit: "hearts" },
    { id: 21, value: "8", suit: "hearts" },
    { id: 22, value: "9", suit: "hearts" },
    { id: 23, value: "10", suit: "hearts" },
    { id: 24, value: "J", suit: "hearts" },
    { id: 25, value: "Q", suit: "hearts" },
    { id: 26, value: "K", suit: "hearts" },
    { id: 27, value: "A", suit: "diamonds" },
    { id: 28, value: "2", suit: "diamonds" },
    { id: 29, value: "3", suit: "diamonds" },
    { id: 30, value: "4", suit: "diamonds" },
    { id: 31, value: "5", suit: "diamonds" },
    { id: 32, value: "6", suit: "diamonds" },
    { id: 33, value: "7", suit: "diamonds" },
    { id: 34, value: "8", suit: "diamonds" },
    { id: 35, value: "9", suit: "diamonds" },
    { id: 36, value: "10", suit: "diamonds" },
    { id: 37, value: "J", suit: "diamonds" },
    { id: 38, value: "Q", suit: "diamonds" },
    { id: 39, value: "K", suit: "diamonds" },
    { id: 40, value: "A", suit: "clubs" },
    { id: 41, value: "2", suit: "clubs" },
    { id: 42, value: "3", suit: "clubs" },
    { id: 43, value: "4", suit: "clubs" },
    { id: 44, value: "5", suit: "clubs" },
    { id: 45, value: "6", suit: "clubs" },
    { id: 46, value: "7", suit: "clubs" },
    { id: 47, value: "8", suit: "clubs" },
    { id: 48, value: "9", suit: "clubs" },
    { id: 49, value: "10", suit: "clubs" },
    { id: 50, value: "J", suit: "clubs" },
    { id: 51, value: "Q", suit: "clubs" },
    { id: 52, value: "K", suit: "clubs" },
  ];
  let playingCards = $state(shuffle([...cards]));
  // random number helper function
  function getRandomNum() {
    let num = Math.floor(Math.random() * playingCards.length);
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

  function selectCards() {
    // burada kartlar ilk olarak karıştırılıyor, sonra sondan çekiliyor, gerçek hayattaki gibi.
    // eğer kartlar bitmişse onları yeniliyoruz, ve karıştırıyoruz.
    if (playingCards.length <= 12) {
      playingCards = shuffle([...cards]);
    }
    // pop, hem seçer hem de siler.
    dealerCards = [playingCards.pop(), playingCards.pop()];
    if (!isSplit) {
      // burada da oyuncunun kartları seçiliyor
      playerCards = [playingCards.pop(), playingCards.pop()];
    } else if (isSplit) {
      playerCards = secondHand;
      isSecondHand = true;
    }
  }

  $effect(() => {
    if (isStay || isSwitching) {
      shownDealerCards = dealerCards;
    }
  });

  function viewDealerCards() {
    shownDealerCards = [dealerCards[0]];
  }

  $effect(() => {
    // paramız biterse oyun bitiyor..
    if (currentMoney <= 0) {
      setTimeout(() => {
        isBroke = true;
        play("BANKRUPCY");
        isStarted = false;
      }, 200);
    }
  });

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

  async function startGame() {
    if (!isStarted) {
      if (bet > 1 && bet < currentMoney) {
        isStarted = true;
        roundStarted = true;
        // await tick(), animasyonların, o elementler ilk doma ve aslında array'a eklenirken animasyon olması için. ilk kartlar eklenir, sonra animasyon ile gösterilir
        await tick();
        selectCards();
        await tick();
        viewDealerCards();
        // TODO: bu çalışmıyor!!!
        await tick(); // bu ilk başta bj olup olmamış mı diye.
        checkGame(); // eğer daha ilk elden şanslı olarak 21 yaparsa herhangi bir taraf, direk kazanır
      } else {
        stateText = "Invalid bet amount.";
        bet = 100;
        return;
      }
    }
  }
  async function redistributeCards() {
    // The hands of the player and the dealer are resetted
    playerCards = [];
    dealerCards = [];

    selectCards(); // Then, we select new cards.
    if (isSecondHand) {
      stateText = "Now playing with the second hand.";
    } else {
      stateText = "";
    }
    await tick();
    viewDealerCards();
    isStay = false;
    roundStarted = true;
    isDoubledown = false;
    isSwitching = false;
    await tick(); // bu ilk başta bj olup olmamış mı diye.
    checkGame();
  }

  function gameLogic(dealerValue, playerValue) {
    // Dealer takes a card.
    if (isDoubledown) {
      if (playerValue > 21) return "LOSE";
      if (dealerValue > 21) return "WIN";

      if (dealerValue === playerValue)
        return "PUSH"; // First checking for a push.
      // If we are in a "stay" state
      else if (playerValue > dealerValue) return "WIN";
      else if (dealerValue >= 21) return "LOSE";
      else if (dealerValue > playerValue) return "LOSE";
    } else {
      if (!isStay) {
        if (playerCards.length === 2 && playerValue === 21) return "BJ";
        else if (dealerValue > 21) return "WIN";
        else if (playerValue === 21) return "WIN";
        else if (dealerValue === 21) return "LOSE";
        else if (playerValue > 21) return "LOSE";
        return 0;
      } else {
        if (dealerValue < 17) {
          if (playerValue > 21) return "LOSE";
          else if (dealerValue > 21) {
            return "WIN";
          } else if (dealerValue > playerValue) {
            return "LOSE";
          } else if (playerValue > dealerValue) {
            return "WIN";
          }
        } else {
          if (dealerValue > 21) return "WIN";
          else if (dealerValue === playerValue)
            return "PUSH"; // First checking for a push.
          // If we are in a "stay" state
          else if (playerValue > dealerValue) return "WIN";
          else if (dealerValue > playerValue) return "LOSE";
        }
      }
    }
  }

  async function dealerCheck() {
    if (!(playerScore > 21)) {
      if (dealerScore >= 17) {
        stateText = "Dealer is on hold.";
        checkGame();
      } else {
        dealerCards.push(playingCards[getRandomNum()]);
        checkGame();
      }
      if (isStay || isDoubledown) {
        while (dealerScore <= 17) {
          // dealer gets cards until they reach 17
          dealerCards.push(playingCards[getRandomNum()]);
        }
        await tick();
        checkGame();
      }
    }
  }

  async function checkGame() {
    if (roundStarted) {
      let multiplier = isDoubledown ? 2 : 1;
      // Money is deducted when the round starts.
      switch (gameLogic(dealerScore, playerScore)) {
        case "WIN":
          currentMoney = currentMoney + multiplier * bet;
          stateText = "You won!";
          // playing the win sound
          play("WIN");
          roundStarted = false;
          isSwitching = true;
          isDoubledown = false;
          break;

        case "BJ":
          currentMoney = currentMoney + multiplier * (bet * 1.5);
          stateText = "You hit blackjack!";
          //playing the bj sound
          play("BIG_WIN");
          roundStarted = false;
          isSwitching = true;
          isDoubledown = false;
          break;

        case "LOSE":
          stateText = "You lost.";
          currentMoney = currentMoney - bet * multiplier;
          //playing the lose sound
          play("LOSE");
          roundStarted = false;
          isSwitching = true;
          isDoubledown = false;
          break;

        case "PUSH":
          stateText = "Push.";
          roundStarted = false;
          isSwitching = true;
          isDoubledown = false;
          break;
        default:
          return;
      }
    }
  }

  // TODO: eğer aşağıdakilerden bazıları eligible değilse, eligible olmayanların butonları grayed out olsun
  async function action(actionDesc) {
    if (actionDesc === "TAKE") {
      takeDisabled = true;
      playerCards.push(playingCards[getRandomNum()]); // player takes a card
      setTimeout(() => {
        takeDisabled = false;
        checkGame();
        checkSplitting();
      }, 500);
    } else if (actionDesc === "STAY") {
      if (!isDoubledown) {
        isStay = true;
        setTimeout(() => {
          dealerCheck();
          checkGame();
          checkSplitting();
        }, 300);
      } else {
        stateText = "You can't stay while doubling down.";
      }
    } else if (actionDesc === "SPLIT") {
      // Check eligibility of a split
      if (!isDoubledown && currentMoney > bet * 2) {
        if (isSplit) {
          stateText = "You are already splitting.";
        } else if (
          playerCards.length === 2 &&
          transformToNumerical(playerCards[1]) ===
            transformToNumerical(playerCards[0])
        ) {
          // Splitting allowed.
          isSplit = true;
          secondHand = [playerCards[1], playingCards[getRandomNum()]];
          playerCards = [playerCards[0], playingCards[getRandomNum()]];
          stateText = "You're playing with your first hand.";
          checkGame(); // eğer ilk elden blackjack olursa diye.
          checkSplitting();
        }
      } else {
        stateText = "You can't split right now.";
      }
    } else if (actionDesc === "DOUBLEDOWN") {
      //TODO: Double down logic.
      // Check for double down eligibility
      if (
        playerCards.length === 2 &&
        currentMoney >= bet * 2 &&
        !isDoubledown &&
        (!isSplit || !isSecondHand)
      ) {
        isDoubledown = true;
        stateText = "Doubling down.";
        playerCards.push(playingCards[getRandomNum()]); // player takes a card
        checkSplitting();
        dealerCheck();
        checkGame();
      } else {
        stateText = "You can't double down right now.";
      }
    }
  }

  // Checks if splitting state finished.
  function checkSplitting() {
    if (isSplit && isSecondHand) {
      isSplit = false;
      isSecondHand = false;
    }
  }
</script>

<main
  class="text-lg flex flex-col md:grid md:grid-cols-[35%_65%] lg:grid-cols-[25%_75%] md:grid-rows-1 min-h-screen h-screen"
>
  <!-- Betting area -->
  {#if !isBroke}
    <div class="p-3 bg-[#213744] text-[#bbcad4]">
      <div
        class="m-auto md:max-w-100 max-w-none px-6 pl-0 md:p-0 sm:w-[70%] w-[90%] md:w-auto"
      >
        <div class="flex flex-col">
          <div class="flex flex-row justify-between mb-3">
            <span>Available funds: </span> <span>{currentMoney}</span>
          </div>
          <span class="text-sm m-1">Betting amount</span>
          <input
            max={currentMoney}
            min="0"
            type="number"
            bind:value={bet}
            readonly={isStarted}
            class="number-input p-2 text-xl border-[#2e4c7d] border rounded-lg w-full bg-[#182b39] shadow-2xl"
          />
          <div
            class="grid grid-cols-2 grid-rows-2 gap-3 gap-y-4 mt-4 text-base"
          >
            <Button
              text="Take"
              onclick={() => action("TAKE")}
              disabled={!isStarted || !roundStarted || takeDisabled}
              iconDesc="TAKE"
              gray={!isStarted || !roundStarted || takeDisabled}
            ></Button>
            <Button
              text="Hold"
              onclick={() => action("STAY")}
              iconDesc="STAY"
              gray={!isStarted || !roundStarted}
              disabled={!isStarted || !roundStarted}
            ></Button>
            <Button
              text="Split"
              onclick={() => action("SPLIT")}
              iconDesc="SPLIT"
              gray={!isStarted || !roundStarted}
              disabled={!isStarted || !roundStarted}
            ></Button>
            <Button
              text="Double Down"
              onclick={() => action("DOUBLEDOWN")}
              iconDesc="DOUBLEDOWN"
              gray={!isStarted || !roundStarted}
              disabled={!isStarted || !roundStarted}
            ></Button>
          </div>
          <!-- TODO: Fix top margin -->
          <div class="mt-4">
            <Button
              onclick={() => {
                !isStarted ? startGame() : redistributeCards();
              }}
              text="Play"
              gray={roundStarted}
              disabled={roundStarted}
              mode="ACTION"
            ></Button>
          </div>
        </div>


      </div>
    </div>
    <div class="bg-[#0f212f] p-4 flex flex-row h-full">
      {#if isStarted}
        <!-- oyunun oynandığı kısım -->
        <div
          class="grid grid-cols-1 grid-rows-[10%_50%_40%] h-full w-full items-center justify-center"
        >
          <div class="flex flex-row justify-between h-auto p-2">
            <div
              transition:fade={{ duration: 200 }}
              class="{stateText === '' &&
                'hidden'} p-2 rounded-lg m-1 w-fit px-2 text-[#bbcad4] bg-[#152c39]"
            >
              {stateText}
            </div>
            <div
              class="{isSwitching && 'opacity-100'} opacity-0 flex justify-end"
            ></div>
          </div>

          <div class="grid grid-rows-[15%_85%] grid-cols-1 h-full w-full">
            <div class="flex justify-center items-center">
              <div
                class="rounded-full text-lg w-fit h-fit p-1 px-3 text-[#bbcad4] bg-[#152c39]"
              >
                Dealer
              </div>
            </div>
            <div
              class="flex flex-row flex-1 flex-wrap gap-4 mt-3 justify-center"
            >
              {#each shownDealerCards as card (card)}
                <div
                  in:fly={{ y: 200, duration: 200, delay: 200 }}
                  out:fade={{ duration: 200 }}
                  onintrostart={() => play("PLACEMENT")}
                  class="bg-[#c0d7d6] h-30 w-20 md:h-40 md:min-w-30 md:w-30 rounded-sm outline-4 outline-[#577c7a]"
                >
                  <p class="font-bold m-2 ml-2.5 text-3xl">{card?.value}</p>
                  <div class="w-full h-full ml-7 mt-5 text-5xl">
                    {#if card?.suit === "clubs"}
                      ♣️
                    {/if}
                    {#if card?.suit === "spades"}
                      ♠️
                    {/if}
                    {#if card?.suit === "hearts"}
                      ♥️
                    {/if}
                    {#if card?.suit === "diamonds"}
                      ♦️
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <div class="grid grid-rows-[15%_85%] grid-cols-1 h-full w-full">
            <div class="flex justify-center items-center">
              <div
                class="rounded-full text-lg w-fit h-fit p-1 px-3 text-[#bbcad4] bg-[#152c39]"
              >
                Player
              </div>
            </div>
            <div
              class="flex flex-row flex-1 flex-wrap gap-4 mt-3 justify-center"
            >
              <svelte:boundary
                onerror={(e) =>
                  console.error(
                    "Exception while displaying or handling cards. \n" + e,
                  )}
              >
                {#each playerCards as card, i (card)}
                  <div
                    onintrostart={() => {
                      play("PLACEMENT");
                    }}
                    in:fly={{ y: 200, duration: 200, delay: 200 + i * 50 }}
                    out:fade={{ duration: 50 }}
                    class="bg-[#c0d7d6] h-30 w-20 md:h-40 md:min-w-30 md:w-30 rounded-sm outline-4 outline-[#577c7a]"
                  >
                    <p class="font-bold m-2 ml-2.5 text-3xl">{card?.value}</p>
                    <div class="w-full h-full ml-7 mt-5 text-5xl">
                      {#if card?.suit === "clubs"}
                        ♣️
                      {/if}
                      {#if card?.suit === "spades"}
                        ♠️
                      {/if}
                      {#if card?.suit === "hearts"}
                        ♥️
                      {/if}
                      {#if card?.suit === "diamonds"}
                        ♦️
                      {/if}
                    </div>
                  </div>
                {/each}
              </svelte:boundary>
            </div>
          </div>
        </div>
      {:else}
        <div
          class="flex flex-col m-auto h-full gap-5 justify-center items-center"
        >
          <div>
            <svg
              class="w-28 h-28"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              ><title>cards-playing-spade-multiple</title><path
                fill="#bbcad4"
                d="M3 4V22C3 23.1 3.9 24 5 24H17V22H5V4H3M19 0H9C7.9 0 7 .9 7 2V18C7 19.1 7.9 20 9 20H19C20.1 20 21 19.1 21 18V2C21 .9 20.1 0 19 0M15.8 13C15.4 13 15 12.9 14.6 12.7L15.5 15H12.5L13.4 12.7C13 12.9 12.6 13 12.2 13C11 13 10 12 10 10.8C10 9.3 11.4 8.1 13.4 6.2L14 5.7L14.6 6.2C16.6 8.1 18 9.3 18 10.8C18 12.1 17 13 15.8 13Z"
              /></svg
            >
          </div>
          <div class="text-[#bbcad4] font-bold text-2xl">Blackjack</div>
        </div>
      {/if}
    </div>
  {:else}
    <div
      transition:fade
      class="flex flex-col gap-3 items-center bg-[#213744] text-[#bbcad4] justify-center md:text-4xl h-screen w-screen text-3xl"
    >
      <span class="mx-1">You've gone bankrupt.</span>
      <div class="relative w-fit mt-4 mx-3">
        <div class="absolute w-full mx-3 h-full bg-[#2baf3d] rounded-lg"></div>
        <button
          onclick={() => location.reload()}
          class="py-2.5 px-2 mx-3 flex flex-row gap-2 border border-[#2baf3d] w-full cursor-pointer -translate-y-0.75 active:translate-0 transition-transform bg-[#0f8f20] rounded-lg"
          ><div class="text-center text-2xl w-full">Try Again</div></button
        >
      </div>
    </div>
  {/if}
</main>

<style>
</style>
