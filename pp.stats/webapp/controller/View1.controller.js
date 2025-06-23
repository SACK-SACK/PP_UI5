sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sync/ca/pp/pp/stats/model/formatter"],
  (Controller, formatter) => {
    "use strict";

    return Controller.extend("sync.ca.pp.pp.stats.controller.View1", {
      formatter: formatter,
      onInit: function () {
        const oSmartChart = this.byId("smartChart");
        const oSmartFilter = this.byId("smartFilterBar");

        oSmartFilter.attachInitialized(() => {
          // SmartFilterBar가 완전히 초기화된 후에만 호출 가능
          console.log("SmartFilterBar initialized ✅");
          oSmartFilter.search(); // 이제 안전하게 호출됨
        });

        oSmartChart.attachInitialized(() => {
          oSmartChart.getChartAsync().then((oInnerChart) => {
            const oVizFrame = oInnerChart._getVizFrame();
            if (oVizFrame) {
              oVizFrame.setVizProperties({
                plotArea: {
                  dataLabel: { visible: true },
                },
              });
            }
          });
        });
      },
    });
  }
);
