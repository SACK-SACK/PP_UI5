sap.ui.define([], function () {
  "use strict";
  return {
    statusClass: function (phas1, phas2) {
      if (phas2 === "X") {
        return "Success"; // 녹색
      } else if (phas1 === "X") {
        return "Warning"; // 노란색
      } else {
        return "Error"; // 회색
      }
    },

    concatDates: function (psday, peday) {
      var sPsday = psday ? psday : "";
      var sPeday = peday ? peday : "";
      if (sPsday && sPeday) {
        return sPsday + " ~ " + sPeday;
      }
      return sPsday || sPeday || "";
    },
    formatImage: function (sMatnr) {
      if (!sMatnr) {
        return sap.ui.require.toUrl("sync/ca/pp/pp/production/images/logo.png");
      }
      var baseName = sMatnr.toLowerCase();
      return sap.ui.require.toUrl(
        "sync/ca/pp/pp/production/images/" + baseName + ".png"
      );
    },
  };
});
