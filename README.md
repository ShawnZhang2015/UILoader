UILoader
========

This is a cocos2d-js ui load tool.

## 快速使用
GameLayer = cc.Layer.extend({

	ctor: function() {
		this._super();

		//"res/DemoLogin.ExportJson" 为cocostudio UI编辑器输出的UI配置文件,
		sz.uiloader.widgetFromJsonFile(this, "res/DemoLogin.ExportJson");

		//"_loginButton"是在UI编辑时设置的某个控件名字, 必须以下划线("_")开始.
		cc.assert(this._loginButton.getName() === "_loginButton");
	},

    //以"_on+<控件名首字母大写>+<事件名>"定义事件响应函数
	_onLoginButtonTouchBegan: function(sender) {
	    cc.log(sender.getNode());
	}
})

