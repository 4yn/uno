function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
};

function renderCard(card){
	return  '<div class="card ' + card.colorName() + '"><div class="card-label">'+ card.number.toString() +'</div></div>'
}

class Card {
	constructor(number,color){
		this.number = number
		this.color = color
	}
	colorName(){
		switch(this.color){
			case 1: return "card-red"
			case 2: return "card-yellow"
			case 3: return "card-blue"
			case 4: return "card-green"
			case 5: return "card-info"
		}
	}
};

class Deck{
	constructor(deck_id){
		this.selector = deck_id
		this.cards = []
		for(var i=1;i<=12;i++){
			for(var j=1;j<=4;j++){
				this.cards.push(new Card(i,j));
				this.cards.push(new Card(i,j));
			}
		}
		for(var i=1;i<=4;i++){
			this.cards.push(new Card(5,1));
		}
		this.cards = shuffleArray(this.cards);
	}
	update(){
		$(this.selector).html(this.cards.length.toString());
	}
	draw(){
		return this.cards.pop();
	}
};

class Pile{
	constructor(){
		this.cards = [];
	}
}

class Player{
	constructor(hand_ul_id){
		this.selector = hand_ul_id
		this.hand = []
	}
	update(){
		$(this.selector).empty();
		for(var i=0;i<this.hand.length;i++){
			$(this.selector).append(renderCard(this.hand[i]));
		}
	}
	recv(card){
		this.hand.push(card);
	}
};

class Game{
	constructor(){
		this.deck = new Deck("#card-count");
		this.p1 = new Player("#player-1-hand");
		this.p2 = new Player("#player-2-hand");
		// Deal Cards
		for(var i=1;i<=50;i++){
			this.p1.recv(this.deck.draw());
			this.p2.recv(this.deck.draw());
		}
		this.p1.update()
		this.p2.update()
		this.deck.update()
	}
};

function uno_log(log_string){
	$("#console").prepend("<li>" + log_string + "</li>");
};

function uno_log_clear(){
	$("ul").empty();
};

$(document).ready(function() {
    g = new Game
});