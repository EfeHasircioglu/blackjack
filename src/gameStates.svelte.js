/**
 * @typedef {Object} Card
 * @property {number} id - Kartın benzersiz ID'si.
 * @property {string} value - Kartın yüz değeri ('A', '2', 'K' vb.).
 * @property {string} suit - Kartın türü ('spades', 'hearts' vb.).
 */

/**
 * Oyunun tüm durumunu yöneten merkezi store.
 * * @typedef {Object} GameStore
 * * // --- Parasal Değerler ---
 * @property {number} money - Oyuncunun mevcut parası.
 * @property {number} bet - Şu anki bahis miktarı.
 * * // --- Oyun Akış Durumları ---
 * @property {boolean} isStarted - Oyunun (turun) başlayıp başlamadığı.
 * @property {boolean} hasRoundStarted - Oyuncunun turu bitirip bitirmediği kontrolü.
 * @property {boolean} isBankrupt - Oyuncunun parasının bitip bitmediği.
 * * // --- Oyuncu Aksiyonları ---
 * @property {boolean} isStay - Oyuncunun 'Stay' (Kal) diyip demediği.
 * @property {boolean} isSwitching - (Eğer kullanılıyorsa) El değiştirme durumu.
 * @property {boolean} isSplit - Oyuncunun elini ikiye bölüp bölmediği.
 * @property {boolean} isDoubledown - Oyuncunun bahsi ikiye katlayıp katlamadığı.
 * @property {boolean} isTakeDisabled - Kart çekme butonunun pasif olup olmadığı.
 * * // --- Kartlar ve Eller ---
 * @property {Card[]} dealerCards - Krupiyenin elindeki kartlar.
 * @property {Card[]} playerCards - Oyuncunun elindeki kartlar.
 * @property {Card[]} shownDealerCards - Krupiyenin o an oyuncuya gösterilen kartları.
 * @property {Card[]} secondHand - Eğer split yapıldıysa, ikinci eldeki kartlar.
 * @property {boolean} isSecondHand - Şu an ikinci elin oynanıp oynanmadığı.
 * * // --- Arayüz ve Metinler ---
 * @property {string} stateText - Ekranda gösterilen durum metni.
 * * // --- Sadece Okunabilir (Read-Only / Derived) ---
 * @property {number} dealerScore - Krupiyenin hesaplanmış skoru.
 * @property {number} playerScore - Oyuncunun hesaplanmış skoru.
 * @property {readonly Card[]} cards - Destede bulunan tüm kartların sabit listesi.
 */

/** * @type {GameStore}
 */
import { transformToNumerical } from "./gameHelpers.svelte";
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
// Stores the value of the first hand.
let firstHand = $state([]);
// secondhand oynanma durumunu tutuyor
let isSecondHand = $state(false);
//
let splitGames = $state();
// state of the take button being disabled
let isTakeDisabled = $state(false);
// If the player ran out of money
let isBankrupt = $state(false);
// Score of the dealer
let dealerScore = $derived(transformToNumerical(dealerCards));
// Score of the player
let playerScore = $derived(transformToNumerical(playerCards));
// If the player finishes a round
let hasRoundStarted = $state(false);

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

// TODO: write the remanining getters and setters
export const game = {
  // GETTERS
  get money() {
    return currentMoney;
  },
  get bet() {
    return bet;
  },
  get isStarted() {
    return isStarted;
  },
  get isStay() {
    return isStay;
  },
  get isSwitching() {
    return isSwitching;
  },
  get isSplit() {
    return isSplit;
  },
  get isDoubledown() {
    return isDoubledown;
  },
  get dealerCards() {
    return dealerCards;
  },
  get playerCards() {
    return playerCards;
  },
  get shownDealerCards() {
    return shownDealerCards;
  },
  get stateText() {
    return stateText;
  },
  get secondHand() {
    return secondHand;
  },
  get firstHand() {
    return firstHand;
  },
  get isSecondHand() {
    return isSecondHand;
  },
  get splitGames() {
    return splitGames;
  },
  get isTakeDisabled() {
    return isTakeDisabled;
  },
  get isBankrupt() {
    return isBankrupt;
  },
  get dealerScore() {
    // no setter for this
    return dealerScore;
  },
  get playerScore() {
    // no setter for this
    return playerScore;
  },
  get hasRoundStarted() {
    return hasRoundStarted;
  },
  get cards() {
    // no setter for this
    return cards;
  },

  // SETTERS
  set money(val) {
    currentMoney = val;
  },
  set bet(val) {
    bet = val;
  },
  set isStarted(val) {
    isStarted = val;
  },
  set isStay(val) {
    isStay = val;
  },
  set isSwitching(val) {
    isSwitching = val;
  },
  set isSplit(val) {
    isSplit = val;
  },
  set isDoubledown(val) {
    isDoubledown = val;
  },
  set dealerCards(val) {
    dealerCards = val;
  },
  set playerCards(val) {
    playerCards = val;
  },
  set shownDealerCards(val) {
    shownDealerCards = val;
  },
  set stateText(val) {
    stateText = val;
  },
  set secondHand(val) {
    secondHand = val;
  },
  set firstHand(val) {
    firstHand = val;
  },
  set isSecondHand(val) {
    isSecondHand = val;
  },
  set splitGames(val) {
    splitGames = val;
  },
  set isTakeDisabled(val) {
    isTakeDisabled = val;
  },
  set isBankrupt(val) {
    isBankrupt = val;
  },
  set hasRoundStarted(val) {
    hasRoundStarted = val;
  },
};
