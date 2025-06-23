sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sync/ca/pp/pp/orders/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
  ],
  (Controller, MessageToast, formatter, JSONModel, MessageBox) => {
    "use strict";

    return Controller.extend("sync.ca.pp.pp.orders.controller.Main", {
      formatter: formatter,

      onInit() {
        // 초기 모델 생성 (카운트 0으로)
        this.oModel = new JSONModel({
          AllCount: 0,
          PendingCount: 0,
          ApprovedCount: 0,
          RejectedCount: 0,
        });
        this.getView().setModel(this.oModel, "count");

        this._selectedKey = "All"; // 초기 선택 탭 키값 저장용

        // rowsUpdated 무한 호출 방지용 플래그
        this._bIsInitialLoad = true;

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

        this.aModel = new JSONModel({ MatnrSet: uniqueData });
        this.getView().setModel(this.aModel, "MatnrSet");
      },

      onUpdateFinished(oEvent) {
        // 최초 로딩 시 한번만 실행, 이후 중복 실행 차단
        if (!this._bIsInitialLoad) return;
        this._bIsInitialLoad = false;

        // 초기 로딩 시 전체 카운트 조회 (필터 없이)
        this._updateTabCounts([]);
      },

      onFilterSelect(oEvent) {
        var oView = this.getView();
        var oBinding = this.byId("OrderTable").getBinding("rows");
        var sKey = oEvent.getParameter("key");

        this._selectedKey = sKey;

        // 멀티콤보박스에서 선택된 제품 필터 가져오기
        var oMultiComboBox = oView.byId("idMultiComboBox");
        var aSelectedKeys = oMultiComboBox
          ? oMultiComboBox.getSelectedKeys()
          : [];

        var aFilters = [];

        // 상태 필터 조건 추가
        if (sKey === "Approved") {
          aFilters.push(
            new sap.ui.model.Filter(
              "Posts",
              sap.ui.model.FilterOperator.EQ,
              "A"
            )
          );
        } else if (sKey === "Rejected") {
          aFilters.push(
            new sap.ui.model.Filter(
              "Posts",
              sap.ui.model.FilterOperator.EQ,
              "R"
            )
          );
        } else if (sKey === "Pending") {
          aFilters.push(
            new sap.ui.model.Filter(
              "Posts",
              sap.ui.model.FilterOperator.EQ,
              "W"
            )
          );
        }

        // 제품 멀티콤보박스 필터 조건 추가 (OR 조건)
        if (aSelectedKeys.length > 0) {
          var aOrFilters = aSelectedKeys.map(function (sKey) {
            return new sap.ui.model.Filter(
              "Matnr",
              sap.ui.model.FilterOperator.EQ,
              sKey
            );
          });
          var oOrFilter = new sap.ui.model.Filter({
            filters: aOrFilters,
            and: false,
          });
          aFilters.push(oOrFilter);
        }

        if (!oBinding) return;

        // icon_tab_bar 에서 대기 탭만 클릭했을 때만 버튼 보이게
        var bVisible = sKey === "Pending";
        this.byId("btnApprove").setVisible(bVisible);
        this.byId("btnReject").setVisible(bVisible);

        // 최종 필터 적용
        oBinding.filter(aFilters);

        // 필터 적용 후 카운트 갱신
        // this._updateTabCounts(aFilters);
      },

      onApprove() {
        MessageBox.confirm("승인 하시겠습니까?", {
          title: "Confirmation",
          onClose: (sAction) => {
            if (sAction === MessageBox.Action.OK) {
              this._updateSelectedRows("A"); // 승인 상태 코드
            }
          },
        });
      },

      onReject() {
        MessageBox.confirm("반려 하시겠습니까?", {
          title: "Confirmation",
          onClose: (sAction) => {
            if (sAction === MessageBox.Action.OK) {
              this._updateSelectedRows("R"); // 반려 상태 코드
            }
          },
        });
      },

      _updateSelectedRows: function (sStatus) {
        var oTable = this.byId("OrderTable");
        var aSelectedIndices = oTable.getSelectedIndices();
        if (aSelectedIndices.length === 0) {
          MessageToast.show("선택된 행이 없습니다.");
          return;
        } else if (aSelectedIndices.length > 1) {
          MessageToast.show("하나의 행만 선택해주세요.");
          return;
        }

        var oModel = this.getView().getModel();
        var that = this;
        var iSuccessCount = 0;
        var iErrorCount = 0;

        aSelectedIndices.forEach(function (iIndex) {
          var oContext = oTable.getContextByIndex(iIndex);
          var oData = oContext.getObject();

          var sKey = encodeURIComponent(oData.Aufnr);
          var sPath = "/PPOrderSet('" + sKey + "')";

          var oUpdateData = { Posts: sStatus };

          oModel.update(sPath, oUpdateData, {
            success: function () {
              iSuccessCount++;
              if (iSuccessCount + iErrorCount === aSelectedIndices.length) {
                that._showUpdateResult(iSuccessCount, iErrorCount, sStatus);
                oTable.getBinding("rows").refresh();
                // 업데이트 후 필터 및 카운트 재적용
                that._applyFilters();
              }
            },
            error: function () {
              iErrorCount++;
              if (iSuccessCount + iErrorCount === aSelectedIndices.length) {
                that._showUpdateResult(iSuccessCount, iErrorCount, sStatus);
                oTable.getBinding("rows").refresh();
                that._applyFilters();
              }
            },
          });
        });
      },

      _showUpdateResult: function (iSuccess, iError, sStatus) {
        var sStatusText =
          sStatus === "A" ? "승인" : sStatus === "R" ? "반려" : "변경";
        var sMsg =
          sStatusText +
          " 처리 완료: 성공 " +
          iSuccess +
          "건, 실패 " +
          iError +
          "건";
        MessageToast.show(sMsg);
      },

      onSelectionChange() {
        var oView = this.getView();
        var oMultiComboBox = oView.byId("idMultiComboBox");
        if (!oMultiComboBox) {
          console.error("MultiComboBox 컨트롤을 찾을 수 없습니다.");
          return;
        }

        var aSelectedKeys = oMultiComboBox.getSelectedKeys();
        var aFilters = [];

        if (aSelectedKeys.length > 0) {
          var aOrFilters = aSelectedKeys.map(function (sKey) {
            return new sap.ui.model.Filter(
              "Matnr",
              sap.ui.model.FilterOperator.EQ,
              sKey
            );
          });
          var oFilter = new sap.ui.model.Filter({
            filters: aOrFilters,
            and: false,
          });
          aFilters.push(oFilter);
        }

        var oTable = oView.byId("OrderTable");
        var oBinding = oTable.getBinding("rows");
        if (oBinding) {
          oBinding.filter(aFilters);
          this._updateTabCounts(aFilters);
        } else {
          console.error("테이블 바인딩을 찾을 수 없습니다.");
        }
      },
      _applyFilters() {
        var oView = this.getView();
        var oTable = oView.byId("OrderTable");
        var oBinding = oTable.getBinding("rows");

        var aFilters = [];

        // 아이콘 탭 필터
        if (this._selectedKey === "Approved") {
          aFilters.push(
            new sap.ui.model.Filter(
              "Posts",
              sap.ui.model.FilterOperator.EQ,
              "A"
            )
          );
        } else if (this._selectedKey === "Rejected") {
          aFilters.push(
            new sap.ui.model.Filter(
              "Posts",
              sap.ui.model.FilterOperator.EQ,
              "R"
            )
          );
        } else if (this._selectedKey === "Pending") {
          aFilters.push(
            new sap.ui.model.Filter(
              "Posts",
              sap.ui.model.FilterOperator.EQ,
              "W"
            )
          );
        }

        // 멀티콤보 필터
        if (this._selectedMatnrKeys.length > 0) {
          var aOrFilters = this._selectedMatnrKeys.map(function (sKey) {
            return new sap.ui.model.Filter(
              "Matnr",
              sap.ui.model.FilterOperator.EQ,
              sKey
            );
          });
          aFilters.push(
            new sap.ui.model.Filter({ filters: aOrFilters, and: false })
          );
        }

        if (oBinding) {
          oBinding.filter(aFilters);
          this._updateTabCounts(aFilters);
        }
      },
      _updateTabCounts: function (aFilters) {
        var oModel = this.getView().getModel();

        // 필터 조건에 맞춰 OData 조회(카운트만)
        oModel.read("/PPOrderSet", {
          filters: aFilters,
          success: (oData) => {
            var aData = Array.isArray(oData.results) ? oData.results : [];
            var oCounts = {
              AllCount: aData.length,
              PendingCount: 0,
              ApprovedCount: 0,
              RejectedCount: 0,
            };

            aData.forEach(function (o) {
              switch (o.Posts) {
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

            this.getView().getModel("count").setData(oCounts);
          },
          error: (err) => {
            sap.m.MessageToast.show("카운트 조회 중 오류가 발생했습니다.");
            console.error(err);
          },
        });
      },
    });
  }
);
