/*jslint white: true, browser: true, safe: true */

"use strict";

var drawBackground = function () {
	var grd;
	var vEn;
	var vE;
	var i;
	var bgPotential = function (model, i) {
		var v = model.V(i, model.L);
		if (v < model.energyBar + DISPLAY.potentialY) {
			model.bgPotential.fillStyle = DISPLAY.BLACK;
				model.bgPotential.beginPath();
				model.bgPotential.arc(i * DISPLAY.scale, DISPLAY.potentialY + 180.0 * (model.energyBar - v), 1, 0, GLOBALS.TWOPI, true);
				model.bgPotential.closePath();
			model.bgPotential.fill();
		}
	};
	DISPLAY.circularGradient(DISPLAY.bg, DISPLAY.originX, DISPLAY.originY, DISPLAY.WHITE, DISPLAY.BLACK);
	grd = GR.bgPotential.createLinearGradient(0, 0, DISPLAY.width, 0);
	grd.addColorStop(0, "white");
	grd.addColorStop(1, "black");
	// Stable orbit limit
	DISPLAY.bg.globalAlpha = 0.2;
	DISPLAY.circle(DISPLAY.bg, DISPLAY.originX, DISPLAY.originY, 3.0 * INIT.Rs, DISPLAY.YELLOW);
	// Unstable orbit limit
	DISPLAY.bg.globalAlpha = 0.6;
	DISPLAY.circle(DISPLAY.bg, DISPLAY.originX, DISPLAY.originY, 1.5 * INIT.Rs, DISPLAY.RED);
	// Gravitational radius
	DISPLAY.bg.globalAlpha = 1.0;
	DISPLAY.circle(DISPLAY.bg, DISPLAY.originX, DISPLAY.originY, INIT.Rs, DISPLAY.BLACK);
	// Newton energy
	NEWTON.bgPotential.fillStyle = grd;
	NEWTON.bgPotential.fillRect(0, 0, DISPLAY.width, 200);
	NEWTON.bgPotential.fillStyle = DISPLAY.BLACK;
	NEWTON.bgPotential.fillRect(0, 0, DISPLAY.scale * INIT.Rs, 200);
	DISPLAY.energyBar(NEWTON);
	// GR energy
	GR.bgPotential.fillStyle = grd;
	GR.bgPotential.fillRect(0, 0, DISPLAY.width, 200);
	GR.bgPotential.globalAlpha = 0.2;
	GR.bgPotential.fillStyle = DISPLAY.YELLOW;
	GR.bgPotential.fillRect(0, 0, DISPLAY.scale * 3.0 * INIT.Rs, 200); 
	GR.bgPotential.globalAlpha = 0.6;
	GR.bgPotential.fillStyle = DISPLAY.RED;
	GR.bgPotential.fillRect(0, 0, DISPLAY.scale * 1.5 * INIT.Rs, 200); 
	GR.bgPotential.globalAlpha = 1.0;
	GR.bgPotential.fillStyle = DISPLAY.BLACK;
	GR.bgPotential.fillRect(0, 0, DISPLAY.scale * INIT.Rs, 200);
	DISPLAY.energyBar(GR);
	// Effective potentials
	for (i = DISPLAY.rMin; i < DISPLAY.originX / DISPLAY.scale; i += 1) {
		bgPotential(NEWTON, i);
		bgPotential(GR, i);
	}
	NEWTON.eDisplay.innerHTML = NEWTON.E.toFixed(6);
	NEWTON.lDisplay.innerHTML = NEWTON.L.toFixed(2);
	GR.eDisplay.innerHTML = GR.E.toFixed(6);
	GR.lDisplay.innerHTML = GR.L.toFixed(2);
};

var drawForeground = function () {
	if ((DISPLAY.n % 10) === 0) {
		DISPLAY.varTable();
	}
	if (! NEWTON.collided) {
		NEWTON.update();
		DISPLAY.plotOrbit(NEWTON);
		DISPLAY.plotPotential(NEWTON);
	}
	if (! GR.collided) {
		GR.update();
		DISPLAY.plotOrbit(GR);
		DISPLAY.plotPotential(GR);
	}
	DISPLAY.n = DISPLAY.n + 1;
};

var getDom = function () {
	var polar = document.getElementById('fgorbit');
	var potential = document.getElementById('fgpotn');
	DISPLAY.originX = polar.width / 2;
	DISPLAY.originY = polar.height / 2;
	DISPLAY.width = potential.width;
	DISPLAY.fg = polar.getContext('2d');
	DISPLAY.bg = document.getElementById('bgorbit').getContext('2d');
	NEWTON.fgPotential = document.getElementById('fgpotn').getContext('2d');
	NEWTON.bgPotential = document.getElementById('bgpotn').getContext('2d');
	GR.fgPotential = document.getElementById('fgpotgr').getContext('2d');
	GR.bgPotential = document.getElementById('bgpotgr').getContext('2d');
	NEWTON.eDisplay = document.getElementById('eNEWTON');
	NEWTON.lDisplay = document.getElementById('lNEWTON');
	NEWTON.tDisplay = document.getElementById('timeNEWTON');
	NEWTON.rDisplay = document.getElementById('rNEWTON');
	NEWTON.phiDisplay = document.getElementById('phiNEWTON');
	NEWTON.pDisplay = document.getElementById('pNEWTON');
	NEWTON.aDisplay = document.getElementById('aNEWTON');
	GR.eDisplay = document.getElementById('eGR');
	GR.lDisplay = document.getElementById('lGR');
	GR.tDisplay = document.getElementById('tGR');
	GR.rDisplay = document.getElementById('rGR');
	GR.phiDisplay = document.getElementById('phiGR');
	GR.tauDisplay = document.getElementById('tauGR');
	GR.pDisplay = document.getElementById('pGR');
	GR.aDisplay = document.getElementById('aGR');
	INIT.getHtmlValues();
	DISPLAY.scale = INIT.getFloatById('scale');
};

var scenarioChange = function () {
	var form = document.getElementById('scenarioForm');
	var element;
	DISPLAY.refreshId && clearInterval(DISPLAY.refreshId);
	getDom();
	DISPLAY.clearOrbit(NEWTON);
	DISPLAY.clearPotential(NEWTON);
	DISPLAY.clearOrbit(GR);
	DISPLAY.clearPotential(GR);
	DISPLAY.n = 0;
//	INIT.M = parseFloat(document.getElementById('mass').value);
//	INIT.Rs = 2.0 * GLOBALS.G * INIT.M / (GLOBALS.c * GLOBALS.c);
//	INIT.r = parseFloat(document.getElementById('radius').value);
//	INIT.timeStep = parseFloat(document.getElementById('timestep').value);
//	INIT.lFac = parseFloat(document.getElementById('lfactor').value) / 100.0;
	DISPLAY.rMin = Math.round(INIT.Rs);
	// Newton initial conditions
	INIT.initialize(NEWTON);
	NEWTON.initialize();
	NEWTON.X = DISPLAY.pointX(NEWTON.r, NEWTON.phi);
	NEWTON.Y = DISPLAY.pointY(NEWTON.r, NEWTON.phi);
	NEWTON.colour = DISPLAY.GREEN;
	// GR initial conditions
	INIT.initialize(GR);
	GR.initialize();
	GR.X = DISPLAY.pointX(GR.r, GR.phi);
	GR.Y = DISPLAY.pointY(GR.r, GR.phi);
	GR.colour = DISPLAY.BLUE;
	// Start drawing . . .
	NEWTON.energyBar = NEWTON.E;
	GR.energyBar = GR.E2;
	drawBackground();
	DISPLAY.refreshId = setInterval(drawForeground, DISPLAY.msRefresh);
	return false;
};

window.onload = function () {
	scenarioChange();
};

