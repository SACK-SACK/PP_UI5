/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"synccapp/pp.stats/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
