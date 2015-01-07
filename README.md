sz.UILoader
========

This is a cocos2d-js ui load tool.

## 快速使用
```javascript
var GameLayer = cc.Layer.extend({
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
});
```

##默认命名约定
事件命名默认按照cocos2d-js源码风格，成员变量、私有函数是在驼峰命名法前加“_”例如:

>_button
>_nameLabel
>_onLogin
>onCloseButtonTouchEnded

控件事件名由：**前缀 + 控件名（去下划线） + 事件名** 构成 	

##自定义前缀
	
函数**sz.uiloader.widgetFromJsonFile(target, jsonFile, options)**
第三个参数options, 有两个属性**memeberPrefix、eventPrefix**分别用于配置成员前缀与事件函数前缀。 
```javascript
sz.uiloader.widgetFromJsonFile(this, "res/DemoLogin.ExportJson", {eventPerfix:"on", memberPrefix:"m_"} );
```
此时控件成员变量名为m_loginButton, 事件为onloginButtonTouchEnded。

##前缀+控件名+Event
>有控件名为：_loginButton但不想将该控件的TouchBegan、TouchMoved、TouchEnded分成三个函。
你可以按定义ccui事件回调函数的默认签名方式_onLoginButtonEvent(sender, type)事件来统一处理，
通过参数type来判断事件类型。
函数名则需要遵循 **前缀+控件名+Event**方式。
```javascript
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
```

注意如你还定义有**前缀 + 控件名 + 事件名** 格式的函数如**_loginButtonTouchBegan** 它们将不会被执行。
