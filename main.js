
cc.game.onStart = function(){
    
    cc.view.adjustViewPort(true);
    cc.view.setDesignResolutionSize(480, 320,cc.ResolutionPolicy.SHOW_ALL);
    cc.view.resizeWithBrowserSize(true);
    cc.LoaderScene.preload(g_resources, function () {
        var scene = new cc.Scene();
        scene.addChild(new GameLayer());
        cc.director.runScene(scene);
    }, this);
};
cc.game.run(); 