sap.ui.define([
    "sap/ui/core/UIComponent",
    "sync/ca/pp/pp/orders/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("sync.ca.pp.pp.orders.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);
            
            // CSS 파일 로딩
            jQuery.sap.includeStyleSheet("css/style.css");

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();
        }
    });
});