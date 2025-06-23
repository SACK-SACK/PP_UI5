sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sync/ca/pp/pp/production/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
  ],
  function (Controller, formatter, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("sync.ca.pp.pp.production.controller.Main", {
      formatter: formatter,

      onInit: function () {
        var aData = [
          { Matnr: "MAT40001", Maktx: "배추김치" },
          { Matnr: "MAT40002", Maktx: "백김치" },
          { Matnr: "MAT40003", Maktx: "깍두기" },
          { Matnr: "MAT40004", Maktx: "파김치" },
          { Matnr: "MAT30001", Maktx: "양념 (배추김치)" },
          { Matnr: "MAT30003", Maktx: "양념 (백김치)" },
          { Matnr: "MAT30002", Maktx: "절임배추" },
        ];

        // Matnr 기준 중복 제거
        var uniqueMap = new Map();
        aData.forEach(function (item) {
          if (!uniqueMap.has(item.Matnr)) {
            uniqueMap.set(item.Matnr, item);
          }
        });

        var uniqueData = Array.from(uniqueMap.values());

        this.oModel = new JSONModel({ MatnrSet: uniqueData });
        this.getView().setModel(this.oModel, "MatnrSet");
      },
      onListItemPress: function (oEvent) {
        // 선택된 리스트 아이템 바인딩 컨텍스트 가져오기
        var oListItem = oEvent.getSource();
        var oContext = oListItem.getBindingContext(); 

        // 컨텍스트에서 Aufnr 값 추출
        var sAufnr = oContext.getProperty("Aufnr");

        // 라우터로 네비게이션, 경로에 Aufnr 값 전달
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("production", {
          Aufnr: sAufnr,
        });
      },
      onSearch: function () {
        var oView = this.getView();
        var oDateRangeSelection = oView.byId("idDateRangeSelection");

        var oDateFrom = oDateRangeSelection.getDateValue(); // 시작일
        var oDateTo = oDateRangeSelection.getSecondDateValue(); // 종료일

        var aFilters = [];

        // 생산오더 ID 필터 (멀티콤보박스)
        var oMultiComboBox1 = oView.byId("idMultiComboBox");
        var aSelectedKeys1 = oMultiComboBox1.getSelectedKeys();
        if (aSelectedKeys1.length > 0) {
          var aOrFilters1 = aSelectedKeys1.map(function (sKey) {
            return new sap.ui.model.Filter(
              "Aufnr",
              sap.ui.model.FilterOperator.EQ,
              sKey
            );
          });
          aFilters.push(
            new sap.ui.model.Filter({ filters: aOrFilters1, and: false })
          );
        }

        // 생산제품 필터 (멀티콤보박스)
        var oMultiComboBox2 = oView.byId("idMultiComboBox2");
        var aSelectedKeys2 = oMultiComboBox2.getSelectedKeys();
        if (aSelectedKeys2.length > 0) {
          var aOrFilters2 = aSelectedKeys2.map(function (sKey) {
            return new sap.ui.model.Filter(
              "Matnr",
              sap.ui.model.FilterOperator.EQ,
              sKey
            );
          });
          aFilters.push(
            new sap.ui.model.Filter({ filters: aOrFilters2, and: false })
          );
        }

        // 날짜 범위 필터
        if (oDateFrom && oDateTo) {
          var oDateFromStart = new Date(oDateFrom);
          oDateFromStart.setHours(0, 0, 0, 0);

          var oDateToEnd = new Date(oDateTo);
          oDateToEnd.setHours(23, 59, 59, 999);

          aFilters.push(
            new sap.ui.model.Filter(
              "Psday",
              sap.ui.model.FilterOperator.BT,
              oDateFromStart,
              oDateToEnd
            )
          );
        } else if (oDateFrom) {
          var oDateFromStart = new Date(oDateFrom);
          oDateFromStart.setHours(0, 0, 0, 0);

          var oDateFromEnd = new Date(oDateFrom);
          oDateFromEnd.setHours(23, 59, 59, 999);

          aFilters.push(
            new sap.ui.model.Filter(
              "Psday",
              sap.ui.model.FilterOperator.BT,
              oDateFromStart,
              oDateFromEnd
            )
          );
        }

        // AND 조건 결합
        var oFinalFilter = null;
        if (aFilters.length === 1) {
          oFinalFilter = aFilters[0];
        } else if (aFilters.length > 1) {
          oFinalFilter = new sap.ui.model.Filter({
            filters: aFilters,
            and: true,
          });
        }

        // 테이블 바인딩 필터 적용
        var oTable = oView.byId("idList");
        var oBinding = oTable.getBinding("items");
        if (oBinding) {
          oBinding.filter(oFinalFilter ? [oFinalFilter] : []);
        } else {
          sap.m.MessageToast.show("테이블 바인딩을 찾을 수 없습니다.");
        }
      },
    });
  }
);
