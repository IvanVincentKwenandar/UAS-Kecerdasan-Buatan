!function() {

	"use strict";

	var xmlns   = "http://www.w3.org/2000/svg";
	var xlinkns = "http://www.w3.org/1999/xlink";
	var board   = document.getElementById("board");
	var game    = document.getElementById("game");
	var resetB  = document.getElementById("reset");
	resetB.onclick = resetB.ontouchstart = function (e) {
		e.preventDefault();
		if (enabled) {
			enabled = false;
			reset();
		}
		return false;
	}
	var enabled = true, win = false;
	var addx0, addy0, addx1, addy1, cel, lx, ly, ld, lmax, lx2, ly2;

	// Constructor Cell
	function Cell () {
		this.stat  = 0;
		this.isEdge   = 0;
		this.reach = 0;
		this.po    = -1;
		this.id    = null;
	}

	// Buat plot SVG
	Cell.prototype.createElement = function (i, j) {
		var x = 2 * 34 + j * 34 + ((i % 2) ? 1 : -1) * 34 / 4;
		var y = 2 * 26 + i * 26;
		var use = document.createElementNS(xmlns, "use");
		use.cx = j + 2;
		use.cy = i + 2;
		this.id = use;
		use.setAttributeNS(null, "class", "cell");
		use.setAttributeNS(xlinkns, "xlink:href", "#init");
		use.setAttributeNS(null, "transform", "translate(" + x + "," + y + ")");
		use.setAttributeNS(null, "fill", this.stat == 2 ? "#937DC2" : "#EEB0B0");
		use.onclick = use.ontouchstart = function (e) {
			e.preventDefault();
			click(this, this.cx, this.cy);
		}
		board.appendChild(use);
	}

	// Function click , digunakan ketika player mengklik batu bata
	function click(use, x, y) {
		if (enabled && cel[y][x].stat != 2) {
			if (x == cat.x && y == cat.y) return;
			enabled = false;
			use.setAttributeNS(null, "fill", "#937DC2");
			if (win) {
				// run the cat, run!
				cat.play();
				cat.run(cat.dir);
			} else {
				cel[y][x].stat = 2;
				cat.play();
			}
		}
	}

	// Menyiapkan area untuk game baru
	function newGame () {
		win = false;
		enabled = true;
		addx0 = [1, 0, -1, -1, -1, 0];
		addy0 = [0, 1, 1, 0, -1, -1];
		addx1 = [1, 1, 0, -1, 0, 1];
		addy1 = [0, 1, 1, 0, -1, -1];
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
		lmax = 1;
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
				if (cel[i][j].stat != 1) 
                continue;
				for (var k = 0; k < 6; k++) {
					var nx = i % 2 ? (j + addx1[k]) : (j + addx0[k]);
					var ny = i + addy0[k];
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
		var alpha = 100;
		for (var i = 0; i < 100; i++) {
			setTimeout(function () {
				alpha--;
				game.setAttributeNS(null, "fill-opacity", alpha / 100);
				if (alpha == 0) {
					enabled = true;
					newGame();
				}
			}, i * 16);
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
			this.shape.setAttributeNS(xlinkns, "xlink:href", "#ass");
			//console.log(cel);
			// uses.setAttributeNS(null, "fill", "#fff");
		},
		// function jump untuk bata hitam pindah tempat
		jump: function (dir) {
			for (var i = 1; i < 6; i++) {
				var frame = 1;
				setTimeout(function () {
					var id = "f" + dir + (frame++) % 5;
					if (frame == 6) {
						this.px += 34 * this.dirX[dir];
						this.py += 26 * this.dirY[dir];
						enabled = true;
					}
					this.display(this.px, this.py);
				}.bind(this), i * 64);
			}
		},
		// run the cat
		run: function (dir) {
			var t = 0;
			for (var i = 1; i < 20; i++) {
				t++;
				var frame = 1;
				var end = 0;
				setTimeout(function () {
					var id = "f" + dir + frame++;
					if (frame == 0) frame++;
					if (frame == 5) frame = 2;
						this.px += 0.4 * 34 * this.dirX[dir];
						this.py += 0.4 * 26 * this.dirY[dir];
					this.display(this.px, this.py);
					if (end++ == 18) {
						reset();
					}
				}.bind(this), t * 64);
			}
		},
		// Mengecek apakah bata hitam(kucing) dapat kabur
		goOut: function () {
			for (var i = 0; i < 6; ++i) {
				var x = this.y % 2 ? this.x + addx1[i] : this.x + addx0[i];
				var y = this.y + addy0[i];
				if (cel[y][x].stat == 0) {
					this.x = x;
					this.y = y;
					this.dir = i;
					return true;
				}
			}
			return false;
		},
		// Mengecek apakah bata hitam(cat) bisa escape dan menang
		gotoWin: function () {
			for (var i = 0; i < 6; ++i) {
				var x = this.y % 2 ? this.x + addx1[i] : this.x + addx0[i];
				var y = this.y + addy0[i];
				if (cel[y][x].stat != 1){
					// Inner counter as divide by 1/3 part of the map
					//console.log("Check");
					continue;
				} 
				else if (cel[y][x].isEdge) {
					this.x = x;
					this.y = y;
					this.dir = i;
					// Inner counter escapes the map
					//console.log("Done");
					win = true;
					return true;
				}
			}
			return false;
		},
		
		// find best direction
		getNearest: function () {
			cel[this.y][this.x].po = 0;
			lx[0] = this.x;
			ly[0] = this.y;
			var m = 1;
			var n = 999;
			for (var po = 1; po < 200; po++) {
				var p = 0;
				for (var i = 0; i < m; ++i) {
					var x = lx[i];
					var y = ly[i];
					for (var k = 0; k < 6; ++k) {
						var kx = y % 2 ? (x + addx1[k]) : (x + addx0[k]);
						var ky = y + addy0[k];
						if (cel[ky][kx].stat != 1) continue;
						if (cel[ky][kx].po >= 0) continue;
						cel[ky][kx].po = po;
						lx2[p] = kx;
						ly2[p] = ky;
						p++;
						if (cel[ky][kx].isEdge && po < n){
							n = po;
						}
					}
				}
				if (p == 0) break;
				for (var i = 0; i < p; ++i) {
					lx[i] = lx2[i];
					ly[i] = ly2[i];
				}
				m = p;
			}
			if (n == 999){
				return false;
			}
			p = 0;
			for (var i = 0; i < 15; ++i) {
				for (var j = 0; j < 15; ++j) {
					if (cel[i][j].po == n && cel[i][j].isEdge) {
						lx[p] = j;
						ly[p] = i;
						p++;
					}
				}
			}
			if (p == 0) return false;
			var d = Math.floor(Math.random() * p);
			x = lx[d];
			y = ly[d];
			for (var r = 0; r < 200; ++r) {
				p = 0;
				for (var k = 0; k < 6; ++k) {
					kx = y % 2 ? (x + addx1[k]) : (x + addx0[k]);
					ky = y + addy0[k];
					if (cel[ky][kx].stat != 1) continue;
					if (cel[ky][kx].po >= cel[y][x].po) continue;
					lx[p] = kx;
					ly[p] = ky;
					ld[p] = k;
					p++;
				}
				if (p == 0) return false;
				d = Math.floor(Math.random() * p);
				x = lx[d];
				y = ly[d];
				if (cel[y][x].po == 1) {
					this.x = x;
					this.y = y;
					this.dir = 0;
					for (var k = 0; k < 6; ++k) {
						kx = y % 2 ? x + addx1[k] : x + addx0[k];
						ky = y + addy0[k];
						if (cel[ky][kx].po == 0) {
							this.dir = (k + 3) % 6;
						}
					}
					return true;
				}
			}
			return false;
		},
		// pergerakan random bata hitam(cat)
		randMove: function () {
			var x = this.x;
			var y = this.y;
			var p = 0;
			for (var k = 0; k < 6; ++k) {
				var kx = y % 2 ? (x + addx1[k]) : (x + addx0[k]);
				var ky = y + addy0[k];
				if (cel[ky][kx].stat != 1) continue;
				lx[p] = kx;
				ly[p] = ky;
				ld[p] = k;
				p++;
			}
			if (p == 0) return false;
			var d = Math.floor(Math.random() * p);
			this.x = lx[d];
			this.y = ly[d];
			this.dir = ld[d];
			return true;
		},
		// main function saat bermain
		play: function () {
			for (var i = 0; i < 15; i++) {
				for (var j = 0; j < 15; j++) {
					cel[i][j].reach = 0;
					cel[i][j].po = -1;
				}
			}
			for (i = 0; i < 15; i++) {
				for (j = 0; j < 15; j++) {
					if (cel[i][j].stat != 1) continue;
					for (var k = 0; k < 6; k++) {
						var nx = i % 2 ? (j + addx1[k]) : (j + addx0[k]);
						var ny = i + addy0[k];
						if (cel[ny][nx].isEdge) {
							++cel[i][j].reach;
						}
					}
				}
			}
			var f = false;
			if (!this.goOut()) {
				if (!this.gotoWin()) {
					if (!this.getNearest()) {
						if (!this.randMove()) f = true;
					}
				}
			}
			if (f) {
				// car loose
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