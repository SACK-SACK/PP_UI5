sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sync/ca/pp/pp/approve/model/formatter",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
  ],
  function (Controller, formatter, MessageToast, Fragment, MessageBox) {
    return Controller.extend("sync.ca.pp.pp.approve.controller.Detail", {
      formatter: formatter,
      onInit() {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("RouteDetail")
          .attachPatternMatched(this._onPatternMatched, this);
      },
      onFlexClose: function () {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("RouteMain", { layout: "OneColumn" });
      },
      onAccept() {
        const sPlnum = this.getView().getBindingContext().getProperty("Plnum");
        const oModel = this.getView().getModel();

        MessageBox.confirm("계획번호: " + sPlnum + " 승인하시겠습니까?", {
          title: "생산계획 승인",
          icon: sap.m.MessageBox.Icon.SUCCESS,
          onClose: (oAction) => {
            if (oAction === "OK") {
              MessageToast.show("test: 승인");
              // 🔁 Gateway의 update 메서드 호출
              const sPath = "/PlanHeaderSet('" + sPlnum + "')";
              const oUpdatedData = { Plnum: sPlnum, Ppsts: "A" };

              oModel.update(sPath, oUpdatedData, {
                success: () => {
                  MessageToast.show("승인 완료");
                  this.onFlexClose();
                },
                error: (oError) => {
                  MessageToast.show("오류 발생");
                  console.error(oError);
                },
              });
              oModel.refresh(true); // true → 강제 fetch from backend
              this.onFlexClose();
            }
          },
        });
      },
      onReject: function () {
        if (!this._oRejectDialog) {
          Fragment.load({
            id: "rejectFragment",
            name: "sync.ca.pp.pp.approve.view.Reject",
            controller: this,
          }).then(
            function (oDialog) {
              this._oRejectDialog = oDialog;
              this.getView().addDependent(oDialog);

              // ✅ 모델 초기화
              const oRejectModel = new sap.ui.model.json.JSONModel({
                reason: "",
              });
              this.getView().setModel(oRejectModel, "rejectModel");

              this._oRejectDialog.open();
            }.bind(this)
          );
        } else {
          // 열 때마다 리셋
          this.getView().getModel("rejectModel").setProperty("/reason", "");
          this._oRejectDialog.open();
        }
      },
      _onPatternMatched: function (oEvent) {
        var sPlnum = oEvent.getParameter("arguments").Plnum;

        var oModel = this.getOwnerComponent().getModel(); // ODataModel
        var sItemPath = "/PlanHeaderSet('" + sPlnum + "')/PlanInfo";
        var sHeaderPath = "/PlanHeaderSet('" + sPlnum + "')";

        oModel.read(sItemPath, {
          success: (oData) => {
            const aProcessedData = oData.results.map((item, index) => ({
              ...item,
              Checked: false,
              Editable: index === 0, // 첫 번째 항목만 체크 가능
            }));

            // 추가로 전체 체크 상태 추적용 속성 추가
            const oFinalData = {
              items: aProcessedData,
              __allChecked: false,
            };

            // JSON 모델 설정
            const oJsonModel = new sap.ui.model.json.JSONModel(oFinalData);

            this.getView().setModel(oJsonModel, "planInfo");

            // ✅ 여기서 row count 설정
            const oRowMode = this.byId("idRowMode");
            if (oRowMode && oRowMode.setMinRowCount) {
              oRowMode.setMinRowCount(aProcessedData.length);
            }

            // ✅ 타이틀 지정
            this.byId("idDetailTitle").setText(sPlnum + " 생산계획 세부정보");
            this.getView().bindElement({
              path: sHeaderPath,
            });
            oModel.read(sHeaderPath, {
              success: (oHeaderData) => {
                if (oHeaderData.Ppsts === "R") {
                  this.loadRejectionReason(sPlnum); // 💡 여기서 Feed 모델 바인딩
                }
              },
              error: (err) => {
                console.error("PlanHeaderSet 상태 조회 실패", err);
              },
            });
          },
          error: (oError) => {
            console.error("PlanInfo 읽기 실패:", oError);
          },
        });
      },

      onRejectConfirm: function (oEvent) {
        const sPlnum = this.getView().getBindingContext().getProperty("Plnum");
        const oModel = this.getView().getModel();

        MessageBox.confirm("계획번호: " + sPlnum + " 반려처리하시겠습니까?", {
          title: "생산계획 반려",
          icon: sap.m.MessageBox.Icon.ERROR,
          onClose: (oAction) => {
            if (oAction === "OK") {
              const sPath = "/PlanHeaderSet('" + sPlnum + "')/PlanRejectSet";
              const sReason = this.getView()
                .getModel("rejectModel")
                .getProperty("/reason");

              const oPostData = {
                Plnum: sPlnum,
                Discription: sReason,
              };

              oModel.create(sPath, oPostData, {
                success: () => {
                  MessageToast.show("반려 완료");

                  // ✅ 모델 강제 갱신
                  oModel.refresh(true);

                  this.onRejectCancel();
                  this.onFlexClose();
                },
                error: (oError) => {
                  MessageToast.show("오류 발생");
                  console.error(oError);
                },
              });
            }
          },
        });
      },

      onRejectCancel: function () {
        if (this._oRejectDialog) {
          this._oRejectDialog.close();
        }
      },
      onRejectTextChange: function (oEvent) {
        const sValue = oEvent.getParameter("value");
        const oButton = sap.ui.core.Fragment.byId(
          "rejectFragment",
          "confirmRejectButton"
        );
        if (oButton) {
          oButton.setEnabled(sValue.trim().length > 0);
        }
      },
      onSelectAllChecked: function (oEvent) {
        const bSelected = oEvent.getParameter("selected");
        const oModel = this.getView().getModel("planInfo");
        const aItems = oModel.getProperty("/items");

        // 모든 항목에 Checked 값 설정
        aItems.forEach((item) => {
          item.Checked = bSelected;
        });

        // 전체 체크 상태도 갱신
        oModel.setProperty("/__allChecked", bSelected);
        oModel.refresh();
      },
      loadRejectionReason: function (sPlnum) {
        const oModel = this.getView().getModel(); // ODataModel
        const sPath = "/PlanRejectSet('" + sPlnum + "')"; // 단건 조회 URI

        oModel.read(sPath, {
          success: (oData) => {
            const oFeedData = {
              Discription: oData.Discription || "",
            };
            const oFeedModel = new sap.ui.model.json.JSONModel(oFeedData);
            this.getView().setModel(oFeedModel, "rejectFeed");
          },
          error: function (oError) {
            console.error("반려 사유 조회 실패", oError);
          },
        });
      },
    });
  }
);
