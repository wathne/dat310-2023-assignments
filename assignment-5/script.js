"use strict";

/* I began to look into RXJS about three weeks ago. This is an attempt at using
 * RXJS Observables without using Subject multicast or the tap operator.
 * The Observables should be pure and cause no side effects. Only subscriptions
 * are allowed to mutate anything. */

// TODO: Use animationFrameScheduler? (https://rxjs.dev/guide/scheduler)
// TODO: Restore 18 degrees flip on hover.
// TODO: Fix range and button width.
// TODO: Scale labels wrt. n or fit to div.

/* Import RXJS.
 * https://rxjs.dev/api
 * https://rxjs.dev/api/operators
 * https://rxjs.dev/api/ajax
 * https://rxjs.dev/api/fetch
 * https://rxjs.dev/api/webSocket
 * https://rxjs.dev/api/testing
 */
const {
  from,
  fromEvent,
  NEVER,
} = rxjs;
const {
  bufferCount,
  concatAll,
  map,
  mergeMap,
  scan,
  startWith,
} = rxjs.operators;


// Declare and assign HTML elements.
const buttonNewGameElement = document.getElementById("button-new-game");
const divGameBoardElement = document.getElementById("game-board");
const divTurnHeaderElement = document.getElementById("turn-header");
const rangeNewGameElement = document.getElementById("range-new-game");
const spanPlayer1ScoreCountElement = document.getElementById("player-1-score-count");
const spanPlayer1FlipsCountElement = document.getElementById("player-1-flips-count");
const spanPlayer2ScoreCountElement = document.getElementById("player-2-score-count");
const spanPlayer2FlipsCountElement = document.getElementById("player-2-flips-count");
const spanTurnHeaderPlayerElement = document.getElementById("turn-header-player");


/* An array for the latest game cards. Sorted in pairwise order. Each card
 * element is also wrapped in an array and will include additional game data.
 * extendedCard: [
 *   divGameCardElement,
 *   label,
 *   hidden,
 *   index,
 *   gameID,
 *   n,
 * ]. */
const extendedCards = [];


// An array for the subscriptions being handled in subscriptionHandler.
const subscriptionStack = [];


/* -- To shuffle an array a of n elements (indices 0..n-1):
 * for i from n−1 downto 1 do
 *      j ← random integer such that 0 ≤ j ≤ i
 *      exchange a[j] and a[i]
 * 
 * Source:
 * https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
*/
// Durstenfeld shuffle algorithm. Source: The internet.
const shuffle = (a) => {
  // "for i from n−1 downto 1 do"
  for (let i = a.length - 1; i > 0; i--) {
    // "j ← random integer such that 0 ≤ j ≤ i"
    const j = Math.floor(Math.random() * (i + 1));
    // "exchange a[j] and a[i]"
    [a[i], a[j]] = [a[j], a[i]];
  }
}


const restoreTurnHeader = () => {
  while (divTurnHeaderElement.firstChild) {
    divTurnHeaderElement.removeChild(divTurnHeaderElement.firstChild);
  }
  divTurnHeaderElement.textContent = "your turn, player ";
  spanTurnHeaderPlayerElement.textContent = "1";
  divTurnHeaderElement.appendChild(spanTurnHeaderPlayerElement);
};


/* This function has no parameters and will check the range slider value and
 * then always return a valid n. */
const nChecked = () => {
  const nDefault = 4; // n will default to this integer if the check fails.
  const nSet = new Set([4, 6, 8, 10, 12, 14]); // n ∈ {4,6,8,10,12,14}.
  try {
    // Get n from the range slider value.
    const n = parseInt(rangeNewGameElement.value);
    if (typeof n !== "undefined" &&
        Number.isInteger(n) &&
        nSet.has(n)) {
      return n;
    }
  } catch (error) {
    console.error(error);
  }
  console.log(`n must be an integer: ${Array.from(nSet.values())}`);
  console.log(`By default: n = ${nDefault}`);
  return nDefault;
};


// This function has one parameter, n, and will set the button text.
const setButtonNewGameText = (n) => {
  buttonNewGameElement.textContent = `start new game (${n}x${n})`;
};


// Do an initial update of the button text.
setButtonNewGameText(nChecked());


// This is an Observable for the range slider input events.
const rangeNewGameInput$ = fromEvent(rangeNewGameElement, "input");


// This is an Observable for the button click events.
const buttonNewGameClick$ = fromEvent(buttonNewGameElement, "click");


// Update the button text when triggered by range slider input events.
rangeNewGameInput$.subscribe({
  next: (inputEvent) => setButtonNewGameText(nChecked()),
  error: (err) => console.error(err),
  undefined,
});


/* An Observable that will sequentially push ordered card pairs from the latest
 * rebuild (mutation) of the game board. */
const pair$ = from(extendedCards).pipe(
  bufferCount(2,2),
);


/* The concatAll operator will cancel out the upstream bufferCount(2,2) 
 * operator. I could remove both of these operators. They will be kept here for
 * future reference. These operators are remnants from an earlier attempt at
 * making this game work without having to use the scan (state) operator. */
const card$ = pair$.pipe(
  concatAll(),
);


/* An Observable for clicked cards. Note that each click event is mapped to an
 * extended version of the card element instead of just clickEvent.target.
 * extendedCard: [
 *   divGameCardElement,
 *   label,
 *   hidden,
 *   index,
 *   gameID,
 *   n,
 * ]. */
const clickedCard$ = card$.pipe(
  mergeMap((extendedCard) => fromEvent(extendedCard[0], "click").pipe(
    map((clickEvent) => extendedCard),
  )),
);


/* An Observable for the accumulated state of the game.
 * The scan operator is like a feedback loop which will emit its own accumulated
 * state for each value emitted from the source Observable.
 * accumulatedState: [
 *   gameID,
 *   n,
 *   player,
 *   [flips1, flips2],
 *   [score1, score2],
 *   [firstCard, secondCard],
 * ],
 * initial seed: [
 *   null,
 *   null,
 *   null,
 *   [0, 0],
 *   [0, 0],
 *   [],
 * ]. */
const state$ = clickedCard$.pipe(
  scan((accumulatedState, clickedCard) => {
    const accGameID = accumulatedState[0];
    const accN = accumulatedState[1];
    const accPlayer = accumulatedState[2];
    const accFlips = accumulatedState[3];
    const accScore = accumulatedState[4];
    const accCards = accumulatedState[5];

    const currGameID = clickedCard[4];
    const currN = clickedCard[5];

    /* Check if we have started a new game. This check is necessary because the
     * accumulated state is persistent and will survive switchMap operators and
     * resubscriptions. This check will effectively clear the scan operator
     * after a resubscription. Maybe this persistence is reasonable, but it is
     * not obvious from reading the documentation. I had to rework lots of code
     * before I figured out where this problem originated. */
    if (currGameID !== accGameID) {
      return [currGameID, currN, 1, [1, 0], [0, 0], [clickedCard]];
    }

    // If the accCards array is full.
    if (accCards.length === 2) {
      // Clear the accCards array.
      accCards.pop();
      accCards.pop();
    }

    // If we clicked a hidden card.
    if (clickedCard[2]) {
      return [currGameID, currN, accPlayer, accFlips, accScore, accCards];
    }

    // If we have no accumulated cards.
    if (!accCards.length) {
      // Set player flips++. The " - 1" is for the index offset.
      accFlips[accPlayer - 1]++;
      // Accumulate the clicked card.
      accCards.push(clickedCard);
      return [currGameID, currN, accPlayer, accFlips, accScore, accCards];
    }

    /* If we got this far, we can presume that we have an accumulated card and a
     * clicked card. */

    // If we clicked exactly the same card.
    if (clickedCard === accCards[0]) {
      return [currGameID, currN, accPlayer, accFlips, accScore, accCards];
    }

    // Set player flips++. The " - 1" is for the index offset.
    accFlips[accPlayer - 1]++;
    // Accumulate the clicked card.
    accCards.push(clickedCard);

    // Get the card labels.
    const label1 = accCards[0][1];
    const label2 = accCards[1][1];
    // If the cards do not make a matching pair.
    if (label1 !== label2) {
      // Toggle players for the next turn.
      if (accPlayer === 1) {
        // Start the next turn as player 2.
        return [currGameID, currN, 2, accFlips, accScore, accCards];
      }
      if (accPlayer === 2) {
        // Start the next turn as player 1.
        return [currGameID, currN, 1, accFlips, accScore, accCards];
      }
    }

    // If we got this far, we can presume that we made a matching pair of cards.
    // Mark the cards as hidden.
    accCards[0][2] = true;
    accCards[1][2] = true;
    // Set player score++. The " - 1" is for the index offset.
    accScore[accPlayer - 1]++;
    // Start the next turn as the same player.
    return [currGameID, currN, accPlayer, accFlips, accScore, accCards];
  }, [
    null,
    null,
    null,
    [0, 0],
    [0, 0],
    [],
  ]),
);


/* This is an Observer, as in "observable.subscribe(observer);".
 * Primarily, this Observer will restore the user interface and rebuild (mutate)
 * the game board with new game cards. */
const mutateGame = {
  next: (n) => {
    // Hide the game board.
    if (!divGameBoardElement.classList.contains("visibility-hidden")) {
      divGameBoardElement.classList.add("visibility-hidden");
    }

    // Clear the game board.
    while (divGameBoardElement.firstChild) {
      divGameBoardElement.removeChild(divGameBoardElement.firstChild);
    }

    /* Get the previous gameID from a card in the extendedCards array and
     * increment it by 1. */
    let gameID;
    if (extendedCards.length) {
      gameID = extendedCards.pop()[4] + 1;
    } else {
      gameID = 1;
    }

    // Clear the extendedCards array.
    while (extendedCards.length) {
      extendedCards.pop();
    }

    // Initialize an array for the new game card elements.
    const divGameCardElements = [];

    // Set the grid-template-columns property to n-by-n.
    divGameBoardElement.style.gridTemplateColumns = `repeat(${n}, 1fr)`;

    // Restore the user interface.
    restoreTurnHeader();
    spanPlayer1FlipsCountElement.textContent = "0";
    spanPlayer2FlipsCountElement.textContent = "0";
    spanPlayer1ScoreCountElement.textContent = "0";
    spanPlayer2ScoreCountElement.textContent = "0";

    // Create n*n cards and push them to the divGameCardElements array.
    for (let i = 0; i < n*n; i++) {
      const card = document.createElement("div");
      card.className = "game-card";
      const cardInner = document.createElement("div");
      cardInner.className = "game-card-inner";
      const cardFront = document.createElement("div");
      cardFront.className = "game-card-front";
      const cardBack = document.createElement("div");
      cardBack.className = "game-card-back";
      const cardLabel = document.createElement("div");
      cardLabel.className = "game-card-label";

      card.appendChild(cardInner);
      cardInner.appendChild(cardFront);
      cardInner.appendChild(cardBack);
      cardFront.appendChild(cardLabel);

      // For creating adjacent pairs, [1,1,2,2,3,3,4,4,...].
      cardLabel.textContent = `${Math.floor(1 + i/2)}`;

      divGameCardElements.push(card);
    }

    // Create a new shallow copy of the divGameCardElements array.
    // The divGameCardElements array is not shuffled.
    const shuffledElements = [];
    for (const element of divGameCardElements) {
      shuffledElements.push(element);
    }

    // Shuffle the new shallow copy of the divGameCardElements array.
    shuffle(shuffledElements);

    // Sequentially install all the shuffled cards onto the game board.
    for (const element of shuffledElements) {
      divGameBoardElement.appendChild(element);
    }

    /* Sequentially push all card elements in pairwise order to the
     * extendedCards array. Each card element is also wrapped in an array and
     * will include additional game data.
     * extendedCard: [
     *   divGameCardElement,
     *   label,
     *   hidden,
     *   index,
     *   gameID,
     *   n,
     * ]. */
    for (const [index, element] of divGameCardElements.entries()) {
      // For creating adjacent pairs, [1,1,2,2,3,3,4,4,...].
      const label = Math.floor(1 + index/2);
      extendedCards.push([element, label, false, index, gameID, n]);
    }

    // Show the rebuilt game board.
    if (divGameBoardElement.classList.contains("visibility-hidden")) {
      divGameBoardElement.classList.remove("visibility-hidden");
    }
  },
  error: (err) => console.error(err),
  undefined,
};


/* This is an Observer, as in "observable.subscribe(observer);".
 * When subscribed to the state$ Observable, this Observer will update the user
 * interface and animate the cards. */
const mutateUI = {
  next: (accumulatedState) => {
    const accGameID = accumulatedState[0];
    const accN = accumulatedState[1];
    const accPlayer = accumulatedState[2];
    const accFlips = accumulatedState[3];
    const accScore = accumulatedState[4];
    const accCards = accumulatedState[5];

    // If a card is marked as hidden, then hide the card after 1 second.
    for (const card of accCards) {
      if (card[2]) {
        setTimeout((c) => c.classList.add("visibility-hidden"), 1000, card[0]);
      }
    }

    // If the accCards array is full.
    if (accCards.length === 2) {
      // Flip the second card. (The first card was flipped previously.)
      accCards[1][0].firstElementChild.style.transition = "transform 0.5s";
      accCards[1][0].firstElementChild.style.transform = "rotateY(180deg)";

      // Undo both card flips after 1 second.
      setTimeout(
        (c1, c2) => {
          c1.style.transition = "transform 0.5s";
          c1.style.transform = "rotateY(0deg)";
          c2.style.transition = "transform 0.5s";
          c2.style.transform = "rotateY(0deg)";
        },
        1000,
        accCards[0][0].firstElementChild,
        accCards[1][0].firstElementChild,
      );
    }

    // Flip the first card.
    accCards[0][0].firstElementChild.style.transition = "transform 0.5s";
    accCards[0][0].firstElementChild.style.transform = "rotateY(180deg)";

    // Update the user interface.
    spanTurnHeaderPlayerElement.textContent = accPlayer.toString();
    spanPlayer1FlipsCountElement.textContent = accFlips[0].toString();
    spanPlayer2FlipsCountElement.textContent = accFlips[1].toString();
    spanPlayer1ScoreCountElement.textContent = accScore[0].toString();
    spanPlayer2ScoreCountElement.textContent = accScore[1].toString();

    // If all the cards are necessarily exhausted, then show the winner.
    if (accScore[0] + accScore[1] === accN * accN / 2) {
      if (accScore[0] === accScore[1]) {
        divTurnHeaderElement.textContent = "draw";
      }
      if (accScore[0] > accScore[1]) {
        divTurnHeaderElement.textContent = "player 1, a winner is you";
      }
      if (accScore[0] < accScore[1]) {
        divTurnHeaderElement.textContent = "player 2, a winner is you";
      }
    }
  },
  error: (err) => console.error(err),
  undefined,
};


const subscriptionHandler = {
  next: (clickEvent) => {
    // Unsubscribe from all previous subscriptions.
    while (subscriptionStack.length) {
      subscriptionStack.pop().unsubscribe();
    }

    /* The NEVER Observable will never complete. We need to manually close the
     * subscription. This non-completion can be useful. */
    const newGameSubscription = NEVER.pipe(
      startWith(nChecked()),
    ).subscribe(mutateGame);
    subscriptionStack.push(newGameSubscription);

    const stateSubscription = state$.subscribe(mutateUI);
    subscriptionStack.push(stateSubscription);
  },
  error: (err) => console.error(err),
  undefined,
};

buttonNewGameClick$.subscribe(subscriptionHandler);

