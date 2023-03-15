# Assignment 5 - Vue, eller mer JS

The task is to implement a classic memory game. You are free to solve this task with, or without Vue.

  -	The board is n-by-n, where n is your choosing (minimum 4).
  -	The deck contains unique pairs of cards (for a board of `n*n`, we need `n*n/2` pairs of cards). You can select the "theme" (e.g., places, cars, logos, etc.).
  - Rules of the game:
    *	Cards are laid out in a grid face down.
    * Two players take turns.
    * Player flips a pair of cards over. If the cards match, they disappear, the player scores one point, and gets a bonus turn.
    *	The game is over when all matches are found.
  - Card grid should be randomized for each game.
  -	Use some animation or effect for flipping the cards. 
    Check out [CSS transition](https://www.w3schools.com/css/css3_transitions.asp), [CSS 2D transform](https://www.w3schools.com/css/css3_2dtransforms.asp),
    [CSS 3D transform](https://www.w3schools.com/css/css3_3dtransforms.asp).
  - Count and show on the screen the total number of flips and each players score
  - Show in the end which player won.
  - Allow to start a new game after finishing, without refreshing the page.
  - Allow the player to see both cards before they are flipped back or removed.

### Tip:
You can write a function which is run every time the user tries to flip a card:
1. When first card is clicked, flip it and remember what image it has.
2. When second card is clicked, flip it and remember what image it has.
3. When third card is clicked, do not flip it. Instead compare the two previous card and remove them or flip them back.

Alternatively, you can do part 3. upon timeout, 1sec after the second card is flipped.

The `samples/` folder contains some example screenshots. Note that the appearance is left to you, it doesn’t have to look the same. 

### Help
The folder `/start` contains some HTML and CSS files to get you started.
- You can flip cards by adding the class `flipped` to the `<div class="outer">` surrounding a card.
- You can hide cards by adding the class `removed` to the `<div class="outer">` surrounding a card.
- Remember that you need to randomize the images.  
- You are free to change the layout or images.


The folder `/start-vue` contains similar HTML and CSS but is is already distributed over multipe Vue components.
You ccan use this as a start point for using Vue, but you can also create your own Vue app. 

# Øving 5 - Vuejs

Oppgaven er å implementere et klassisk memory-spill. Den kan implementeres enten med eller uten Vue.

  -	Brettet er `n*n`, der du velger n (minimum 4).
  -	Brettet inneholder unike par med kort (på et brett som er `n*n` trenger vi `n*n/2` kortpar). Du kan velge _theme_ (type bilder på kortene, f.eks. steder, biler, logoer etc.).
  - Spillereglene:
    *	Kortene legges ut i et rutenett med bildet ned.
    * To spillere bytter på å spille.
    * Spilleren snur to kort i sin tur. Hvis kortene er like forsvinner de, spilleren får et poeng og får snu to kort til.
    * Spillet er over når alle parene er funnet.
  - Kortene (bildene) skal være tilfeldig fordelt hver gang.
  -	Bruk animasjon eller en effekt for å snu kortene. Sjekk [CSS transition](https://www.w3schools.com/css/css3_transitions.asp), [CSS 2D transform](https://www.w3schools.com/css/css3_2dtransforms.asp),
    [CSS 3D transform](https://www.w3schools.com/css/css3_3dtransforms.asp) og eksemplet under.
  - Tell og vis totalt antall kortpar som har blitt snudd.
  - Vis score for hvert spiller.
  - Vis i slutten hvilken spiller vant.
  - Det skal være mulig å starte spillet om igjen etter det er ferdig. Dette skal funke uten å laste inn siden på nytt.
  - Spillerne må kunne se begge kort, før de er flipped tilbake eller fjernet.

### Tip
Du kan lage en funksjon som kjører hver gang spilleren trykker på et kort:
1. Når det første kortet trykkes, snu kortet og husk bildet.
2. Når det andre kortet trykkes, snu kortet og husk bildet.
3. Når et tredje kort trykkes, sny ikke kortet, men sammenlign de to tidligere kort. Fjern dem eller snu dem tilbake.

Du kan og bruke `setTimeout` for å gjøre del 3 etter 1sec.

I mappen `samples/` ligger noen skjermbilder med eksempler. Merk at du bestemmer selv hvordan applikasjonen ser ut, den må ikke nødvendigvis se ut som i eksemplene.

### Hjelp
Mappen `/start` inneholder noen HTML og CSS filer for å få deg i gang.
- Du kan snu et kort ved å legge til classen `flipped` i `<div class="outer">` som omgir kortet.
- Du kan fjerne et kort ved å legge til classen `removed` i `<div class="outer">` som omgir kortet.
- Husk at du må dele ut kortene tilfeldig.
- Du må gjerne forandre på bildene eller utseende.

Mappen `/start-vue` inneholder liknende HTML og CSS, men den er allerede delt opp i flere Vue componenter. 
Du kan bruke den om du vil bruke Vue, men trenger ikke gjøre det.