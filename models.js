/*
    Copyright (C) 2013  Ian Smith <m4r35n357@gmail.com>

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

var GLOBALS = {
	debug: true,
	TWOPI: 2.0 * Math.PI,
	LOG10: Math.log(10.0),
	// Physical constants
	c: 299792.458,
	G: 6.67398e-11,
	mSolar: 1.9891e30,
	rSolar: 700000.0,
	ergosphere: 2.0,
	dB: function (val, ref) {
		return 10.0 * Math.log(Math.abs((val - ref) / ref)) / this.LOG10;
	},
	phiDegrees: function (phiRadians) {
		return (phiRadians * 360.0 / this.TWOPI % 360).toFixed(0) + "&deg;";
	},
	phiDMS: function (phiRadians) {
		var totalDegrees = phiRadians * 360.0 / this.TWOPI;
		var circularDegrees = totalDegrees - Math.floor(totalDegrees / 360.0) * 360;
		var minutes = (circularDegrees - Math.floor(circularDegrees)) * 60;
		var seconds = (minutes - Math.floor(minutes)) * 60;
		return circularDegrees.toFixed(0) + "&deg;" + minutes.toFixed(0) + "&#39;" + seconds.toFixed(0) + "&#34;";
	},
	speed: function (model) {
		return this.c * Math.sqrt(model.rDot * model.rDot + model.r * model.r * model.phiDot * model.phiDot);
	},
	h: function (model) {  // the radial "Hamiltonian"
		var h = 0.5 * model.rDot * model.rDot + model.V(model.r);
		return h;
	},
	solve: function (model) {  // Generalized symplectic integrator
		var sympBase = function (model, c) { // 2nd-order symplectic building block
			var halfC = 0.5 * c;
			model.updateQ(halfC);
			model.updateP(c);
			model.updateQ(halfC);
		};
		var i, M, r, phiDegrees, tmp, h;
		var rOld = model.rOld = model.r;
		var direction = model.direction;
		var h0 = model.h0;
		tmp = this.coefficients.length - 1;  // compose higher orders
		for (i = 0; i < tmp; i += 1) {
			sympBase(model, this.coefficients[i]);
		}
		for (i = tmp; i >= 0; i -= 1) {
			sympBase(model, this.coefficients[i]);
		}
		r = model.r;
		if (((r > rOld) && (direction < 0)) || ((r < rOld) && (direction > 0))) {
			phiDegrees = this.phiDMS(model.phi);
			M = INIT.M;
			if (direction === -1) {
				model.rMinDisplay.innerHTML = (M * r).toFixed(1);
				model.pDisplay.innerHTML = phiDegrees;
				this.debug && console.log(model.name + ": Perihelion");
			} else {
				model.rMaxDisplay.innerHTML = (M * r).toFixed(1);
				model.aDisplay.innerHTML = phiDegrees;
				this.debug && console.log(model.name + ": Aphelion");
			}
			model.direction = - direction;
			h = this.h(model);
			this.debug && console.log("H0: " + h0.toExponential(6) + ", H: " + h.toExponential(6) + ", E: " + this.dB(h, h0).toFixed(1) + "dBh0");
		}
	},
	initialize: function () {
		this.coefficients = [];
		switch (INIT.order) {
		case 2:
			this.coefficients.push(1.0);
			break;
		case 4:
			var CUBEROOT2 = Math.pow(2.0, 1.0 / 3.0);
			var y0 = 1.0 / (2.0 - CUBEROOT2);
			var y1 = - y0 * CUBEROOT2;
			this.coefficients.push(y0);
			this.coefficients.push(y1);
			break;
		case 6:
			this.coefficients.push(0.78451361047755726381949763);
			this.coefficients.push(0.23557321335935813368479318);
			this.coefficients.push(-1.17767998417887100694641568);
			this.coefficients.push(1.31518632068391121888424973);
			break;
		case 8:
			this.coefficients.push(0.74167036435061295344822780);
			this.coefficients.push(-0.40910082580003159399730010);
			this.coefficients.push(0.19075471029623837995387626);
			this.coefficients.push(-0.57386247111608226665638773);
			this.coefficients.push(0.29906418130365592384446354);
			this.coefficients.push(0.33462491824529818378495798);
			this.coefficients.push(0.31529309239676659663205666);
			this.coefficients.push(-0.79688793935291635401978884);
			break;
		case 10:
			this.coefficients.push(0.09040619368607278492161150);
			this.coefficients.push(0.53591815953030120213784983);
			this.coefficients.push(0.35123257547493978187517736);
			this.coefficients.push(-0.31116802097815835426086544);
			this.coefficients.push(-0.52556314194263510431065549);
			this.coefficients.push(0.14447909410225247647345695);
			this.coefficients.push(0.02983588609748235818064083);
			this.coefficients.push(0.17786179923739805133592238);
			this.coefficients.push(0.09826906939341637652532377);
			this.coefficients.push(0.46179986210411860873242126);
			this.coefficients.push(-0.33377845599881851314531820);
			this.coefficients.push(0.07095684836524793621031152);
			this.coefficients.push(0.23666960070126868771909819);
			this.coefficients.push(-0.49725977950660985445028388);
			this.coefficients.push(-0.30399616617237257346546356);
			this.coefficients.push(0.05246957188100069574521612);
			this.coefficients.push(0.44373380805019087955111365);
			break;
		}
	},
};

var INIT = {
	name: "INIT",
	phi: 0.0,
 	direction: -1.0,
	getFloatById: function (id) {
		return parseFloat(document.getElementById(id).value);
	},
	getHtmlValues: function () {
		GLOBALS.debug && console.info("Restarting . . . ");
		this.timeStep = this.getFloatById('timestep') * 500000000.0;
		this.lFac = this.getFloatById('lfactor') / 100.0;
		this.M = this.getFloatById('mass') * 0.000000001 * GLOBALS.mSolar * GLOBALS.G / (GLOBALS.c * GLOBALS.c);
		GLOBALS.debug && console.info(this.name + ".M: " + this.M.toFixed(3));
		this.r = this.getFloatById('radius') / this.M;
		GLOBALS.debug && console.info(this.name + ".r: " + this.r.toFixed(1));
		this.a = this.getFloatById('spin');
		GLOBALS.debug && console.info(this.name + ".a: " + this.a.toFixed(1));
		this.order = this.getFloatById('order');
		GLOBALS.debug && console.info(this.name + ".order: " + this.order);
		if (this.a >= 0.0) {
			GLOBALS.prograde = true;
		} else {
			GLOBALS.prograde = false;
		}
		this.horizon = 1.0 + Math.sqrt(1.0 - this.a * this.a);
		GLOBALS.debug && console.info(this.name + ".horizon: " + this.horizon.toFixed(3));
		this.deltaPhi = this.a / (this.horizon * this.horizon + this.a * this.a) * this.timeStep;
	},
	initialize: function (model) {
		model.collided = false;
		model.r = this.r;
		model.rOld = this.r;
		model.phi = this.phi;
		model.direction = this.direction;
	},
};

var NEWTON = {
	name: "NEWTON",
	initialize: function () {
		var V0;
		this.circular(this.r);
		GLOBALS.debug && console.info(this.name + ".L: " + this.L.toFixed(3));
		this.L2 = this.L * this.L;
		this.energyBar = this.V(this.r);
		GLOBALS.debug && console.info(this.name + ".energyBar: " + this.energyBar.toFixed(6));
		this.L = this.L * INIT.lFac;
		this.L2 = this.L * this.L;
		V0 = this.V(this.r); // using (possibly) adjusted L from above
		this.rDot = - Math.sqrt(2.0 * (this.energyBar - V0));
		this.h0 =  0.5 * this.rDot * this.rDot + V0;
	},
	circular: function (r) {  // L for a circular orbit of r
		this.L = Math.sqrt(r);
	},
	V: function (r) {  // the Effective Potential
		return - 1.0 / r + this.L2 / (2.0 * r * r);
	},
	updateQ: function (c) {  // update radial position
		this.r += c * this.rDot * INIT.timeStep;
	},
	updateP: function (c) {  // update radial momentum
		var r = this.r;
		this.rDot -= c * (1.0 / (r * r) - this.L2 / (r * r * r)) * INIT.timeStep;
	},
	update: function () {
		var step = INIT.timeStep;
		var r = this.r;
		var L = this.L;
		if (this.r > INIT.horizon) {
			GLOBALS.solve(this);
			this.phiDot = L / (r * r);
			this.phi += this.phiDot * step;
		} else {
			this.collided = true;
			GLOBALS.debug && console.info(this.name + " - collided\n");
		}
	},
};

var GR = { // can be spinning
	name: "GR",
	initialize: function () {
		var V0;
		this.circular(this.r, INIT.a);
		GLOBALS.debug && console.info(this.name + ".L: " + this.L.toFixed(3));
		GLOBALS.debug && console.info(this.name + ".E: " + this.E.toFixed(6));
		this.potentialFactors(this.L, this.E, INIT.a);
		this.energyBar = this.V(this.r);
		GLOBALS.debug && console.info(this.name + ".energyBar: " + this.energyBar.toFixed(6));
		this.L = this.L * INIT.lFac;
		this.potentialFactors(this.L, this.E, INIT.a);
		this.t = 0.0;
		this.tDot = 1.0;
		V0 = this.V(this.r); // using (possibly) adjusted L from above
		this.rDot = - Math.sqrt(2.0 * (this.energyBar - V0));
		this.h0 =  0.5 * this.rDot * this.rDot + V0;
	},
	circular: function (r, a) {  // L and E for a circular orbit of r
		var sqrtR = Math.sqrt(r);
		var tmp = Math.sqrt(r * r - 3.0 * r + 2.0 * a * sqrtR);
		this.L = (r * r - 2.0 * a * sqrtR + a * a) / (sqrtR * tmp);
		this.E = (r * r - 2.0 * r + a * sqrtR) / (r * tmp);
	},
	potentialFactors: function (L, E, a) {
		this.k1 = L * L - a * a * (E * E - 1.0);
		this.k2 = (L - a * E) * (L - a * E);
	},
	V: function (r) {  // the Effective Potential
		return - 1.0 / r + this.k1 / (2.0 * r * r) - this.k2 / (r * r * r);
	},
	updateQ: function (c) {  // update radial position
		this.r += c * this.rDot * INIT.timeStep;
	},
	updateP: function (c) {  // update radial momentum
		var r = this.r;
		this.rDot -= c * (1.0 / (r * r) - this.k1 / (r * r * r) + 3.0 * this.k2 / (r * r * r * r)) * INIT.timeStep;
	},
	update: function () {
		var step = INIT.timeStep;
		var r = this.r;
		var L = this.L;
		var E = this.E;
		var a = INIT.a;
		var delta;
		if (r > INIT.horizon) {
			GLOBALS.solve(this);
			delta = r * r + a * a - 2.0 * r;
			this.phiDot = ((1.0 - 2.0 / r) * L + 2.0 * a * E / r) / delta;
			this.phi += this.phiDot * step;
			this.tDot = ((r * r + a * a * (1.0 + 2.0 / r)) * E - 2.0 * a * L / r) / delta;
			this.t += this.tDot * step;
		} else {
			this.collided = true;
			GLOBALS.debug && console.info(this.name + " - collided\n");
		}
	},
};

