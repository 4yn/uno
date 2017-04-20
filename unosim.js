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
			case 6: return "card-utility";
		}
	}
	cardName(){
		switch(this.number){
			case 10: return "SK";
			case 11: return "D2";
			case 12: return "RV";
			case 13: return "WI";
			case 14: return "W4";
			case 15: return "+";
		}
		return this.number.toString();
	}
	render(mode = 0){
		if(mode==0){
			return  '<li class="card ' + this.colorName() + '"><div class="card-label">'+ this.cardName() +'</div></li>'
		} else {
			return  '<li class="card ' + this.colorName() + '"><div class="card-label">'+ this.number.toString() +'</div></li>'
		}
	}
	match(other){
		if(this.color==5) return true;
		if(this.color==6) return true;
		if(this.color==other.color) return true;
		if(this.number==other.number) return true;
		return false;
	}
};

class Deck{
	constructor(){
		this.selector = "#deck";
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
		this.shuffle();
	}
	shuffle(){
		this.cards = shuffleArray(this.cards);
	}
	update(){
		$(this.selector).html('<h2>Deck:</h2>' + new Card(this.cards.length.toString(),5).render(1));
	}
	draw(){
		var card = this.cards.pop();
		if(card.number>=13){
			card.color = 5;
		}
		return card;
	}
};

class Pile{
	constructor(){
		this.selector = "#pile";
		this.cards = [];
		this.top = null;
	}
	play(card){
		if(this.top!=null){this.cards.push(this.top);}
		this.top = card;
		$(this.selector).prepend(card.render());
	}
	recall(){
		return this.cards;
	}
	clear(){
		this.cards = [];
		$(this.selector).empty();
		$(this.selector).prepend(this.top.render());
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
		this.recv(new Card(15,6));
		this.blur();
	}
	focus(){
		this.active = true;
		$(this.label_selector).addClass("player-turn");
		$(this.hand_selector).addClass("player-turn");
	}
	blur(){
		this.active = false;
		$(this.label_selector).removeClass("player-turn");
		$(this.hand_selector).removeClass("player-turn");
	}
	recv(card){
		this.hand.push(card);
		$(card.render()).hide().appendTo(this.hand_selector).slideDown("fast");
	}
	send(index){
		$(this.hand_selector + " li").eq(index).remove();
		var played_card = this.hand[index];
		this.hand.splice(index,1)
		return played_card;
	}
	setBinds(callback){
		var selector = this.hand_selector + " li"
		var is_active = this.active
		$(selector).click(function(e){
			if(is_active){
				$(selector).unbind();
				callback($(this).index());
			}
    	});
	}
};

class Game{
	constructor(num_players,debug_log){
		this.players = [];
		this.num_players = num_players;
		this.debug = debug_log;
		// Restart UI
		this.deck = new Deck();
		this.pile = new Pile();
		this.debug.log("Creating game for " + num_players.toString() + " players")
		$("#game-stage").empty();
		for(var i=1;i<=num_players;i++){
			this.players.push(new Player(i))
		}

		// Set Game Variables
		this.current_player = randomNumber(num_players-1);
		this.game_direction = randomNumber(1);
		if(this.game_direction==0){ this.game_direction = -1}
		this.players[this.current_player].focus();

		// Deal Cards
		
		debug_log.log("Dealing cards")
		for(var i=0;i<7;i++){
			for(var j=0;j<this.num_players;j++){
				this.nextPlayer();
				this.draw();
			}
		}

		// Set first card in pile
		do {
			this.pile.play(this.deck.draw());
		} while (this.pile.top.number >= 10);
		
		this.deck.update();
		this.procTurn(this.current_player);
	}
	nextPlayer(){
		this.players[this.current_player].blur();
		this.current_player = (this.current_player + this.game_direction + this.num_players*2) % this.num_players;
		this.players[this.current_player].focus();
		return this.current_player;
	}
	draw(){
		// this.debug.log("Dealing to player " + this.current_player.toString() );
		this.players[this.current_player].recv(this.deck.draw());
		if(this.deck.cards.length==0){
			this.deck.cards = [];
			this.deck.cards = this.pile.recall();
			this.pile.clear();
			this.deck.shuffle();
		}
	}
	procTurn(){
		var game = this;
		var player = this.players[this.current_player];
		player.setBinds(function(index){
			console.log(index);
			if(player.hand[index].match(game.pile.top)){
				if(index==0){
					// Draw Car
					game.draw()
					game.deck.update();
				} else {
					// Play Card
					game.pile.play(player.send(index));
					if(game.pile.top.number==10){
						game.nextPlayer();
					}else if(game.pile.top.number==11){
						game.nextPlayer();
						game.draw();
						game.draw();
					}else if(game.pile.top.number==12){
						game.game_direction *= -1;
					}else if(game.pile.top.number==14){
						game.nextPlayer();
						game.draw();
						game.draw();
						game.draw();
						game.draw();
					}
				}
				game.nextPlayer();
			}
			game.procTurn();
		});
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
    g = new Game(4,debug)
});