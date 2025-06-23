sap.ui.define([], function () {
  "use strict";

  return {
    // ✅ Input 필드 editable 여부 판단
    isEditable(bEditable, bChecked) {
      return bChecked ? false : bEditable;
    },

    // ✅ 행 강조 색상 상태 반환 (Success → 연두색)
    getHighlightState(bChecked) {
      return bChecked ? "Success" : "None";
    },

    getStatus(bPpsts, target) {
      let icon, state, text;
      switch (bPpsts) {
        case "W":
          icon = "sap-icon://warning";
          state = "Warning";
          text = "결재 대기중입니다.";
          break;
        case "A":
          icon = "sap-icon://sys-enter-2";
          state = "Success";
          text = "결재가 완료되었습니다.";
          break;
        case "R":
          icon = "sap-icon://error";
          state = "Error";
          text = "반려되었습니다.";
          break;
      }

      switch (target) {
        case "icon":
          return icon;
        case "state":
          return state;
        case "text":
          return text;
      }
    },
  };
});
