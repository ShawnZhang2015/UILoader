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

##rootNode
>使用UILoader成功加载UI文件后，默认会将由jsonFile创建出来的Widget对象保存到**target.rootNode**变量上，使你可以方便对其操作比如：
```javascript
this.rootNode.setVisible(false);
this.rootNode.setPosition(this.widget * 0.5, this.height * 0.5);
```
注意：uiloader默认会将rootNode设置到target的中心位置显示，但不会修改rootNode的锚点。

##TouchLong事件
>新增TouchLong事件的支持，事件格式为**前缀 + 控件名 + TouchLong** 如：
```javascript
_onLoginButtonTouchLong: function() {
}
```

##绑定手动创建的ccui控件

```javascript
ctor: function () {
    var button = new ccui.ImageView("res/Heiti10.png", ccui.Widget.LOCAL_TEXTURE);
    button.setName("_button");   //必须设置名字
    this.addChild(button);       //必须addChild
    sz.uiloader.widgetFromJsonFile(this); //可以不加载json文件，同样可以绑定你手动创建的ccui控件
    cc.asset(this._button.name === "_button");
    ...
}
```

##为cc.Node类型节点注册触摸事件

>使用sz.uiloader.registerTouchEvent函数为cc.Node类型的节点注册触摸事件。

```javascript
testRegisterTouchEvent: function() {
        //为当前layer注册触摸
        sz.uiloader.registerTouchEvent(this);

        //创建一个sprite
        var spriteButton = new cc.Sprite("#button.png");
        spriteButton.setName("spriteButton");
        spriteButton.x = this.width - spriteButton.width * 0.5;
        spriteButton.y = spriteButton.height * 0.5;
        this.addChild(spriteButton);
        //设置触摸事件函数
        spriteButton.onTouchBegan = function(touch) {
            if (cc.rectContainsPoint(this.getBoundingBox(), touch.getLocation())) {
                cc.log("spriteButton onTouchBegan: " + this.getName());
                return true;
            }
        };

        spriteButton.onTouchMoved = function(touch) {
            cc.log("spriteButton onTouchMoved: " + this.getName());
        };

        spriteButton.onTouchEnded = function(touch) {
            cc.log("spriteButton onTouchEnded: " + this.getName());
        };
        //为spriteButton注册触摸事件
        sz.uiloader.registerTouchEvent(spriteButton);

    },

    //当前Layer上的触摸事件
    onTouchBegan: function(touch) {
        cc.log("GameLayer onTouchBegan" + JSON.stringify(touch.getLocation()));
        return true;
    },

    onTouchMoved: function(touch) {
        cc.log("GameLayer onTouchMoved" + JSON.stringify(touch.getLocation()));
        return true;
    },

    onTouchEnded: function(touch) {
        cc.log("GameLayer onTouchEnded" + JSON.stringify(touch.getLocation()));
        return true;
    }
```
>sz.uiloader.registerTouchEvent函数只是简单封装引擎API，转换事件响应函数的this变量为当前节点对象。
>注意：
>   1. 你可以运行代码会发现上面代码中spriteButton的事件处理函数中的打印的this.getName()返回为spriteButton的名字。
>   2. sz.uiloader.registerTouchEvent主要还是用在对当前Layer对象上（this）, 目前暂时还不支持touchLong事件。
