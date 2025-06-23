sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sync/ca/pp/pp/approve/model/models",
    "sap/f/FlexibleColumnLayoutSemanticHelper",
  ],
  (UIComponent, models, FCLSemanticHelper) => {
    "use strict";

    return UIComponent.extend("sync.ca.pp.pp.approve.Component", {
      metadata: {
        manifest: "json",
        interfaces: ["sap.ui.core.IAsyncContentCreation"],
      },

      init() {
        // call the base component's init function
        UIComponent.prototype.init.apply(this, arguments);

        // set the device model
        this.setModel(models.createDeviceModel(), "device");

        // enable routing
        this.getRouter().initialize();

        // App View 에서 사용하는 모델 추가
        var oData = {
          layout: null,
        };
        // layout 은 사용자의 행동에 따라서
        // OneColumn <--> TwoColumnsMidExpanded
        var oJsonModel = new sap.ui.model.json.JSONModel(oData);

        this.setModel(oJsonModel, "app");
        // 앱 첫 로드시 항상 초기 layout으로 이동
        var oRouter = this.getRouter();

        var bIsReload = false;
        var perfEntries = performance.getEntriesByType("navigation");

        if (perfEntries.length > 0 && perfEntries[0].type === "reload") {
          bIsReload = true;
        }

        if (bIsReload) {
          oRouter.navTo(
            "RouteMain",
            {
              layout: "OneColumn",
            },
            {
              replace: true,
            }
          );
        }
      },

      getFlexibleLayoutInfo() {
        var oFlexible = this.getRootControl().byId("fclId");
        var oSettings = {
          defaultTwoColumnLayoutType: sap.f.LayoutType.TwoColumnsMidExpanded, // "TwoColumnsMidExpanded",
          initialColumnsCount: 1,
          maxColumnsCount: 2,
        };

        // var oParams = JQuery.sap.getUriParameters();

        var urlParams = new URLSearchParams(window.location.search);
        var sMode = urlParams.get("mode");
        var iInitialColumnsCount = urlParams.get("initial");
        var imaxColumnsCount = urlParams.get("max");

        oSettings = {
          defaultTwoColumnLayoutType: sap.f.LayoutType.TwoColumnsMidExpanded,
          mode: sMode,
          initialColumnsCount: iInitialColumnsCount,
          maxColumnsCount: imaxColumnsCount,
        };

        var oHelper = FCLSemanticHelper.getInstanceFor(oFlexible, oSettings);
        // new Class
        // Class.getInstance~~~
        return oHelper;
      },
    });
  }
);
