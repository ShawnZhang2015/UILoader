 UILoader = {};
(function() {

    var widgetEvent = {
        widgetClass: ccui.Widget,
        events:["TouchBegan", "TouchMoved", "TouchEnded"]
    };

    var widgetEvents = [
        //Button
        {
            widgetClass: ccui.Button,
            events: widgetEvent.events,
        },

        //ImageView
        {
            widgetClass: ccui.ImageView,
            events: widgetEvent.events
        },

        //TextFiled
        {
            widgetClass: ccui.TextField,
            events: ["AttachWithIME", "DetachWithIME", "InsertText", "DeleteBackward"],
        },

        //CheckBox
        {
            widgetClass: ccui.CheckBox,
            events: ["Selected", "Unselected"]
        },

        //ListView
        {
            widgetClass: ccui.ListView,
            events:["SelectedItem"]
        },

        //Panel
        {
            widgetClass: ccui.Layout,
            events: widgetEvent.events,
        },

        //BMFont
        {
            widgetClass: ccui.TextBMFont,
            events: widgetEvent.events,
        }
    ];

    var bindWidget = function(widget, target) {
        //找到事件
        var bindWidgetEvent = null;
        for (var i = 0; i < widgetEvents.length; i++) {
            bindWidgetEvent = widgetEvents[i];
            if (widget instanceof bindWidgetEvent.widgetClass) {
                break;
            }
        }

        //绑定事件
        if (bindWidgetEvent) {
            registerWidgetEvent(target, widget, bindWidgetEvent);
        }
    };

    //注册控件事件函数
    var registerWidgetEvent = function(target, widget, widgetEvent) {
        var name = widget.getName();
        var newName = name[1].toUpperCase() + name.slice(2);
        var eventName = "_on" + newName + "Event";
        var isBindEvent = false;

        if (target[eventName]) {
            isBindEvent = true;
        } else {
            //生成事件函数名
            var eventsArray = widgetEvent.events.map(function(eventName) {
                return "_on"+ newName + eventName;
            });
            for (var i = 0; i < eventsArray.length; i++) {
                eventName = eventsArray[i];
                if (cc.isFunction(target[eventName])) {
                    isBindEvent = true;
                    break;
                }
            }
        }

        //事件函数
        var eventFunc = function(sender, type) {

            var callBack;
            if (eventsArray) {
                var funcName = eventsArray[type];
                callBack = target[funcName];
            } else {
                callBack = target[eventName];
            }

            if (callBack) {
                return callBack.call(target, sender, type);
            }
        };

        if (isBindEvent) {
            widget.setTouchEnabled(true);
            if (widget.addEventListener) {
                widget.addEventListener(eventFunc, target);
            } else {
                widget.addTouchEventListener(eventFunc, target);
            }
        }
    };

    //bind成员变量
    var bindMembers = function(rootWidget, target) {
        var widgetName,
            children = rootWidget.getChildren();

        children.forEach(function(widget) {
            widgetName = widget.getName();

            //控件名存在，绑定到target上
            if (widgetName && widgetName[0] === "_") {
                target[widgetName] = widget;
                bindWidget(widget, target);
            }

            //绑定子控件
            if (!rootWidget[widgetName]) {
                rootWidget[widgetName] = widget;
            }

            //如果还有子节点，递归进去
            if (widget.getChildrenCount()) {
                bindMembers(widget, target);
            }
        });
    };

    var widgetFromJsonFile = function(target, jsonFile) {
        if (!jsonFile || !target) {
            cc.log("error: jsonfile or target is null");
            return;
        }

        var root = ccs.uiReader.widgetFromJsonFile(jsonFile);

        if (!root) {
            cc.log(jsonFile + " create error");
            return;
        }

        if (target.addChild) {
            target.addChild(root);
        }

        if (!target.rootNode) {
            target.rootNode = root;
        }

        bindMembers(root, target);
    };

    UILoader.widgetFromJsonFile = widgetFromJsonFile;
})();