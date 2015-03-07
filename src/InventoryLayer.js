/**
 * Created by zxh on 3/7/15.
 */

InventoryLayer = cc.Layer.extend({
    ctor: function() {
        this._super();
        sz.uiloader.widgetFromJsonFile(this, "res/cocos/Inventory.json");
        this.rootNode.setScale(0.7);
    },

    _onUpdateTouchEnded: function() {
        cc.log('_onUpdateTouchEnded');
    },

    _onSaleTouchEnded: function() {
        cc.log('_onSaleTouchEnded');
    },

    _onItem1TouchBegan: function() {
        cc.log('_onItem1TouchBegan');
    },

    _onItem2TouchBegan: function() {
        cc.log('_onItem2TouchBegan');
    }
});

InventoryLayer.scene = function() {
    var scene = new cc.Scene();
    scene.addChild(new InventoryLayer());
    return scene;
};
