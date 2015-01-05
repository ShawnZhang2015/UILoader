var sz = sz || {};

sz.UILoader = cc.Class.extend({

    /**
     * 加载UI文件
     * @param target
     * @param jsonFile
     */
    widgetFromJsonFile: function(target, jsonFile) {
        cc.assert(target && jsonFile);

        var rootNode = ccs.uiReader.widgetFromJsonFile(jsonFile);
        if (!rootNode) {
            cc.log("Load json file failed");
        }

        target.rootNode = rootNode;
        target.addChild(rootNode);
        this._bindMenbers(rootNode, target);
    },

    /**
     * 递归进行成员绑定
     * @param rootWidget
     * @param target
     * @private
     */
    _bindMenbers: function(rootWidget, target) {
        var widgetName,
            children = rootWidget.getChildren();

        var self = this;
        children.forEach(function(widget) {
            widgetName = widget.getName();

            //控件名存在，绑定到target上
            if (widgetName && widgetName[0] === "_") {
                target[widgetName] = widget;
                self._registerWidgetEvent(target, widget);
            }

            //绑定子控件,可以实现: a._b._c._d 访问子控件
            if (!rootWidget[widgetName]) {
                rootWidget[widgetName] = widget;
            }

            //如果还有子节点，递归进去
            if (widget.getChildrenCount()) {
                self._bindMenbers(widget, target);
            }

        });
    },

    /**
     * 注册控件事件
     * @param target
     * @param widget
     * @param widgetEvent
     * @private
     */
    _registerWidgetEvent: function(target, widget) {
        var name = widget.getName();
        var newName = name[1].toUpperCase() + name.slice(2);
        var eventName = "_on" + newName + "Event";
        var isBindEvent = false;

        if (target[eventName]) {
            isBindEvent = true;
        } else {
            //生成事件函数名
            var widgetEvent = sz.UILoader.getWidgetEvent(widget);
            if (widgetEvent) {
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
        }

        //事件响应函数
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

        //注册事件监听
        if (isBindEvent) {
            widget.setTouchEnabled(true);
            if (widget.addEventListener) {
                widget.addEventListener(eventFunc, target);
            } else {
                widget.addTouchEventListener(eventFunc, target);
            }
        }
    }

});

/**
 * 获取控件事件
 * @param widget
 * @returns {*}
 */
sz.UILoader.getWidgetEvent = function(widget) {
    var bindWidgetEvent = null;
    var events = sz.UILoader.widgetEvents;
    for (var i = 0; i < events.length; i++) {
        bindWidgetEvent = events[i];
        if (widget instanceof bindWidgetEvent.widgetClass) {
            break;
        }
    }

    return bindWidgetEvent;
};

//触摸事件
sz.UILoader.touchEvents = ["TouchBegan", "TouchMoved", "TouchEnded"];
//控件事件列表
sz.UILoader.widgetEvents = [
    //Button
    {
        widgetClass: ccui.Button,
        events: sz.UILoader.touchEvents
    },
    //ImageView
    {
        widgetClass: ccui.ImageView,
        events: sz.UILoader.touchEvents
    },
    //TextFiled
    {
        widgetClass: ccui.TextField,
        events: ["AttachWithIME", "DetachWithIME", "InsertText", "DeleteBackward"]
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
        events: sz.UILoader.touchEvents
    },
    //BMFont
    {
        widgetClass: ccui.TextBMFont,
        events: sz.UILoader.touchEvents
    },

    null
];

sz.uiloader = new sz.UILoader();