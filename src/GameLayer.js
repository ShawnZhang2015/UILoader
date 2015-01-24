
GameLayer = cc.LayerColor.extend({
	
	ctor: function() {
		this._super(cc.color.GREEN);
		sz.uiloader.widgetFromJsonFile(this, "res/DemoLogin.ExportJson", {eventPerfix:"_on", memberPrefix:"_"} );
		//cc.assert(this._loginButton.getName() === "_loginButton");
		//cc.assert(this._closeButton.getName() === "_closeButton");
	},

	_onLoginButtonEvent: function(sender, type) {
		switch (type) {
			case 0:
				cc.log("_onLoginButtonEvent: began");
				break;
			case 1:
				cc.log("_onLoginButtonEvent: move");
				break;
			case 2:
				cc.log("_onLoginButtonEvent: end");
				break;
		}
	},

	_onCloseButtonTouchBegan: function(sender) {
		cc.log("_onCloseButtonTouchBegan");
	},

	_onCloseButtonTouchEnded: function(sender) {
		cc.log("_onCloseButtonTouchEnded");
	},

	_onLoginButtonTouchEnded: function(sender) {
		this._nameTextField.string = "userName";
	},

	_onNameTextFieldInsertText: function(sender) {
		cc.log(sender.string);
	},

	_onAgreeCheckBoxSelected: function(sender) {
		cc.log("_onAgreeCheckBoxSelected");
	},

	_onAgreeCheckBoxUnselected: function(sender) {
		cc.log("_onAgreeCheckBoxUnselected");
	},

	_onNameLabelTouchBegan: function() {
		cc.log("_onNameLabelTouchBegan");
	}
});
