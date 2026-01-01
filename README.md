# Blackjack

This is a standard game of blackjack, played aganist a dealer. It was an incredibly fun but challenging project to make, and it is also my first project build with Svelte!

## [Live Preview](https://blackjack-three-rust.vercel.app/)

## Gameplay
The game is played like how someone would play Blackjack aganist a dealer. It's just Blackjack, you know... :)

## Technical Details
I built this project with Svelte, and Svelte is very nice to use. Its built-in animations and transitions made implementing animations very easy! Svelte feels like the natural step-up from vanilla JS, as it is not much different than vanilla JS (as opposed to React, which is very different) and its solutions feel more in line with what web was designed to be like.

For the sound effects, I used the Web Audio API. As the legacy web audio system has some downsides, implementing the API wwas crucial for a better experience. I wrote my own little wrapper for the API, which has a function for playing sounds, and than I implemented that function in the main gameplay, when some events happen.

