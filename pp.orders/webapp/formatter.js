sap.ui.define([], function () {
    "use strict";
    return {
		getStatusColor(sStatus){
          switch (sStatus) {
                case "A":
                    return "statusGreen";
                case "R":
                    return "statusRed";
                case "W":
                    return "statusOrange";
                default:
                    return "statusGray";
            }
		}
    };
});
