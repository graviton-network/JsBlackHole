/*
    Copyright (C) 2013-2015  Ian Smith <m4r35n357@gmail.com>

    The JavaScript code in this page is free software: you can
    redistribute it and/or modify it under the terms of the GNU
    General Public License (GNU GPL) as published by the Free Software
    Foundation, either version 3 of the License, or (at your option)
    any later version.  The code is distributed WITHOUT ANY WARRANTY;
    without even the implied warranty of MERCHANTABILITY or FITNESS
    FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.

    As additional permission under GNU GPL version 3 section 7, you
    may distribute non-source (e.g., minimized or compacted) forms of
    that code without the copy of the GNU GPL normally required by
    section 4, provided you include this license notice and a URL
    through which recipients can access the Corresponding Source.
*/

/*jslint white: true, browser: true, safe: true */

"use strict";

var DISPLAY = {
	msRefresh: 10,
	// Misc. constants
	BLACK: "#000000",
	RED: "#ff0000",
	GREEN: "#00ff00",
	BLUE: "#0000ff",
	YELLOW: "#ffff00",
	CYAN: "#008080",
	MAGENTA: "#800080",
	ORANGE: "#ff8000",
	WHITE: "#ffffff",
	GREY: "#a0a0a0",
	n: 0,
	ballSize: 3,
	blankSize: 4,
	potentialY: 100,
	phiBH: 0.0,
	circularGradient: function (canvas, x, y, innerColour, outerColour) {
		var grd = canvas.createRadialGradient(x, y, 0, x, y, Math.sqrt(x * x + y * y));
		grd.addColorStop(0, innerColour);
		grd.addColorStop(1, outerColour);
		canvas.fillStyle = grd;
		canvas.fillRect(0, 0, 2 * x, 2 * y);
	},
	circle: function (canvas, X, Y, radius, colour) {
		canvas.fillStyle = colour;
		canvas.beginPath();
		canvas.arc(X, Y, this.scale * radius, 0, GLOBALS.TWOPI, true);
		canvas.closePath();
		canvas.fill();
	},
	varTable: function () {
		var M = INIT.M;
		var c = GLOBALS.c;
		var properTime = this.n * INIT.timeStep * M / c;
		var gamma;
		if (! NEWTON.collided) {
			NEWTON.rDisplay.innerHTML = (M * NEWTON.r).toExponential(3);
			NEWTON.phiDisplay.innerHTML = GLOBALS.phiDegrees(NEWTON.phi);
			NEWTON.tDisplay.innerHTML = properTime.toExponential(2);
			NEWTON.vDisplay.innerHTML = GLOBALS.speed(NEWTON).toExponential(3);
		}
		if (! GR.collided) {
			gamma = GR.tDot;
			GR.tDisplay.innerHTML = (M * GR.t / c).toExponential(2);
			GR.rDisplay.innerHTML = (M * GR.r).toExponential(3);
			GR.phiDisplay.innerHTML = GLOBALS.phiDegrees(GR.phi);
			GR.tauDisplay.innerHTML = properTime.toExponential(2);
			GR.tDotDisplay.innerHTML = gamma.toFixed(3);
			GR.rDotDisplay.innerHTML = GR.rDot.toFixed(3);
			GR.phiDotDisplay.innerHTML = (GR.phiDot / M).toFixed(3);
			GR.vDisplay.innerHTML = (GLOBALS.speed(GR) / gamma).toExponential(3);
		}
	},
	pointX: function (r, phi) {
		return this.originX + r * Math.cos(phi);
	},
	pointY: function (r, phi) {
		return this.originY + r * Math.sin(phi);
	},
	plotRotation: function () {
		var phiBH, X, Y;
		var radius = 0.7 * INIT.M * this.scale * INIT.horizon;
		this.phiBH += INIT.deltaPhi;
		phiBH = this.phiBH;
		X = this.pointX(radius, phiBH);
		Y = this.pointY(radius, phiBH);
		this.tracks.clearRect(this.X - this.blankSize, this.Y - this.blankSize, 2 * this.blankSize, 2 * this.blankSize);
		this.tracks.fillStyle = this.RED;
		this.tracks.beginPath();
		this.tracks.arc(X, Y, 2, 0, GLOBALS.TWOPI, true);
		this.tracks.closePath();
		this.tracks.fill();
		this.X = X;
		this.Y = Y;
	},
	plotOrbit: function (model) {
		var X, Y;
		var r = model.r * INIT.M * this.scale;
		X = this.pointX(r, model.phi);
		Y = this.pointY(r, model.phi);
		model.fg.clearRect(model.X - this.blankSize, model.Y - this.blankSize, 2 * this.blankSize, 2 * this.blankSize);
		model.fg.fillStyle = model.colour;
		model.fg.beginPath();
		model.fg.arc(X, Y, this.ballSize, 0, GLOBALS.TWOPI, true);
		model.fg.closePath();
		model.fg.fill();
		if (this.showTracks) {
			this.tracks.strokeStyle = model.colour;
			this.tracks.beginPath();
			this.tracks.moveTo(model.X, model.Y);
			this.tracks.lineTo(X, Y);
			this.tracks.stroke();
		}
		model.X = X;
		model.Y = Y;
	},
	energyBar: function () {
		DISPLAY.bgPotential.strokeStyle = this.BLACK;
		DISPLAY.bgPotential.beginPath();
		DISPLAY.bgPotential.moveTo(Math.floor(INIT.horizon * INIT.M * this.scale), this.potentialY);
		DISPLAY.bgPotential.lineTo(this.originX, this.potentialY);
		DISPLAY.bgPotential.stroke();
	},
	plotPotential: function (model) {
		var energyBar = this.potentialY;
		var v = energyBar + this.pScale * this.pSize * (model.energyBar - model.V(model.r));
		var scaledMass = INIT.M * this.scale;
		var r = model.r * scaledMass;
		var dBerror = GLOBALS.dB(GLOBALS.h(model), model.h0);
		model.fgPotential.clearRect(model.rOld * scaledMass - this.blankSize, energyBar - this.blankSize, 2 * this.blankSize, v + 2 * this.blankSize);
		// Potential dropline
		model.fgPotential.strokeStyle = model.colour;
		model.fgPotential.beginPath();
		model.fgPotential.moveTo(r, v);
		model.fgPotential.lineTo(r, energyBar);
		model.fgPotential.stroke();
		// Potential ball
		model.fgPotential.fillStyle = dBerror < -120.0 ? model.colour : dBerror < -90.0 ? this.YELLOW : dBerror < -60.0 ? this.ORANGE : this.RED;
		model.fgPotential.beginPath();
		model.fgPotential.arc(r, energyBar, this.ballSize, 0, GLOBALS.TWOPI, true);
		model.fgPotential.closePath();
		model.fgPotential.fill();
	},
	plotTauDot: function (model) {  // dTau/dt plot for GR
		var tDotValue;
		var xValue = DISPLAY.pSize - 5;		
		tDotValue = DISPLAY.pSize / model.tDot;
		model.fgPotential.clearRect(xValue - 3, 0, xValue + 3, DISPLAY.pSize);
		model.fgPotential.fillStyle = this.MAGENTA;
		model.fgPotential.beginPath();
		model.fgPotential.arc(xValue, tDotValue, this.ballSize, 0, GLOBALS.TWOPI, true);
		model.fgPotential.closePath();
		model.fgPotential.fill();
		model.fgPotential.strokeStyle = this.MAGENTA;
		model.fgPotential.beginPath();
		model.fgPotential.moveTo(xValue, DISPLAY.pSize);
		model.fgPotential.lineTo(xValue, tDotValue);
		model.fgPotential.stroke();
	},
	potential: function (model) {
		var i;
		DISPLAY.bgPotential.strokeStyle = model.colour;
		DISPLAY.bgPotential.beginPath();
		for (i = Math.floor(INIT.horizon * this.scale); i < this.pSize; i += 1) {
			DISPLAY.bgPotential.lineTo(i, this.potentialY + this.pScale * this.pSize * (model.energyBar - model.V(i / (INIT.M * this.scale))));
		}
		DISPLAY.bgPotential.stroke();
	},
	isco: function () {
		var a = INIT.a;
		var z1 = 1.0 + Math.pow(1.0 - a * a, 1.0 / 3.0) * (Math.pow(1.0 + a, 1.0 / 3.0) + Math.pow(1.0 - a, 1.0 / 3.0));
		var z2 = Math.sqrt(3.0 * a * a + z1 * z1);
		if (GLOBALS.prograde) {
			return 3.0 + z2 - Math.sqrt((3.0 - z1) * (3.0 + z1 + 2.0 * z2));
		} else {
			return 3.0 + z2 + Math.sqrt((3.0 - z1) * (3.0 + z1 + 2.0 * z2));
		}
	},
};

