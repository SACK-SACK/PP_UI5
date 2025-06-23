sap.ui.define(
  ["sap/ui/core/UIComponent", "sync/ca/pp/pp/production/model/models"],
  (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("sync.ca.pp.pp.production.Component", {
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
      },
    });
  }
);
