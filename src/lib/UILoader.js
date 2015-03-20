var sz = sz || {};

sz.UILoader = cc.Class.extend({
    _eventPrefix: null,
    _memberPrefix: null,
    /**
     * 加载UI文件
     * @param target将  jsonFile加载出的节点绑定到的目标
     * @param jsonFile  cocostudio UI编辑器生成的json文件
     */
    widgetFromJsonFile: function(target, jsonFile, options) {
        cc.assert(target && jsonFile);
        if (!options) {
            options = {};
        }

        this._eventPrefix  =  options.eventPrefix || sz.UILoader.DEFAULT_EVENT_PREFIX;
        this._memberPrefix = options.memberPrefix || sz.UILoader.DEFAULT_MEMBER_PREFIX;
        //绑定自身
        this._bindMenbers(target, target);

        //绑定jsonFile
        if (!jsonFile) {
            return;
        }

        var json = cc.loader.getRes(jsonFile);
        var version = json.version || json.Version;
        var rootNode;
        if (version[0] == 1) {
            rootNode = ccs.uiReader.widgetFromJsonFile(jsonFile);
        } else if (version[0] == 2){
            rootNode = ccs.csLoader.createNode(jsonFile);
        }

        if (!rootNode) {
            cc.log("Load json file failed");
        }

        if (rootNode.setTouchEnabled) {
            rootNode.setTouchEnabled(false);
        }

        target.rootNode = rootNode;
        target.addChild(rootNode);
        this._bindMenbers(rootNode, target);
        return rootNode;
    },

    /**
     * 递归对rootWidget下的子节点进行成员绑定
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
            var prefix = widgetName.substr(0, self._memberPrefix.length);
            if (prefix === self._memberPrefix) {
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
     * 获取控件事件
     * @param widget
     * @returns {*}
     */
    _getWidgetEvent: function(widget) {
        var bindWidgetEvent = null;
        var events = sz.UILoader.widgetEvents;
        for (var i = 0; i < events.length; i++) {
            bindWidgetEvent = events[i];
            if (bindWidgetEvent && widget instanceof bindWidgetEvent.widgetType) {
                break;
            }
        }
        return bindWidgetEvent;
    },

    /**
     * 注册控件事件
     * @param target
     * @param widget
     * @private
     */
    _registerWidgetEvent: function(target, widget) {

        //截取前缀,首字母大定
        var eventName = this.getWidgetEventName(widget, "Event");
        var isBindEvent = false;
        if (target[eventName]) {
            isBindEvent = true;
        } else {
            //取事控件件名
            var widgetEvent = this._getWidgetEvent(widget);
            if (!widgetEvent) {
                sz.uiloader.registerTouchEvent(widget, target);
                return;
            }
            //检查事件函数,生成事件名数组
            var eventNameArray = [];
            for (var i = 0; i < widgetEvent.events.length; i++) {
                eventName = this.getWidgetEventName(widget, widgetEvent.events[i]);//newName + widgetEvent.events[i];
                eventNameArray.push(eventName);
                if (typeof target[eventName] === "function") {
                    isBindEvent = true;
                }
            }
        }

        //事件响应函数
        var self = this;
        var eventFunc = function(sender, type) {
            var callBack;
            var funcName;
            if (eventNameArray) {
                funcName = eventNameArray[type];
                callBack = target[funcName];
            } else {
                callBack = target[eventName];
            }

            //事件勾子函数
            if (callBack && self._onWidgetEvent) {
                self._onWidgetEvent(sender, type);
            }

            //开始
            if (type === ccui.Widget.TOUCH_BEGAN) {
                var time = sz.UILoader.DEFAULT_TOUCH_LONG_TIME;
                if (callBack) {
                    time = callBack.call(target, sender, type);
                }

                //检测长按事件
                funcName = sz.uiloader.getWidgetEventName(sender, sz.UILoader.TOUCH_LONG_EVENT);
                var touchLong = target[funcName];

                if (touchLong) {
                    time = time || sz.UILoader.DEFAULT_TOUCH_LONG_TIME;
                    if (time > 0 && time < 5) {
                        target.scheduleOnce(touchLong, time);
                    }
                }
                return;
            }

            //长按解除
            if (type === ccui.Widget.TOUCH_ENDED) {
                funcName = sz.uiloader.getWidgetEventName(sender, sz.UILoader.TOUCH_LONG_EVENT);
                var scheduleFunc = target[funcName];
                if (scheduleFunc) {
                    target.unschedule(scheduleFunc);
                }
            }

            //事件回调
            if (callBack) {
                callBack.call(target, sender, type);
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
    },


    /**
     * 控件事件捕获, 可以由子类重写此函数
     * @param sender
     * @param type
     * @private
     */
    //_onWidgetEvent: function(sender, type) {
    //
    //}

    /**
     * @param widget
     * @param event
     * @returns {string}
     */
    getWidgetEventName: function(widget, event) {
        cc.assert(widget);
        var name = widget.getName();
        if (name) {
            name = name[this._memberPrefix.length].toUpperCase() + name.slice(this._memberPrefix.length + 1);
        }
        if (event) {
            return this._eventPrefix + name + event;
        } else {
            return this._eventPrefix + name;
        }
    }

});

//事件前缀
sz.UILoader.DEFAULT_EVENT_PREFIX = "_on";
//成员前缀
sz.UILoader.DEFAULT_MEMBER_PREFIX = "_";
//默认长按触发时间
sz.UILoader.DEFAULT_TOUCH_LONG_TIME = 1;
//长按事件名
sz.UILoader.TOUCH_LONG_EVENT = "TouchLong";
//触摸事件
sz.UILoader.touchEvents = ["TouchBegan", "TouchMoved", "TouchEnded", sz.UILoader.TOUCH_LONG_EVENT];
//控件事件列表
sz.UILoader.widgetEvents = [
    //Button
    {widgetType: ccui.Button, events: sz.UILoader.touchEvents},
    //ImageView
    {widgetType: ccui.ImageView, events: sz.UILoader.touchEvents},
    //TextFiled
    {widgetType: ccui.TextField, events: ["AttachWithIME", "DetachWithIME", "InsertText", "DeleteBackward"]},
    //CheckBox
    {widgetType: ccui.CheckBox, events: ["Selected", "Unselected"]},
    //ListView
    {widgetType: ccui.ListView, events:["SelectedItem"]},
    //Panel
    {widgetType: ccui.Layout, events: sz.UILoader.touchEvents},
    //BMFont
    {widgetType: ccui.TextBMFont, events: sz.UILoader.touchEvents},
    //last must null
    null
];

sz.uiloader = new sz.UILoader();

/**
 * cc.node触摸事件注册函数
 * @param node
 * @param target
 * @param touchEvent
 * @param swallowTouches
 * @returns {*}
 */
sz.uiloader.registerTouchEvent = function(node, target, touchEvent, swallowTouches) {

    if (!node instanceof cc.Node ) {
        cc.log('param "node" is not cc.Node type');
        return null;
    }

    if (node instanceof ccui.Widget) {
        cc.log('param "node" Can not be ccui.Widget type');
        return null;
    }

    if (swallowTouches === undefined) {
        swallowTouches = true;
    }

    var touchListener = cc.EventListener.create({
        event: touchEvent || cc.EventListener.TOUCH_ONE_BY_ONE,
        swallowTouches: swallowTouches ? true : false
    });

    var nodeEvents = ['onTouchBegan', 'onTouchMoved', 'onTouchEnded'];
    nodeEvents.forEach(function(eventName, index) {

        touchListener[eventName] = function() {
            var touchNode = arguments[1].getCurrentTarget();
            var event = sz.uiloader.getWidgetEventName(touchNode, sz.UILoader.touchEvents[index]);
            if (!target[event]) {
                return false;
            }

            if (index === 0) {
                var point = arguments[0].getLocation();
                point = touchNode.convertToNodeSpace(point);
                var rect = cc.rect(0,0, touchNode.width, touchNode.height);
                if (!cc.rectContainsPoint(rect, point)) {
                    return false;
                }
            }

            var args = Array.prototype.slice.call(arguments);
            args.unshift(touchNode);
            var ret = target[event].apply(target, args);
            if (index === 0) {
                return ret ? true : false;
            }
        };
    });

    cc.eventManager.addListener(touchListener, node);
    return touchListener;
};
