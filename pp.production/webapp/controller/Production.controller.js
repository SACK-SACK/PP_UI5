sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sync/ca/pp/pp/production/formatter",
    "sap/ui/model/json/JSONModel",
  ],
  function (Controller, formatter, JSONModel) {
    "use strict";

    return Controller.extend("sync.ca.pp.pp.production.controller.Production", {
      formatter: formatter,

      onInit: function () {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("production")
          .attachMatched(this._onRouteMatched, this);

        var oModel = this.getOwnerComponent().getModel();
        this.getView().setModel(oModel, "production");

        var routingdData = {
          RT000001: [
            {
              Seq: "00000001",
              WC: "WC001",
              Wcnam: "절단기",
              Order: 1,
              Process: "절단공정",
            },
            {
              Seq: "00000002",
              WC: "WC002",
              Wcnam: "세척기",
              Order: 2,
              Process: "세척공정",
            },
            {
              Seq: "00000003",
              WC: "WC003",
              Wcnam: "절임탱크",
              Order: 3,
              Process: "절임공정",
            },
            {
              Seq: "00000004",
              WC: "WC002",
              Wcnam: "세척기",
              Order: 4,
              Process: "탈염공정",
            },
            {
              Seq: "00000005",
              WC: "WC007",
              Wcnam: "반제품 검사실",
              Order: 5,
              Process: "반제품검수",
            },
          ],
          RT000002: [
            {
              Seq: "00000001",
              WC: "WC004",
              Wcnam: "배합기",
              Order: 1,
              Process: "배합공정",
            },
            {
              Seq: "00000002",
              WC: "WC007",
              Wcnam: "반제품 검사실",
              Order: 2,
              Process: "반제품검수",
            },
          ],
          RT000003: [
            {
              Seq: "00000001",
              WC: "WC004",
              Wcnam: "배합기",
              Order: 1,
              Process: "배합공정",
            },
            {
              Seq: "00000002",
              WC: "WC007",
              Wcnam: "반제품 검사실",
              Order: 2,
              Process: "반제품검수",
            },
          ],
          RT000004: [
            {
              Seq: "00000001",
              WC: "WC005",
              Wcnam: "배합실",
              Order: 1,
              Process: "버무림공정",
            },
            {
              Seq: "00000002",
              WC: "WC008",
              Wcnam: "완제품 검사실",
              Order: 2,
              Process: "완제품검수",
            },
          ],
          RT000005: [
            {
              Seq: "00000001",
              WC: "WC005",
              Wcnam: "배합실",
              Order: 1,
              Process: "버무림공정",
            },
            {
              Seq: "00000002",
              WC: "WC008",
              Wcnam: "완제품 검사실",
              Order: 2,
              Process: "완제품검수",
            },
          ],
          RT000006: [
            {
              Seq: "00000001",
              WC: "WC001",
              Wcnam: "절단기",
              Order: 1,
              Process: "절단공정",
            },
            {
              Seq: "00000002",
              WC: "WC002",
              Wcnam: "세척기",
              Order: 2,
              Process: "세척공정",
            },
            {
              Seq: "00000003",
              WC: "WC005",
              Wcnam: "배합실",
              Order: 3,
              Process: "버무림공정",
            },
            {
              Seq: "00000004",
              WC: "WC008",
              Wcnam: "완제품 검사실",
              Order: 4,
              Process: "완제품검수",
            },
          ],
          RT000007: [
            {
              Seq: "00000001",
              WC: "WC001",
              Wcnam: "절단기",
              Order: 1,
              Process: "절단공정",
            },
            {
              Seq: "00000002",
              WC: "WC002",
              Wcnam: "세척기",
              Order: 2,
              Process: "세척공정",
            },
            {
              Seq: "00000003",
              WC: "WC005",
              Wcnam: "배합실",
              Order: 3,
              Process: "버무림공정",
            },
            {
              Seq: "00000004",
              WC: "WC008",
              Wcnam: "완제품 검사실",
              Order: 4,
              Process: "완제품검수",
            },
          ],
        };
        var oRoutingModel = new JSONModel(routingdData);
        this.getView().setModel(oRoutingModel, "routing");

        var bomHeaderData = [
          { STLNR: "BM001", MATNR: "MAT40001", BMENG: 1.0, BMEIN: "KG" },
          { STLNR: "BM002", MATNR: "MAT30002", BMENG: 2.0, BMEIN: "EA" },
          { STLNR: "BM003", MATNR: "MAT40002", BMENG: 1.0, BMEIN: "KG" },
          { STLNR: "BM004", MATNR: "MAT40003", BMENG: 1.0, BMEIN: "KG" },
          { STLNR: "BM005", MATNR: "MAT40004", BMENG: 1.0, BMEIN: "KG" },
          { STLNR: "BM006", MATNR: "MAT30001", BMENG: 1.0, BMEIN: "KG" },
          { STLNR: "BM007", MATNR: "MAT30003", BMENG: 1.0, BMEIN: "KG" },
        ];
        var oBomHeaderModel = new JSONModel(bomHeaderData);
        this.getView().setModel(oBomHeaderModel, "bomHeader");

        var bomItemData = [
          {
            STLNR: "BM001",
            POSNR: "000001",
            IDNRK: "MAT30001",
            MENGE: 0.4,
            MEINS: "KG",
          },
          {
            STLNR: "BM001",
            POSNR: "000002",
            IDNRK: "MAT30002",
            MENGE: 2.0,
            MEINS: "EA",
          },
          {
            STLNR: "BM002",
            POSNR: "000001",
            IDNRK: "MAT10009",
            MENGE: 0.2,
            MEINS: "KG",
          },
          {
            STLNR: "BM002",
            POSNR: "000002",
            IDNRK: "MAT10001",
            MENGE: 1.0,
            MEINS: "EA",
          },
          {
            STLNR: "BM007",
            POSNR: "000009",
            IDNRK: "MAT10006",
            MENGE: 0.5,
            MEINS: "EA",
          },
        ];
        var oBomItemModel = new JSONModel(bomItemData);
        this.getView().setModel(oBomItemModel, "bomItem");
      },

      _onRouteMatched: function (oEvent) {
        var sAufnr = oEvent.getParameter("arguments").Aufnr;
        if (!sAufnr) return;

        var sPath = "/ZCA_CDS_V_006('" + sAufnr + "')";
        var oView = this.getView();

        // production 모델 바인딩
        oView.bindElement({ path: sPath, model: "production" });

        var oProductionModel = oView.getModel("production");
        var oRoutingModel = oView.getModel("routing");
        var oBomHeaderModel = oView.getModel("bomHeader");
        var oBomItemModel = oView.getModel("bomItem");

        oProductionModel.read(sPath, {
          success: function (oData) {
            var sPlnnr = oData.Plnnr; // 공정번호
            var sMatnr = oData.Matnr; // 자재번호

            // 공정 테이블 바인딩
            var oTable = oView.byId("idProductsTable");
            if (sPlnnr && oTable) {
              oTable.unbindItems();
              var oTemplate = new sap.m.ColumnListItem({
                cells: [
                  new sap.m.Text({ text: "{routing>Order}" }),
                  new sap.m.Text({ text: "{routing>Process}" }),
                  new sap.m.Text({ text: "{routing>WC}" }),
                  new sap.m.Text({ text: "{routing>Wcnam}" }),
                ],
              });
              oTable.bindItems({
                path: "routing>/" + sPlnnr,
                template: oTemplate,
              });
            }

            // bomHeaderModel 은 배열 유지, find 로 단일 BOM 찾기
            var aBomHeaders = oBomHeaderModel.getData();
            var oMatchedBom = Array.isArray(aBomHeaders)
              ? aBomHeaders.find((item) => item.MATNR === sMatnr)
              : null;

            if (oMatchedBom) {
              // 단일 BOM 정보만 별도 모델로 생성
              oView.setModel(new JSONModel(oMatchedBom), "bomHeaderSelected");

              // BOM 아이템 필터링
              var aBomItems = oBomItemModel.getData();
              var aFilteredItems = aBomItems.filter(
                (item) => item.STLNR === oMatchedBom.STLNR
              );
              oView.setModel(new JSONModel(aFilteredItems), "bomItem");
            } else {
              oView.setModel(new JSONModel({}), "bomHeaderSelected");
              oView.setModel(new JSONModel([]), "bomItem");
            }
          },
          error: function () {
            sap.m.MessageToast.show("데이터 조회 실패");
          },
        });
      },

      onNavButtonPressed: function () {
        var oHistory = sap.ui.core.routing.History.getInstance();
        var sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("RouteMain", {}, true);
        }
      },
    });
  }
);
