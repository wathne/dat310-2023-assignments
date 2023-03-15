const imageLetters = ["A", "B", "C", "D", "E","F","G","H"];

class Card{
    constructor(img){
        this.img_id = img;
        this.img = "images/" + img + ".png";
    }
}

function mixedCards(){
    let cards = [];
    for (let i = 0; i< imageLetters.length; i++){
        cards.push(new Card(imageLetters[i]));
        cards.push(new Card(imageLetters[i]));
    }
    // mix cards, e.g.
    // - repeatedly take a random card from cards
    // - add it to a new array mixedCards
    // - remove it from cards
    return cards;
}

const boardC = {
    template: `
    <div class="cardboard" style="width: 400px;">
        <div class="outer" v-for="card in cards">
            <div class="card front">
                <img v-bind:src="card.img">
            </div>
            <div class="card back"></div>
        </div>
    </div>
    `,
    data: function() {
        // need logic here fore flipping cards, 
        // finding matched cards,
        // removing cards if they are matched,
        // flip them back if they are not matching.
        return {
            cards: mixedCards(),
        };
    }
}