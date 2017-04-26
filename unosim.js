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
			case 5: return "card-wild";
			case 6: return "card-utility";
		}
	}
	colorHumanName(){
		switch(this.color){
			case 1: return "red";
			case 2: return "yellow";
			case 3: return "blue";
			case 4: return "green";
			case 5: return "wild";
			case 6: return "utility";
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
	cardScore(){
		switch(this.number){
			case 10: return 20;
			case 11: return 20;
			case 12: return 20;
			case 13: return 50;
			case 14: return 50;
			case 15: return 0;
		}
		return this.number;
	}
	cardHumanName(){
		return this.colorHumanName() + " " + this.cardName();
	}
	compareValue(){
		if(this.color==6) return 0;
		return this.color * 20 + this.number;
	}
	render(mode = 0){
		if(mode==0){
			return  '<li class="card ' + this.colorName() + '"><div class="card-label">'+ this.cardName() +'</div></li>'
		} else {
			return  '<li class="card ' + this.colorName() + '"><div class="card-label">'+ this.number.toString() +'</div></li>'
		}
	}
	match(other){
		if(this.color==5) return false;
		if(this.number>=13) return true;
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
		$(this.selector).html('<h2>Deck:</h2>' + new Card(this.cards.length.toString(),6).render(1));
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
		this.clear();
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
		if(this.top!=null){
			$(this.selector).prepend(this.top.render());
		}
	}
}

class Player{
	constructor(player_id,ai = null){
		this.id = player_id;
		this.hand = [];
		this.score = 0;
		var div_string = '<div class="col-xs-2 player-label" id="player-{playerid}-label"><div class="player-name">P{playerid}</div></br><div class="player-score" id="player-{playerid}-score"></div></div><div class="col-xs-10 player-hand"><ul class="hand" id="player-{playerid}-hand"></ul></div>'
		$("#game-stage").append(div_string.replace(/{playerid}/g,player_id.toString()));

		this.label_selector = "#player-" + this.id.toString() + "-label";
		this.hand_selector = "#player-" + this.id.toString() + "-hand";
		this.score_selector = "#player-" + this.id.toString() + "-score";

		// set command mode
		if(ai==null){
			this.ai = "humanInput";
		} else {
			this.ai = ai;
		}

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
	win(){
		$(this.label_selector).addClass("player-win");
	}
	updateScore(){
		$(this.score_selector).html(this.score.toString());
	}
	recv(card){
		this.hand.push(card);
		this.score += card.cardScore();
		$(card.render()).hide().appendTo(this.hand_selector).slideDown("fast");
		this.updateScore();
	}
	send(index){
		$(this.hand_selector + " li").eq(index).remove();
		var played_card = this.hand[index];
		this.hand.splice(index,1)
		this.score -= played_card.cardScore();
		this.updateScore();
		return played_card;
	}
	getHand(){
		var copyHand = [];
		for(var i=0;i<this.hand.length;i++){
			var k = new Card(this.hand[i].number,this.hand[i].color);
			copyHand.push(k);
		}
		return copyHand;
	}
	setBinds(callback,top_card){
		var selector = this.hand_selector + " li"
		var hand = this.hand
		var is_active = this.active

		if(this.ai=="humanInput"){
			$(selector).click(function(e){
				if(is_active){
					$(selector).unbind();
					var idx = $(this).index();
					if(hand[idx].color==5){
						var c = 1;
						var x = e.pageX - $(this).offset().left;
						var y = e.pageY - $(this).offset().top;
						if(x > $(this).width() / 2){
							c += 1;
						}
						if(y > $(this).height() * 7 / 10){
							c += 2;
						}else if(y  > $(this).height() * 3 / 10){
							c = 5;
						}
						hand[idx].color = c;
					}
					setTimeout(callback(idx),0);
				}
	    	});
		} else {
			// set binds for ai
			var toPlay = this.ai(this.getHand(),top_card);
			if(toPlay[0][toPlay[1]].number==13 || toPlay[0][toPlay[1]].number==14){
				this.hand[toPlay[1]].color = toPlay[0][toPlay[1]].color;
			}
			setTimeout(callback(toPlay[1]),0);
		}
	}
};

class Game{
	constructor(player_spec,callback){
		this.callback = callback;
		this.players = [];
		this.num_players = player_spec.length;

		// Restart UI
		this.deck = new Deck();
		this.pile = new Pile();
		$("#game-stage").empty();
		for(var i=1;i<=this.num_players;i++){
			this.players.push(new Player(i,player_spec[i-1]["ai"]));
		}

		// Set Game Variables
		this.current_player = randomNumber(this.num_players-1);
		this.game_direction = randomNumber(1);
		if(this.game_direction==0){ this.game_direction = -1}
		this.players[this.current_player].focus();

		// Deal Cards
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
			if(player.hand[index].match(game.pile.top)){
				if(index==0){
					// Draw Card
					game.draw();
					game.deck.update();
				} else {
					// Play Card
					game.pile.play(player.send(index));
					if(player.hand.length==1){
						setTimeout(function(){game.endGame()},window.sim_delay);
						return 0;
					}
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
			setTimeout(function(){game.procTurn()},window.sim_delay);
		},game.pile.top);
	}
	endGame(){
		// TODO: tabulate scores
		this.players[this.current_player].blur();
		this.players[this.current_player].win();

		var scoreTable = [];
		for(var i=0;i<this.num_players;i++){
			scoreTable.push(this.players[i].score);
		}
		this.callback(scoreTable);
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

class Simulation{
	constructor(player_spec,hp,max_number_sims){
		this.players = [];
		this.player_spec = player_spec;
		this.sim_left = max_number_sims;
		this.cur_game = null;
		for(var i=0;i<this.player_spec.length;i++){
			this.players.push({
				"hp": hp,
				"wins": 0
			})
		}
		this.startSim();
	}
	startSim(){
		if(this.sim_left==0) return;
		this.sim_left = this.sim_left-1;
		var simulation = this;
		this.cur_game = new Game(simulation.player_spec,function(s){
			simulation.endSim(s);
		});
	}
	endSim(scoreTable){
		// set scores
		for(var i=0;i<this.players.length;i++){
			this.players[i]["hp"] = Math.max(this.players[i]["hp"] - scoreTable[i],0);
			if(scoreTable[i]==0){
				this.players[i]["wins"]++;
			}
			if(this.players[i]["hp"]==0){
				this.sim_left==0;
			}
		}
		// check if anybody is dead
		window.debug.log(JSON.stringify(this.players))
		if(this.sim_left==0){
			// end sim
			$('#btn-start-sim').prop('disabled', false);
		} else {
			var simulation = this;
			setTimeout(function(){simulation.startSim()},window.sim_restart_delay);
		}
	}
}

/* INSERT YOUR AI CODE HERE */

function greedyPlayer(my_cards,top_card){
	var to_play = 0;
	for(var i=1;i<my_cards.length;i++){
		if(my_cards[i].match(top_card) || my_cards[i].color==5){
			to_play = i;
			if(my_cards[i].color == 5){
				my_cards[i].color = 1;
			}
			break;
		}
	}
	// window.debug.log("Greedy plays " + my_cards[to_play].cardHumanName());
	return [my_cards,to_play];
}

function randomPlayer(my_cards,top_card){
	var to_play = 0;
	var possible_cards = [];
	for(var i=1;i<my_cards.length;i++){
		if(my_cards[i].match(top_card) || my_cards[i].color==5){
			possible_cards.push(i);
			if(my_cards[i].color == 5){
				my_cards[i].color = randomNumber(3)+1;
			}
		}
	}
	if(possible_cards.length==0){
		to_play = 0;
	} else {
		to_play = possible_cards[randomNumber(possible_cards.length-1)];
	}
	// window.debug.log("Random plays " + my_cards[to_play].cardHumanName());
	return [my_cards,to_play];
}

/* GAME CODE BEGINS HERE */

let s;

function restartSim(){
	window.debug.clear();
	$('#btn-start-sim').prop('disabled', true);

	var loops = $('#input-num-sims').val();
	var maxhp = $('#input-hp').val();
	console.log(loops);
	console.log(maxhp);
	s = new Simulation(
    	[
    		{"name":"P1","ai":greedyPlayer},
    		{"name":"P2","ai":greedyPlayer},
    		{"name":"P3","ai":randomPlayer},
    		{"name":"P4","ai":randomPlayer}
    	],
    	maxhp,loops);
}

$(document).ready(function() {
	debug = new DebugLog("#console");
	window.sim_delay=0;
	window.sim_restart_delay=200;
	window.debug = debug;
   /* g = new Game(
    	[
    		{"name":"P1","ai":greedyPlayer},
    		{"name":"P2","ai":greedyPlayer},
    		{"name":"P3","ai":randomPlayer},
    		{"name":"P4","ai":randomPlayer}
    	]
    	);*/
});