function randomNumber(maximum){
	return Math.floor(Math.random() * (maximum + 1));
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = randomNumber(i);
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
};

class Card {
	constructor(number,color){
		this.number = number;
		this.color = color;
	}
	colorName(){
		switch(this.color){
			case 1: return "card-red";
			case 2: return "card-yellow";
			case 3: return "card-blue";
			case 4: return "card-green";
			case 5: return "card-info";
		}
	}
	cardName(){
		switch(this.number){
			case 10: return "SK";
			case 11: return "D2";
			case 12: return "RV";
			case 13: return "WI";
			case 14: return "W4";
		}
		return this.number.toString();
	}
	render(mode = 0){
		if(mode==0){
			return  '<div class="card ' + this.colorName() + '"><div class="card-label">'+ this.cardName() +'</div></div>'
		} else {
			return  '<div class="card ' + this.colorName() + '"><div class="card-label">'+ this.number.toString() +'</div></div>'
		}
	}
};

class Deck{
	constructor(){
		this.selector = "#deck"
		this.cards = []
		for(var i=1;i<=4;i++){
			this.cards.push(new Card(0,i));
			for(var j=1;j<=12;j++){
				this.cards.push(new Card(j,i));
				this.cards.push(new Card(j,i));
			}
			this.cards.push(new Card(13,5));
			this.cards.push(new Card(14,5));
		}
		this.cards = shuffleArray(this.cards);
	}
	update(){
		// $(this.selector).html(this.cards.length.toString());
		$(this.selector).html('<h2>Deck:</h2>' + new Card(this.cards.length.toString(),5).render(1));
	}
	draw(){
		return this.cards.pop();
	}
};

class Pile{
	constructor(){
		this.selector = "#pile";
		this.cards = [];
	}
	play(card){
		this.top = card;
		this.cards.push(card);
		$(this.selector).prepend(card.render());
	}
}

class Player{
	constructor(player_id){
		this.id = player_id;
		this.hand = [];
		var div_string = '<div class="col-xs-2 player-label" id="player-playerid-label"><div class="player-name">Pplayerid</div></div><div class="col-xs-10 player-hand"><ul class="hand" id="player-playerid-hand"></ul></div>'
		$("#game-stage").append(div_string.replace(/playerid/g,player_id.toString()));
		this.label_selector = "#player-" + this.id.toString() + "-label";
		this.hand_selector = "#player-" + this.id.toString() + "-hand";
	}
	focus(){
		$(this.label_selector).css({
			"border-right" : "15px solid white",
			"padding-right" : "0px"
		});
	}
	blur(){
		$(this.label_selector).css({
			"border-right" : "5px dashed #888888",
			"padding-right" : "10px"
		});
	}
	update(){
		$(this.hand_selector).empty();
		for(var i=0;i<this.hand.length;i++){
			$(this.hand_selector).append(this.hand[i].render());
		}
	}
	recv(card){
		this.hand.push(card);
	}
};

class Game{
	constructor(num_players,debug_log){
		this.players = [];
		this.num_players = num_players;
		// Restart UI
		this.deck = new Deck();
		this.pile = new Pile();
		debug_log.log("Creating game for " + num_players.toString() + " players")
		$("#game-stage").empty();
		for(var i=1;i<=num_players;i++){
			this.players.push(new Player(i))
		}
		// Deal Cards
		debug_log.log("Dealing cards")
		for(var i=0;i<7;i++){
			for(var j=0;j<this.num_players;j++)
			this.players[j].recv(this.deck.draw());
		}
		for(var i=0;i<num_players;i++){
			this.players[i].update();
			this.players[i].blur();
		}
		do {
			this.pile.play(this.deck.draw());
		} while (this.pile.top.number >= 10)
		this.deck.update();
		// Set Game Variables
		this.current_player = randomNumber(num_players-1);
		this.game_direction = randomNumber(1);
		this.players[this.current_player].focus();
	}
};

class DebugLog{
	constructor(log_id){
		this.selector = log_id;
	}
	log(log_string){
		$(this.selector).prepend("<li>" + log_string + "</li>");
	}
	clear(){
		$(this.selector).empty();
	}
}

$(document).ready(function() {
	debug = new DebugLog("#console");
    g = new Game(2,debug)
});