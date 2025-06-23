sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
  ],
  (Controller, Filter, JSONModel, MessageToast) => {
    "use strict";

    return Controller.extend("sync.ca.pp.pp.approve.controller.Main", {
      onInit() {
        // 초기 상태 기억 변수
        this._oFilterBarFilters = [];
        this.oModel = new JSONModel({
          AllCount: 0,
          PendingCount: 0,
          ApprovedCount: 0,
          RejectedCount: 0,
        });
        this.getView().setModel(this.oModel, "count");

        this.getOwnerComponent()
          .getRouter()
          .attachRouteMatched(this._onRouteMatched, this);
      },
      _onRouteMatched(oEvent) {
        if (oEvent.getParameter("name") === "RouteMain") {
          // 메인으로 돌아오면 무조건 초기화
          this._bSkipCountUpdate = false;
        }
      },

      onFilterSelect(oEvent) {
        let sKey = oEvent.getParameter("key");
        this._sIconTabKey = sKey;
        this._bSkipCountUpdate = true; // 필터 검색으로 count 갱신된 경우 → 건너뜀

        this._applyCombinedFilters();
      },
      onListItemPress(oEvent) {
        this._bSkipCountUpdate = true; // 상세 화면으로 이동 시 count 갱신 건너뜀
        let oData = oEvent
          .getParameter("listItem")
          .getBindingContext()
          .getObject();

        var oUIState = {
          layout: "TwoColumnsBeginExpanded",
        };

        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("RouteDetail", {
          Plnum: oData.Plnum,
          layout: oUIState.layout,
        });
      },
      onUpdateFinished(oEvent) {
        if (this._bSkipCountUpdate) {
          console.log("현재 상태", this._bSkipCountUpdate);
          this._bSkipCountUpdate = false;
          console.log("변경된 상태", this._bSkipCountUpdate);
          return;
        }

        const oModel = this.getOwnerComponent().getModel();

        oModel.read("/PlanHeaderSet", {
          success: (oData) => {
            const oAllCounts = this._calculateCounts(oData.results);

            // 필터 조건이 없을 경우에만 전체 count를 바로 반영
            const bHasFilter =
              this._oFilterBarFilters && this._oFilterBarFilters.length > 0;

            if (!bHasFilter) {
              this.getView().getModel("count").setData(oAllCounts);
            }

            // 무조건 필터 기준 count 갱신 → 이게 최종 결과
            this._refreshCountsByFilterBarOnly(this._oFilterBarFilters);
          },
          error: (err) => {
            MessageToast.show("카운트 조회 중 오류가 발생했습니다.");
            console.error(err);
          },
        });
      },
      onSearch: function (oEvent) {
        const oFilterBar = this.byId("filterbar");
        const oTable = this.byId("idProducts");
        const oBinding = oTable.getBinding("items");

        const aFilters = [];

        // 생산계획 ID (MultiComboBox)
        const oMCBox = this.byId("idMultiComboBox");
        const aSelectedKeys = oMCBox.getSelectedKeys();

        if (aSelectedKeys.length > 0) {
          const oFilterPlnum = new sap.ui.model.Filter({
            path: "Plnum",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: aSelectedKeys[0],
          });

          if (aSelectedKeys.length === 1) {
            aFilters.push(oFilterPlnum);
          } else {
            // 여러 개 선택된 경우 Filter.or()
            const aPlnumFilters = aSelectedKeys.map((sKey) => {
              return new sap.ui.model.Filter(
                "Plnum",
                sap.ui.model.FilterOperator.EQ,
                sKey
              );
            });
            aFilters.push(
              new sap.ui.model.Filter({
                filters: aPlnumFilters,
                and: false,
              })
            );
          }

          this._bSkipCountUpdate = true;
        }

        // 생산계획일 (DateRangeSelection)
        const oDateRange = this.byId("idDateRangeSelection");
        const oDateFrom = oDateRange.getDateValue(); // 시작일
        const oDateTo = oDateRange.getSecondDateValue(); // 종료일

        if (oDateFrom && oDateTo) {
          aFilters.push(
            new sap.ui.model.Filter({
              path: "Psttr",
              operator: sap.ui.model.FilterOperator.BT,
              value1: oDateFrom,
              value2: oDateTo,
            })
          );
        } else if (oDateFrom) {
          aFilters.push(
            new sap.ui.model.Filter(
              "Psttr",
              sap.ui.model.FilterOperator.GE,
              oDateFrom
            )
          );
        } else if (oDateTo) {
          aFilters.push(
            new sap.ui.model.Filter(
              "Psttr",
              sap.ui.model.FilterOperator.LE,
              oDateTo
            )
          );
        }

        // 상태 저장
        this._oFilterBarFilters = aFilters;
        this._bForceFilterApply = true; // 👉 강제 필터 적용
        this._bSkipCountUpdate = true;
        // 병합하여 테이블에 적용
        this._applyCombinedFilters();
      },
      _applyCombinedFilters: function () {
        const oBinding = this.byId("idProducts").getBinding("items");
        const aCombinedFilters = [];

        if (this._oFilterBarFilters?.length) {
          aCombinedFilters.push(...this._oFilterBarFilters);
        }

        switch (this._sIconTabKey) {
          case "approve":
            aCombinedFilters.push(new Filter("Ppsts", "EQ", "A"));
            break;
          case "wait":
            aCombinedFilters.push(new Filter("Ppsts", "EQ", "W"));
            break;
          case "reject":
            aCombinedFilters.push(new Filter("Ppsts", "EQ", "R"));
            break;
        }

        const sFilterKey = JSON.stringify(
          aCombinedFilters.map(
            (f) => f.sPath + f.sOperator + f.oValue1 + (f.oValue2 || "")
          )
        );

        // ✅ 무조건 새로 필터링해야 하면 강제로 통과
        if (!this._bForceFilterApply && this._oLastAppliedFilter === sFilterKey)
          return;
        this._oLastAppliedFilter = sFilterKey;
        this._bForceFilterApply = false;

        oBinding.filter(aCombinedFilters);
        if (this._bSkipCountUpdate) {
          this._refreshCountsByFilterBarOnly(this._oFilterBarFilters);
        }
      },
      _refreshCountsByFilterBarOnly: function (aFilterBarFilters) {
        const oModel = this.getView().getModel();
        const oCountModel = this.getView().getModel("count");

        oModel.read("/PlanHeaderSet", {
          filters: aFilterBarFilters,
          success: (oData) => {
            const oNewCounts = this._calculateCounts(oData.results || []);
            const oOldCounts = oCountModel.getData() || {};

            const bIsSame =
              oOldCounts.AllCount === oNewCounts.AllCount &&
              oOldCounts.ApprovedCount === oNewCounts.ApprovedCount &&
              oOldCounts.RejectedCount === oNewCounts.RejectedCount &&
              oOldCounts.PendingCount === oNewCounts.PendingCount;

            if (!bIsSame) {
              oCountModel.setData(oNewCounts);
            }
          },
          error: (err) => {
            MessageToast.show("카운트 조회 실패");
          },
        });
      },

      _calculateCounts(aData) {
        const oCounts = {
          AllCount: aData.length,
          ApprovedCount: 0,
          RejectedCount: 0,
          PendingCount: 0,
        };

        aData.forEach((o) => {
          switch (o.Ppsts) {
            case "A":
              oCounts.ApprovedCount++;
              break;
            case "R":
              oCounts.RejectedCount++;
              break;
            case "W":
              oCounts.PendingCount++;
              break;
          }
        });

        return oCounts;
      },
    });
  }
);
