
GameLayer = cc.Layer.extend({
	
	ctor: function() {
		this._super();
		UILoader.widgetFromJsonFile(this, "res/DemoLogin.ExportJson");
		cc.assert(this._loginButton.getName() === "_loginButton");
		cc.assert(this._closeButton.getName() === "_closeButton");
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

	_onCloseButtonTouchBegan: function() {
		cc.log("onCloseButtonTouchBegan");
	},

	_onLoginButtonTouchEnded: function(sender) {
		this._nameTextField.string = "userName";
	},

	_onNameTextFieldInsertText: function(sender) {
		cc.log(sender.string);
	},

	_onAgreeCheckBoxSelected: function(sender, type) {
		cc.log("_onAgreeCheckBoxEvent:" + type);
	}
});

