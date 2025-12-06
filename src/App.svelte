<script>
  import "./app.css";
  import { fly, fade } from "svelte/transition";
  import { tick } from "svelte";
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
  let playingCards = $state([...cards]);
  function getRandomNum() {
    let num = Math.floor(Math.random() * playingCards.length);
    return num;
  }

  function selectCards() {
    // eğer kartlar bitmişse onları yeniliyoruz
    if (playingCards.length <= 16) {
      playingCards = [...cards];
    }
    // after that, we give cards to the player and the dealer
    dealerCards = [playingCards[getRandomNum()], playingCards[getRandomNum()]];

    for (let dealerCard of dealerCards) {
      // Removing the played cards of the dealer
      playingCards = playingCards.filter((card) => card.id !== dealerCard.id);
    }
    if (!isSplit) {
      //! temporary solution, gerçek sorunu çözmek yerine koli bandıyla kapatmak gibi.
      while (playerCards.length < 2) {
        if (playerCards.length === 1) {
          playerCards.push(playingCards[getRandomNum()]);
        }
        playerCards = [
          playingCards[getRandomNum()],
          playingCards[getRandomNum()],
        ];
      }
    } else if (isSplit) {
      playerCards = secondHand;
      isSecondHand = true;
    }
    // oyuncunun kartları oyun destesinden çıkartılır
    for (let playerCard of playerCards) {
      // Removing the played cards of the player
      playingCards = playingCards.filter((card) => card.id !== playerCard.id);
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
      isStarted = false;
      isBroke = true;
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
    console.log("p " + playerScore);
    console.log("d " + dealerScore);
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
          roundStarted = false;
          isSwitching = true;
          isDoubledown = false;
          break;

        case "BJ":
          currentMoney = currentMoney + multiplier * (bet * 1.5);
          stateText = "You hit blackjack!";
          roundStarted = false;
          isSwitching = true;
          isDoubledown = false;
          break;

        case "LOSE":
          stateText = "You lost.";
          currentMoney = currentMoney - bet * multiplier;
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
            <div
              class="relative w-full {(!isStarted ||
                !roundStarted ||
                takeDisabled) &&
                'pointer-events-none opacity-50'}"
            >
              <div class="absolute w-full h-full bg-[#2e4c7d] rounded-lg"></div>
              <button
                disabled={takeDisabled}
                onclick={() => action("TAKE")}
                class="py-2.5 px-2 flex w-full border border-[#2e4c7d] flex-row justify-between items-center cursor-pointer -translate-y-0.75 active:translate-0 transition-transform bg-[#2f4553] rounded-lg"
              >
                <div>Take</div>

                <svg
                  class="w-7 h-7"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  ><title>cards-playing-outline</title><path
                    fill="#bbcad4"
                    d="M11.19,2.25C11.97,2.26 12.71,2.73 13,3.5L18,15.45C18.09,15.71 18.14,16 18.13,16.25C18.11,17 17.65,17.74 16.9,18.05L9.53,21.1C9.27,21.22 9,21.25 8.74,21.25C7.97,21.23 7.24,20.77 6.93,20L1.97,8.05C1.55,7.04 2.04,5.87 3.06,5.45L10.42,2.4C10.67,2.31 10.93,2.25 11.19,2.25M14.67,2.25H16.12A2,2 0 0,1 18.12,4.25V10.6L14.67,2.25M20.13,3.79L21.47,4.36C22.5,4.78 22.97,5.94 22.56,6.96L20.13,12.82V3.79M11.19,4.22L3.8,7.29L8.77,19.3L16.17,16.24L11.19,4.22M8.65,8.54L11.88,10.95L11.44,14.96L8.21,12.54L8.65,8.54Z"
                  /></svg
                >
              </button>
            </div>
            <div
              class="relative w-full {(!isStarted || !roundStarted) &&
                'pointer-events-none opacity-50'}"
            >
              <div class="absolute w-full h-full bg-[#2e4c7d] rounded-lg"></div>
              <button
                onclick={() => action("STAY")}
                class="py-2.5 px-2 flex justify-between items-center border border-[#2e4c7d] w-full flex-row cursor-pointer -translate-y-0.75 active:translate-0 transition-transform bg-[#2f4553] rounded-lg"
              >
                <div>Hold</div>
                <div>
                  <svg
                    class="w-7 h-7"
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#bbcad4"
                    ><path
                      d="M507-40q-93 0-171.5-47.5T209-215L60-463l20-20q16-16 38-17.5t40 11.5l122 90v-411q0-12 8.5-21t21.5-9q12 0 21 9t9 21v528L161-414l98 164q38 69 104 109.5T507-100q113 0 193-78t80-190v-402q0-12 8.5-21t21.5-9q12 0 21 9t9 21v402q0 137-97.5 232.5T507-40Zm-60-450v-400q0-12 9-21t21-9q13 0 21.5 9t8.5 21v400h-60Zm167 0v-360q0-12 8.5-21t21.5-9q12 0 21 9t9 21v360h-60ZM471-295Z"
                    /></svg
                  >
                </div></button
              >
            </div>
            <div
              class="relative w-full {(!isStarted || !roundStarted) &&
                'pointer-events-none opacity-50'}"
            >
              <div class="absolute w-full h-full bg-[#2e4c7d] rounded-lg"></div>

              <button
                onclick={() => action("SPLIT")}
                class="py-2.5 px-2 justify-between items-center border border-[#2e4c7d] flex w-full flex-row cursor-pointer -translate-y-0.75 active:translate-0 transition-transform bg-[#2f4553] rounded-lg"
                ><div>Split</div>
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="28px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#bbcad4"
                    ><path
                      d="M200-160q-33 0-56.5-23.5T120-240v-480q0-33 23.5-56.5T200-800h160v80H200v480h160v80H200Zm240 80v-800h80v80h240q33 0 56.5 23.5T840-720v480q0 33-23.5 56.5T760-160H520v80h-80Zm80-160h240v-480H520v480Zm-320 0v-480 480Zm560 0v-480 480Z"
                    /></svg
                  >
                </div></button
              >
            </div>
            <div
              class="relative w-full {(!isStarted || !roundStarted) &&
                'pointer-events-none opacity-50'}"
            >
              <div class="absolute w-full h-full bg-[#2e4c7d] rounded-lg"></div>
              <button
                onclick={() => action("DOUBLEDOWN")}
                class="py-2.5 px-2 justify-between items-center flex border border-[#2e4c7d] w-full flex-row cursor-pointer -translate-y-0.75 active:translate-0 transition-transform bg-[#2f4553] rounded-lg"
                ><div>Double</div>
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="28px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#bbcad4"
                    ><path
                      d="M200-280v-160q0-33 23.5-56.5T280-520h80v-80H200v-80h160q33 0 56.5 23.5T440-600v80q0 33-23.5 56.5T360-440h-80v80h160v80H200Zm280 0 120-200-120-200h80l80 133 80-133h80L680-480l120 200h-80l-80-133-80 133h-80Z"
                    /></svg
                  >
                </div></button
              >
            </div>
          </div>
        </div>
        <div
          class="relative w-full mt-4 {roundStarted &&
            'pointer-events-none opacity-50'}"
        >
          <div class="absolute w-full h-full bg-[#2baf3d] rounded-lg"></div>
          <button
            onclick={() => {
              !isStarted ? startGame() : redistributeCards();
            }}
            class="py-2.5 px-2 flex border border-[#2baf3d] w-full flex-row cursor-pointer -translate-y-0.75 active:translate-0 transition-transform bg-[#0f8f20] rounded-lg"
            ><div class="text-center w-full font-bold">Play</div></button
          >
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
              {#each playerCards as card, i (card)}
                <div
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
