sap.ui.define(["sap/ui/base/ManagedObject"], function (ManagedObject) {
  "use strict";

  return ManagedObject.extend("sync.ca.pp.pp.stats.model.formatter", {
    formatPeriod: function (sYear, sMonth, sWeek) {
      if (!sYear || !sMonth || !sWeek) return "";

      // 문자열을 숫자로 바꿔 0 제거
      const iMonth = parseInt(sMonth, 10);
      const iWeek = parseInt(sWeek, 10);

      return sYear + "년 " + iMonth + "월 " + iWeek + "주차";
    },
  });
});
