!function() {

	"use strict";

	var xmlns = "http://www.w3.org/2000/svg";
	var xlinkns = "http://www.w3.org/1999/xlink";
	var board = document.getElementById("board");
	var game = document.getElementById("game");
	var resetB = document.getElementById("reset");
	resetB.onclick = resetB.ontouchstart = function (e) {
		e.preventDefault();
		if (enabled) {
			enabled = false;
			reset();
		}
		return false;
	}
	var enabled = true, canEscape = false;
	var addX0, addY, addX1, cel, lx, ly, ld, lx2, ly2;

	// Constructor Cell
	function Cell () {
		this.stat = 0;
		this.isEdge = 0;
		this.po = -1;
	}

	// Buat plot SVG
	Cell.prototype.createElement = function (i, j) {
		if(i % 2 == 0){
			var x = 68 + (j * 34) + (-1) * 34 / 4;
		}else{
			var x = 68 + (j * 34) + (1) * 34 / 4;
		}
		var y = 52 + (i * 26);
		var use = document.createElementNS(xmlns, "use");
		use.cx = j + 2;
		use.cy = i + 2;
		use.setAttributeNS(xlinkns, "xlink:href", "#init");
		use.setAttributeNS(null, "transform", "translate(" + x + "," + y + ")");
		if (this.stat == 2){
			use.setAttributeNS(null, "fill", "#937DC2");
		}else{
			use.setAttributeNS(null, "fill", "#EEB0B0");
		}
		use.onclick = use.ontouchstart = function (e) {
			e.preventDefault();
			click(this, this.cx, this.cy);
		}
		
		board.appendChild(use);
	}

	// Function click , digunakan ketika player mengklik batu bata
	function click(use, x, y) {
		if (x == cat.x && y == cat.y){
			return;
		}
		if (enabled && cel[y][x].stat != 2) {
			use.setAttributeNS(null, "fill", "#937DC2");
			if (canEscape) {
				reset();
			} else {
				cel[y][x].stat = 2;
				cat.play();
			}
		}
	}

	// Menyiapkan area untuk game baru
	function newGame () {
		canEscape = false;
		enabled = true;
		addX0 = [1, 0, -1, -1, -1, 0];
		addX1 = [1, 1, 0, -1, 0, 1];
		addY = [0, 1, 1, 0, -1, -1];
		cel = [];
		for (var i = 0; i < 15; i++) {
			cel[i] = [];
			for (var j = 0; j < 15; j++) {
				cel[i][j] = new Cell();
			}
		}
		cat.x = 5;
		cat.y = 6;
		cat.px =  20 + 34 * cat.x;
		cat.py = -15 + 26 * cat.y;
		cel[cat.y][cat.x].stat = 1;
		lx = [];
		ly = [];
		ld = [];
		lx[0] = cat.x;
		ly[0] = cat.y;
		lx2 = [];
		ly2 = [];
		for (var i = 2; i < 12 - 2; i++) {
			for (var j = 2; j < 12 - 2; j++) {
				cel[i][j].stat = 1;
			}
		}
		// Merandom letak bata merah yang tidak bisa dilewati kucing(bata hitam) pada awal game
		for (var i = 0; i < 24; i++) {
			var rx = Math.floor(Math.random() * 12);
			var ry = Math.floor(Math.random() * 12);
			if (rx != cat.x && ry != cat.y) {
				if (cel[ry][rx].stat == 1) {
					cel[ry][rx].stat = 2;
				}
			}
		}
		for (var i = 0; i < 12; i++) {
			for (var j = 0; j < 12; j++) {
				if (cel[i][j].stat != 1){
                	continue;
				}
				for (var k = 0; k < 6; k++) {
					if(i % 2 == 0){
						var nx = j + addX0[k];
					}else{
						var nx = j + addX1[k];
					}
					var ny = i + addY[k];
					if (cel[ny][nx].stat == 0) { // --> Value = 1, check  = 0
						// Tepi edge diberi value 1 untuk menandakan bahwa itu edge
						cel[i][j].isEdge = 1;
					}
				}
			}
		}
		// Merender board permainan
		for (var i = 0; i < 8; i++) {
			for (var j = 0; j < 8; j++) {
				cel[i + 2][j + 2].createElement(i, j);
			}
		}
		// Mendisplay bata hitam(cat)
		game.setAttributeNS(null, "fill-opacity", 1);
		cat.display(cat.px, cat.py);
	}

	// reset permainan
	function reset () {
		cat.display(0, 0);
		var alpha = 50;
		for (var i = 0; i < 50; i++) {
			setTimeout(function () {
				alpha--;
				game.setAttributeNS(null, "fill-opacity", alpha / 50);
				if (alpha == 0) {
					enabled = true;
					newGame();
				}
			}, i * 20);
		}
	}

	// function untuk bata hitam(cat)
	var cat = {
		shape: document.getElementById("player"),
		x: 0,
		y: 0,
		px: 0,
		py: 0,
		dir: 0,
		dirX: [1, 0.5, -0.5, -1, -0.5, 0.5],
		dirY: [0, 1, 1, 0, -1, -1],

		// SVG update
		display: function (x, y) {
			this.shape.setAttributeNS(null, "fill", "#480032")
			this.shape.setAttributeNS(null, "transform", 'translate(' + x + ',' + y + ')');
			this.shape.setAttributeNS(xlinkns, "xlink:href", "#bg");
		},
		// function jump untuk bata hitam pindah tempat
		jump: function (dir) {
			this.px += 34 * this.dirX[dir];
			this.py += 26 * this.dirY[dir];
			enabled = true;
			this.display(this.px, this.py);
		},
		// Mengecek apakah bata hitam(kucing) dapat kabur
		cantGoOut: function () {
			var x, y;
			//i = 6 karena ada 6 bata di sekitar 1 bata hitam (kucing) yang di cek
			for (var i = 0; i < 6; ++i) {
				if (this.y % 2 == 0){
					x = this.x + addX1[i];
				}else{
					x = this.x + addX0[i];
				}
				y = this.y + addY[i];
				//kalau status posisi kucing saat ini = 0, maka kucing saat ini ada di edge 
				if (cel[y][x].stat == 0) {
					this.dir = i;
					return false;
				}
			}
			return true;
		},
		// Mengecek apakah bata hitam(cat) bisa escape dan menang
		cantGotoWin: function () {
			for (var i = 0; i < 6; ++i) {
				if(this.y % 2 == 0){
					var x = this.x + addX0[i];
				}else{
					var x = this.x + addX1[i];
				}
				var y = this.y + addY[i];
				if (cel[y][x].stat != 1){
					continue;
				}else if (cel[y][x].isEdge) {
					this.x = x;
					this.y = y;
					this.dir = i;
					canEscape = true;
					return false;
				}
			}
			return true;
		},
		
		// find best direction
		cantGetNearest: function () {
			cel[this.y][this.x].po = 0;
			lx[0] = this.x;
			ly[0] = this.y;
			var m = 1;
			var reachEdge = 0;
			var nearestEdgeX = new Array(0);
			var nearestEdgeY = new Array(0);
			for (var iter = 1; iter < 200 && reachEdge == 0; iter++) {
				var p = 0;
				for (var i = 0; i < m; ++i) {
					var x = lx[i];
					var y = ly[i];
					if (cel[y][x].isEdge){
						nearestEdgeX.push(x);
						nearestEdgeY.push(y);
						reachEdge = 1;
					}
					for (var k = 0; k < 6; ++k) {
						if(y % 2 == 0){
							var kx = x + addX0[k];
						}else{
							var kx = x + addX1[k];
						}
						var ky = y + addY[k];
						if((cel[ky][kx].stat == 1) && (cel[ky][kx].po < 0)){
							cel[ky][kx].po = iter;
							lx2[p] = kx;
							ly2[p] = ky;
							p++;
						}
					}
				}
				if (p == 0){
					break;
				}
				for (var i = 0; i < p; ++i) {
					lx[i] = lx2[i];
					ly[i] = ly2[i];
				}
				m = p;
			}
			if (reachEdge == 0){
				return true;
			}

			//Backtrack
			p = nearestEdgeX.length;
			if (p == 0){
				return true;
			}
			var d = Math.floor(Math.random() * p);
			x = nearestEdgeX[d];
			y = nearestEdgeY[d];
			for (var r = 0; r < 200; ++r) {
				p = 0;
				for (var k = 0; k < 6; ++k) {
					if(y % 2 == 0){
						kx = x + addX0[k];
					}else{
						kx = x + addX1[k];
					}
					ky = y + addY[k];
					if ((cel[ky][kx].stat == 1) && (cel[ky][kx].po < cel[y][x].po) && (cel[ky][kx].po >= 0)){
						lx[p] = kx;
						ly[p] = ky;
						p++;
					}
				}
				if (p == 0){
					return true;
				}
				d = Math.floor(Math.random() * p);
				x = lx[d];
				y = ly[d];
				if (cel[y][x].po == 1) {
					this.x = x;
					this.y = y;
					this.dir = 0;
					for (var k = 0; k < 6; ++k) {
						if(y % 2 == 0){
							kx = x + addX0[k]
						}else{
							kx = x + addX1[k];
						}
						ky = y + addY[k];
						if (cel[ky][kx].po == 0) {
							this.dir = (k + 3) % 6;
						}
					}
					return false;
				}
			}
			return true;
		},

		// pergerakan random bata hitam(cat)
		cantRandMove: function () {
			var x = this.x;
			var y = this.y;
			var p = 0;

			// BFS
			for (var k = 0; k < 6; ++k) {
				if(y % 2 == 0){
					var kx = x + addX0[k];
				}else{
					var kx = x + addX1[k];
				}
				var ky = y + addY[k];
				if (cel[ky][kx].stat != 1){
					continue;
				}
				lx[p] = kx;
				ly[p] = ky;
				ld[p] = k;
				p++;
			}
			if (p == 0){
				return true;
			}
			var d = Math.floor(Math.random() * p);
			this.x = lx[d];
			this.y = ly[d];
			this.dir = ld[d];
			return false;
		},
		// main function saat bermain
		play: function () {
			for (var i = 0; i < 15; i++) {
				for (var j = 0; j < 15; j++) {
					cel[i][j].po = -1;
				}
			}
			var f = false;
			if (this.cantGoOut()) {
				if (this.cantGotoWin()) {
					if (this.cantGetNearest()) {
						if (this.cantRandMove()){
							f = true;
						}
					}
				}
			}
			if (f) {
				enabled = false;
				reset();
			} else {
				this.jump(this.dir);
			}
		}
	}

	// memulai game
	newGame();

}();
