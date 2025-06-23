sap.ui.define(["sap/ui/core/mvc/Controller"], (BaseController) => {
  "use strict";

  return BaseController.extend("sync.ca.pp.pp.approve.controller.App", {
    onInit() {
      var oRouter = this.getOwnerComponent().getRouter();

      // Manifest.json에서 Route의 경로가 일치하기 전에 () 안의 Function이 실행된다.
      oRouter.attachBeforeRouteMatched(this.onBeforeRouteMatched, this);

      // Manifest.json에서 Route의 경로가 일치하면 () 안의 Function이 실행된다.
      oRouter.attachRouteMatched(this.onRouteMatched, this);
    },

    onBeforeRouteMatched: function (oEvent) {
      // oEvent 는 경로에 대한 정보를 갖고 있다.

      var oArgs = oEvent.getParameter("arguments");
      var layout = oArgs.layout;

      if (!layout) {
        var oLayoutInfo = this.getOwnerComponent().getFlexibleLayoutInfo();
        layout = oLayoutInfo.getNextUIState(0).layout; // "OneColumn"
        // layout = oLayoutInfo.getNextUIState(1).layout; // "TwoColumns"
      }

      if (layout) {
        var oModelApp = this.getOwnerComponent().getModel("app");
        oModelApp.setProperty("/layout", layout);
      }
    },

    onRouteMatched: function (oEvent) {
      // oEvent 는 경로에 대한 정보를 갖고 있다.
      var oRouteName = oEvent.getParameter("name"); // RouteMain or RouteDetail
      var oArgs = oEvent.getParameter("arguments");

      var oModelApp = this.getOwnerComponent().getModel("app");
      var oUIState = this.getOwnerComponent()
        .getFlexibleLayoutInfo()
        .getCurrentUIState();
      oModelApp.setData(oUIState);

      // 현재 화면이 RouteMain 인지 RouteDetail 인지 App Contoller의 전역멤버로 관리한다.
      this.currentRouteName = oRouteName;
    },

    onStateChanged: function (oEvent) {
      var isNavigationArrow = oEvent.getParameter("isNavigationArrow");
      var layout = oEvent.getParameter("layout");

      var oModelApp = this.getOwnerComponent().getModel("app");
      var oUIState = this.getOwnerComponent()
        .getFlexibleLayoutInfo()
        .getCurrentUIState();
      oModelApp.setData(oUIState);

      if (isNavigationArrow) {
        this.getOwnerComponent().getRouter().navTo(this.currentRouteName, {
          layout: layout,
        });
      }
    },
  });
});
