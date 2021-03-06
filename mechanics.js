
console.log("Last Updated: August 5, 2016");
var ALPHABET = 'abcdefghijklmnopqrstu';
var MAXCARDS = 12;
var g_cardsDealt = 0;
var g_cardSequence = [];
var g_tilesSelected = [];
var g_cardsOnBoard = new Array(21);
var g_vNum = 0; // Set to 0 when no game in session
var g_gameStart = 0;
var g_timeElapsed = 0;
var startTimer;

function preloadImgs() {
	var images = [];
	var card_strings = load_new_cards(false);
	for (var i=0; i<card_strings.length; i=i+1) {
		var img = new Image();
		img_path = "./cardimgs/"+card_strings[i]+".gif";
		img.src=img_path;
	}
}

function reset_globals() {
	MAXCARDS = 3*checkNumRowsInput();
	g_cardsDealt = 0;
	g_cardSequence;
	g_tilesSelected = [];
	g_cardsOnBoard = new Array(21);
	g_vNum = 0; 
	g_gameStart = 0;
	clearInterval(startTimer);
}

function reset_game() {
	g_timeElapsed = 0;
	for(var i=1; i<=7; i++) {
		$("#row"+i.toString()).css("display","none");
	}
}

function load_new_cards(randomize) {
	var cards = new Array();
	
	// Initialize array to 81 numbers
	for(var n=1; n<=9; n++) {
		cards.push("0"+n.toString());
	}
	for(var n=10; n<=81; n++) {
		cards.push(n.toString());
	}
	if (!randomize) {
		return cards;
	}

	// Shuffle cards
	for(var i=0; i<80; i++) {
		var random = Math.floor(Math.random()*(81-i))+i;
		var tmp = cards[i];
		cards[i] = cards[random];
		cards[random] = tmp;
	}
	return cards;
}

function one_more_row() {
	// Not generalizable
	var newRowID = Math.floor(g_vNum/3)+1;
	$("#row"+newRowID.toString()).css("display", "table-row");
	g_vNum = g_vNum + 3;
}

function isNotSet(cardNos) {
	var error = ['Number','Color','Shape','Fill'];
	var card = new Array(3);
	var mod = new Array(3);
	for(var i=0; i<3; i++) {
		card[i] = parseInt(cardNos[i])-1;
	}

	var count=0;
	while(!(card[0]==0 && card[1]==0 && card[2]==0)) {
		for(var i=0; i<3; i++) {
			mod[i] = card[i]%3;
			card[i] = (card[i]-mod[i])/3;
		}
		if ((mod[0] + mod[1] + mod[2])%3!=0) {
			return error[count];
		}
		count++;
	}
	return false;
}

function isSet(cardNos) {
	error_msg = isNotSet(cardNos);
	if (!error_msg) {
		return true;
	}
	return false;
}

function findAllSets() {
	allSets = [];
	for(var m=0; m<g_vNum; m++) {
		for(var n=m+1; n<g_vNum; n++) {
			for(var p=n+1; p<g_vNum; p++) {
				tileNos=[m,n,p];
				cardNos=[g_cardsOnBoard[m],g_cardsOnBoard[n],g_cardsOnBoard[p]];
				if(isSet(cardNos)){ 
					allSets.push(tileNos);
				}
			}
		}
	}
	return allSets;
}

function doesSetExist() {
	return findAllSets().length>0;
}

function shift_cards_up(tile_list) {
	rowNum = g_vNum/3;
	g_vNum = g_vNum - 3;
	$("#row"+rowNum.toString()).css("display","none");
	var card_list = [];
	for(var i=0; i<3; i++) {
		var index = tile_list.indexOf(intToTile(i+g_vNum));
		if(index == -1) { // Case: Card to fill empty spot
			card_list.push(g_cardsOnBoard[i+g_vNum]);
		}
		else { // Case: Card was selected
			tile_list.splice(index,1);
		}
		g_cardsOnBoard[i+g_vNum]="";
	}

	for(var i=0; i<card_list.length; i++) {
		deal_card_to_tile(card_list[i], tile_list[i]);
	}
	update_HTML();
}

function deal_three_more(tile_list) {
	for(var i=0; i<3; i++) {
		deal_card(tile_list[i]);
	}
	announce("");
	if (g_cardsDealt==81) {
		announce("No more deck");
	}
}

function deal_card(tile) {
	deal_card_to_tile(g_cardSequence[g_cardsDealt], tile);
	g_cardsDealt++;
	update_HTML();
}

function deal_card_to_tile(card, tile) {
	img_path = "url(./cardimgs/"+card+".gif)";
	$("#card_"+tile).css("background-image", img_path);
	g_cardsOnBoard[tileToInt(tile)] = card;
}

function checkNumRowsInput() {
	input = parseInt($("#numRowsInput").val());
	if([1,2,3,4,5,6,7].indexOf(input) == -1) {
		input = 4;
	}
	$("#numRowsInput").val(input);
	return input;
}

function tileToInt(tile) {
	return tile.charCodeAt() - 'a'.charCodeAt();
}

function intToTile(num) {
	return String.fromCharCode(num+'a'.charCodeAt());
}

function end_game() {
	reset_globals();
	announce_perm("Game ended");
	clearInterval(startTimer);
}

function on_V_press() {
	if (g_gameStart == 0) {
		return;
	}
	if(!doesSetExist()) {
		if (g_cardsDealt >= 81 ) {
			end_game();
			return;
		}
		n = g_vNum;
		tile_list = [intToTile(n), intToTile(n+1), intToTile(n+2)];
		one_more_row();
		deal_three_more(tile_list);
		announce("New row added");
	}
	else {
		// Replace later
		announce("A Set exists", 400);
	}
}


function select_tile(tile) {
	if(g_tilesSelected.length<3) {
		index = g_tilesSelected.indexOf(tile);
		if(index != -1) { 
			g_tilesSelected.splice(index,1);
			deselect_animation(tile);
		}
		else {
			g_tilesSelected.push(tile);
			select_animation(tile);
		}
	}
	if(g_tilesSelected.length==3) {
		three_tiles_selected();
	}
}

function select_animation(tile) {
	$("#card_"+tile).addClass("selected_card");
	$("#card_"+tile).removeClass("unselected_card");
	$("#card_"+tile).removeClass("finished_card");
}

function deselect_animation(tile, delay) {
	if (typeof(delay)==='undefined') {
		$("#card_"+tile).removeClass("selected_card");
		$("#card_"+tile).addClass("unselected_card");	
		$("#card_"+tile).removeClass("finished_card");
	}
	else {
		window.setTimeout(function() {
			$("#card_"+tile).addClass("finished_card");
			$("#card_"+tile).removeClass("selected_card");
			$("#card_"+tile).removeClass("unselected_card");
		}, delay);
	}
}

function three_tiles_selected() {
	cardNos = [];
	tiles_copy = g_tilesSelected.concat();
	var delay = 30;
	for(var i=0; i<3; i++) {
		tile = g_tilesSelected[i];
		cardNos.push(g_cardsOnBoard[tileToInt(tile)]);
	}

	var error_msg = isNotSet(cardNos);
	if (!error_msg) {
		if(g_cardsDealt<81 && g_vNum==MAXCARDS) {
			deal_three_more(g_tilesSelected);
			delay=30;
		}
		else {
			shift_cards_up(g_tilesSelected);
			delay=130;
		}
	}
	else {
		announce("Not a Set: "+error_msg, 400)
	}
	for(var i=0; i<3; i++) {
		deselect_animation(tiles_copy[i], delay);
	}
	g_tilesSelected = [];
}

function announce(msg, wait) {
	wait = wait || 400; // Default value
	fadeintime = wait/2;
	fadeouttime = wait*2.5;
	$("#announcement").get(0).innerHTML = msg;
	$("#announcement").fadeIn(fadeintime, function() {
		$(this).delay(wait).fadeOut(fadeouttime, function() {
			$("#announcement").get(0).innerHTML = "";
		});
	});
}

function announce_perm(msg) {
	$("#announcement").get(0).innerHTML = msg;
	$("#announcement").css("display", "inline");
}

function update_HTML() {
	$("#cardsDealt").get(0).innerHTML = g_cardsDealt;
	$("#numSets").get(0).innerHTML = findAllSets().length;
}

function start_new_game() {
	reset_globals();
	reset_game();
	g_gameStart = new Date;
	g_cardSequence = load_new_cards(true);
	$("#startGame").blur();

	announce("New game!");
	for(var i=0; i<MAXCARDS/3; i++) {
		one_more_row();
	}
	startTimer = setInterval(function() {
	    $("#timer").text(Math.floor((new Date - g_gameStart) / 1000));
	}, 1000);

	alphabet = ALPHABET.substring(0,g_vNum).split("");
	for(var i=0; i<alphabet.length; i++) {
		deal_card(alphabet[i]);
	}
}

function get_hint() {
	if (!$("#enableHints").is(":checked")) {
		return;
	}
	if (!g_gameStart) {
		return;
	}
	var numSelected = g_tilesSelected.length;
	allSets = findAllSets();
	if (allSets.length==0) {
		announce("No Sets");
	}
	else if (numSelected==0) {
		rand1 = Math.floor(allSets.length*Math.random());
		rand2 = Math.floor(3*Math.random());
		var tile = intToTile(allSets[rand1][rand2]);
		select_tile(tile);
	}
	else if (numSelected==1) {
		var isContained = false;
		var coord;
		for (var i=0; i<allSets.length; i++) {
			for (var j=0; j<3; j++) {
				if (allSets[i][j]==tileToInt(g_tilesSelected[0])) {
					isContained = true;
					coord = [i,j];
				}
			}
		}
		if (isContained) {
			rand = Math.floor(2*Math.random())+1;
			var tile = intToTile(allSets[coord[0]][(coord[1]+rand)%3]);
			select_tile(tile);
		}
		else {
			select_tile(g_tilesSelected[0]);
		}
	}
	else if (numSelected==2) {
		var card1 = g_cardsOnBoard[tileToInt(g_tilesSelected[0])];  
		var card2 = g_cardsOnBoard[tileToInt(g_tilesSelected[1])];  
		for (var i=0; i<g_vNum; i++) {
			var card3 = g_cardsOnBoard[i];
			if (isSet([card1,card2,card3])) {
				select_tile(intToTile(i));
				return;
			}
		}

		select_tile(intToTile(g_tilesSelected[0]));
		select_tile(intToTile(g_tilesSelected[1]));
	}
}

$(document).ready(function() {
	preloadImgs();

	$("#startGame").click(function() {
		start_new_game();
	});

	$(document).keypress(function(press) {
		tile = String.fromCharCode(press.which).toLowerCase();
		if (ALPHABET.substring(0,g_vNum).indexOf(tile) != -1) {
			select_tile(tile);
		}
		else if(tile=='v') {
			on_V_press();
		}
		else if(tile=='x') {
			get_hint();
		}
		else if (tile=='$') {
			start_new_game();
		}
	});

	$(".setCard").click(function(tileTD) {
		var tile = tileTD.currentTarget.id.split("_")[1];
		select_tile(tile);
	});
	$("#addCards").click(function() {
		on_V_press();
	});
	$("#testButton").click(function() {
		end_game();
	});
	$("#hint").click(function() {
		get_hint();
	});
	$("#enableHints").change(function() {
		$("#hint").toggleClass("disabled");
		$(this).blur();
	});
	$("#countSets").change(function() {
		$("#numSetsContainer").toggleClass("transparent");
	});
});








