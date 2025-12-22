<script>
  import "./app.css";
  import { fly, fade } from "svelte/transition";
  import { tick } from "svelte";
  import { play } from "./soundManager.svelte";
  import Button from "./Button.svelte";
  import BankrupcyScreen from "./BankrupcyScreen.svelte";
  import {
    transformToNumerical,
    getRandomNum,
    shuffle,
  } from "./gameHelpers.svelte";
  import { game } from "./gameStates.svelte";

  let playingCards = $state(shuffle([...game.cards]));

  function selectCards() {
    // burada kartlar ilk olarak karıştırılıyor, sonra sondan çekiliyor, gerçek hayattaki gibi.
    // eğer kartlar bitmişse onları yeniliyoruz, ve karıştırıyoruz.
    if (playingCards.length <= 12) {
      playingCards = shuffle([...game.cards]);
    }
    // pop, hem seçer hem de siler.
    game.dealerCards = [playingCards.pop(), playingCards.pop()];
    if (!game.isSplit) {
      // burada da oyuncunun kartları seçiliyor
      game.playerCards = [playingCards.pop(), playingCards.pop()];
    } else if (game.isSplit) {
      game.playerCards = game.secondHand;
      game.isSecondHand = true;
    }
  }

  $effect(() => {
    if ((game.isStay || game.isSwitching) && !game.isSplit) {
      game.shownDealerCards = game.dealerCards;
    }
  });

  function viewDealerCards() {
    game.shownDealerCards = [game.dealerCards[0]];
  }

  $effect(() => {
    if (game.bet > game.money || game.bet < 0) {
      game.bet = 100;
      alert("Invalid bet!");
      game.isStarted = false;
      game.hasRoundStarted = false;
      game.isSwitching = true;
    }

  })

  $effect(() => {
    // paramız biterse oyun bitiyor..
    if (game.money <= 0) {
      setTimeout(() => {
        game.isBankrupt = true;
        play("BANKRUPCY");
        game.isStarted = false;
      }, 200);
    }
  });

  async function startGame() {
    if (!game.isStarted) {
      if (game.bet > 1 && game.bet < game.money) {
        game.isStarted = true;
        game.hasRoundStarted = true;
        // await tick(), animasyonların, o elementler ilk doma ve aslında array'a eklenirken animasyon olması için. ilk kartlar eklenir, sonra animasyon ile gösterilir
        await tick();
        selectCards();
        await tick();
        viewDealerCards();
        // TODO: bu çalışmıyor!!!
        await tick(); // bu ilk başta bj olup olmamış mı diye.
        checkGame(); // eğer daha ilk elden şanslı olarak 21 yaparsa herhangi bir taraf, direk kazanır
      } else {
        game.stateText = "Invalid bet amount.";
        game.bet = 100;
        game.isStarted = false;
        game.hasRoundStarted = false;
        return;
      }
    }
  }
  async function redistributeCards() {
    // The hands of the player and the dealer are resetted
    game.playerCards = [];
    game.dealerCards = [];

    selectCards(); // Then, we select new cards.
    if (game.isSecondHand) {
      game.stateText = "Now playing with the second hand.";
    } else {
      game.stateText = "";
    }
    await tick();
    viewDealerCards();
    game.isStay = false;
    game.hasRoundStarted = true;
    game.isDoubledown = false;
    game.isSwitching = false;
    await tick(); // bu ilk başta bj olup olmamış mı diye.
    checkGame();
  }

  function gameLogic(dealerValue, playerValue) {
    // Dealer takes a card.
    if (playerValue > 21) return "LOSE";
    if (dealerValue > 21) return "WIN";
    if (game.isDoubledown) {
      if (playerValue > 21) return "LOSE";
      if (dealerValue > 21) return "WIN";

      if (dealerValue === playerValue)
        return "PUSH"; // First checking for a push.
      // If we are in a "stay" state
      else if (playerValue > dealerValue) return "WIN";
      else if (dealerValue >= 21) return "LOSE";
      else if (dealerValue > playerValue) return "LOSE";
    } else {
      if (!game.isStay) {
        if (game.playerCards.length === 2 && playerValue === 21) return "BJ";
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
    // timeout eklenecek!
    if (!(game.playerScore > 21)) {
      if (game.dealerScore >= 17) {
        game.stateText = "Dealer is on hold.";
        checkGame();
      } else {
        game.dealerCards.push(playingCards[getRandomNum(playingCards)]);
        checkGame();
      }
      if (game.isStay || game.isDoubledown) {
        while (game.dealerScore < 17) {
          // dealer gets cards until they reach 17
          game.dealerCards.push(playingCards[getRandomNum(playingCards)]);
        }
        checkGame();
      }
    }
  }

  async function checkGame() {
    // split için sadece checkSplitting çalışacak
    if (game.hasRoundStarted && !game.isSplit) {
      let multiplier = game.isDoubledown ? 2 : 1;
      // Money is deducted when the round starts.
      switch (gameLogic(game.dealerScore, game.playerScore)) {
        case "WIN":
          game.money = game.money + multiplier * game.bet;
          game.stateText = "You won!";
          // playing the win sound
          play("WIN");
          game.hasRoundStarted = false;
          game.isSwitching = true;
          game.isDoubledown = false;
          break;

        case "BJ":
          game.money = game.money + multiplier * (game.bet * 1.5);
          game.stateText = "You hit blackjack!";
          //playing the bj sound
          play("BIG_WIN");
          game.hasRoundStarted = false;
          game.isSwitching = true;
          game.isDoubledown = false;
          break;

        case "LOSE":
          game.stateText = "You lost.";
          game.money = game.money - game.bet * multiplier;
          //playing the lose sound
          play("LOSE");
          game.hasRoundStarted = false;
          game.isSwitching = true;
          game.isDoubledown = false;
          break;

        case "PUSH":
          game.stateText = "Push.";
          game.hasRoundStarted = false;
          game.isSwitching = true;
          game.isDoubledown = false;
          break;
        default:
          return;
      }
    }
  }

  async function checkGameOnSplit(forceSwitch) {
    // if the player wishes to stay, than forceSwitch = true;
    let currentResult = null;
    if (game.playerScore === 21) currentResult = "BJ";
    else if (game.playerScore > 21) currentResult = "LOSE";
    // if the game has not finished yet and also if we havent said stay, then don't do anything because we may draw another card
    if (!currentResult && !forceSwitch && !game.isSecondHand) return;
    if (!game.isSecondHand) {
      if (currentResult === "BJ") {
        game.stateText = "First hand Blackjack! Switching to second hand.";
        play("BIG_WIN");
      } else if (currentResult === "LOSE") {
        game.stateText = "First hand bust. Switching to second hand.";
        play("LOSE");
      } else {
        game.stateText = "Switching to second hand.";
      }
      setTimeout(() => {
        game.firstHand = game.playerCards;
        game.playerCards = game.secondHand;
        game.isSecondHand = true;
      }, 400);
    } else {
      game.secondHand = game.playerCards;
      if (currentResult === "BJ") play("BIG_WIN");
      if (currentResult === "LOSE") play("LOSE");
      if (currentResult || forceSwitch) {
        game.isStay = true;
        await dealerCheck();
        checkSplitting();
      }
    }
  }

  // TODO: eğer aşağıdakilerden bazıları eligible değilse, eligible olmayanların butonları grayed out olsun
  async function action(actionDesc) {
    if (actionDesc === "TAKE") {
      game.isTakeDisabled = true;
      // we delete the card just after we put it in the player's deck
      let cardToPush = playingCards[getRandomNum(playingCards)];
      game.playerCards.push(cardToPush);
      if (!game.isSecondHand && game.isSplit) {
        game.firstHand = game.playerCards;
      }
      playingCards = playingCards.filter((card) => card !== cardToPush);
      setTimeout(() => {
        game.isTakeDisabled = false;
        if (game.isSplit) {
          checkGameOnSplit(false);
        } else {
          checkGame();
        }
        //checkSplitting();
      }, 400);
    } else if (actionDesc === "STAY") {
      if (!game.isDoubledown) {
        if (game.isSplit && !game.isSecondHand) {
          checkGameOnSplit(true);
        } else {
          game.isStay = true;
          dealerCheck();
          setTimeout(() => {
            if (!game.isSplit) {
              checkGame();
            } else {
              checkSplitting();
            }
          }, 400);
        }
      } else {
        game.stateText = "You can't stay while doubling down.";
      }
    } else if (actionDesc === "SPLIT") {
      // Check eligibility of a split
      if (!game.isDoubledown && game.money > game.bet * 2) {
        if (game.isSplit) {
          // todo: bunu sonra kaldır.
          game.stateText = "You are already splitting.";
        } else if (
          game.playerCards.length === 2 &&
          transformToNumerical(game.playerCards[1]) ===
            transformToNumerical(game.playerCards[0])
        ) {
          // Splitting allowed.
          game.isSplit = true;
          game.secondHand = [
            game.playerCards[1],
            playingCards[getRandomNum(playingCards)],
          ];
          game.firstHand = [
            game.playerCards[0],
            playingCards[getRandomNum(playingCards)],
          ];
          game.playerCards = game.firstHand;
          game.stateText = "You're playing with your first hand.";
          if (game.playerScore === 21) {
            game.stateText = "You hit blackjack!";
            //playing the bj sound
            play("BIG_WIN");
            game.hasRoundStarted = false;
            game.isSwitching = true;
            game.isDoubledown = false;
            game.playerCards = game.secondHand;
            game.isSecondHand = true;
          }
          checkSplitting();
        }
      } else {
        game.stateText = "You can't split right now.";
      }
    } else if (actionDesc === "DOUBLEDOWN") {
      //TODO: Double down logic.
      // Check for double down eligibility
      if (
        game.playerCards.length === 2 &&
        game.money >= game.bet * 2 &&
        !game.isDoubledown &&
        (!game.isSplit || !game.isSecondHand)
      ) {
        game.isDoubledown = true;
        game.stateText = "Doubling down.";
        game.playerCards.push(playingCards[getRandomNum(playingCards)]); // player takes a card
        checkSplitting();
        dealerCheck();
        checkGame();
      } else {
        game.stateText = "You can't double down right now.";
      }
    }
  }

  // Checks if splitting state finished.
  function checkSplitting() {
    let multiplier = game.isDoubledown ? 2 : 1;
    if (game.isSplit && game.isSecondHand) {
      game.isSplit = false;
      game.isSecondHand = false;
      let firstHandText = "";
      let secondHandText = "";
      // İŞTE İKİ ELİN BERABER SONUCUNU BURADA VERECEĞİZ.
      // ikinci el sonlandığı zaman iki elin sonucunu beraber vereceğiz.
      const firstHandResult = gameLogic(
        game.dealerScore,
        transformToNumerical(game.firstHand),
      );
      const secondHandResult = gameLogic(
        game.dealerScore,
        transformToNumerical(game.playerCards),
      );
      if (firstHandResult === "WIN") {
        firstHandText = "Won the first hand";
        game.money = game.money + multiplier * game.bet;
      } else if (firstHandResult === "LOSE") {
        firstHandText = "Lost the first hand";
        game.money = game.money - multiplier * game.bet;
      } else if (firstHandResult === "PUSH") {
        firstHandText = "First hand was a push";
      } else if (firstHandResult === "BJ") {
        firstHandText = "First hand was a blackjack";
        game.money = game.money + multiplier * game.bet * 1.5;
      }
      // text for the second hand
      if (secondHandResult === "WIN") {
        secondHandText = "won the second hand";
        game.money = game.money + multiplier * game.bet;
      } else if (secondHandResult === "LOSE") {
        secondHandText = "lost the second hand";
        game.money = game.money - multiplier * game.bet;
      } else if (secondHandResult === "PUSH") {
        secondHandText = "second hand was a push";
      } else if (secondHandResult === "BJ") {
        secondHandText = "second hand was a blackjack";
        game.money = game.money + multiplier * game.bet * 1.5;
      }
      game.stateText = `${firstHandText} and ${secondHandText}`;
      game.hasRoundStarted = false;
      game.isSwitching = true;
      game.isDoubledown = false;
    }
  }
</script>

<main
  class="text-lg flex flex-col md:grid md:grid-cols-[35%_65%] lg:grid-cols-[25%_75%] md:grid-rows-1 min-h-screen h-screen"
>
  <!-- Betting area -->
  {#if !game.isBankrupt}
    <div class="p-3 bg-[#213744] text-[#bbcad4]">
      <div
        class="m-auto md:max-w-100 max-w-none px-6 pl-0 md:p-0 sm:w-[70%] w-[90%] md:w-auto"
      >
        <div class="flex flex-col">
          <div class="flex flex-row justify-between mb-3">
            <span>Available funds: </span> <span>{game.money}</span>
          </div>
          <span class="text-sm m-1">Betting amount</span>
          <input
            max={game.money}
            min="0"
            type="number"
            bind:value={game.bet}
            readonly={game.hasRoundStarted}
            class="number-input p-2 text-xl border-[#2e4c7d] border rounded-lg w-full bg-[#182b39] shadow-2xl"
          />
          <div
            class="grid grid-cols-2 grid-rows-2 gap-3 gap-y-4 mt-4 text-base"
          >
            <Button
              text="Take"
              onclick={() => action("TAKE")}
              disabled={!game.isStarted ||
                !game.hasRoundStarted ||
                game.isTakeDisabled}
              iconDesc="TAKE"
              gray={!game.isStarted ||
                !game.hasRoundStarted ||
                game.isTakeDisabled}
            ></Button>
            <Button
              text="Hold"
              onclick={() => action("STAY")}
              iconDesc="STAY"
              gray={!game.isStarted || !game.hasRoundStarted}
              disabled={!game.isStarted || !game.hasRoundStarted}
            ></Button>
            <Button
              text="Split"
              onclick={() => action("SPLIT")}
              iconDesc="SPLIT"
              gray={!game.isStarted || !game.hasRoundStarted}
              disabled={!game.isStarted || !game.hasRoundStarted}
            ></Button>
            <Button
              text="Double Down"
              onclick={() => action("DOUBLEDOWN")}
              iconDesc="DOUBLEDOWN"
              gray={!game.isStarted || !game.hasRoundStarted}
              disabled={!game.isStarted || !game.hasRoundStarted}
            ></Button>
          </div>
          <!-- TODO: Fix top margin -->
          <div class="mt-4">
            <Button
              onclick={() => {
                !game.isStarted ? startGame() : redistributeCards();
              }}
              text="Play"
              gray={game.hasRoundStarted}
              disabled={game.hasRoundStarted}
              mode="ACTION"
            ></Button>
          </div>
        </div>
      </div>
    </div>
    <div class="bg-[#0f212f] p-4 flex flex-row h-full">
      {#if game.isStarted}
        <!-- oyunun oynandığı kısım -->
        <div
          class="grid grid-cols-1 grid-rows-[10%_50%_40%] h-full w-full items-center justify-center"
        >
          <div class="flex flex-row justify-between h-auto p-2">
            <div
              transition:fade={{ duration: 200 }}
              class="{game.stateText === '' &&
                'hidden'} p-2 rounded-lg m-1 w-fit px-2 text-[#bbcad4] bg-[#152c39]"
            >
              {game.stateText}
            </div>
            <div
              class="{game.isSwitching &&
                'opacity-100'} opacity-0 flex justify-end"
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
              {#each game.shownDealerCards as card (card)}
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
                {#each game.playerCards as card, i (card)}
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
    <BankrupcyScreen></BankrupcyScreen>
  {/if}
</main>

<style>
</style>
