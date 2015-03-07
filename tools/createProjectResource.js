/**
 * Created by zxh on 13-11-10.
 */
var fs = require("fs");
var util = require("util");
var _ = require("underscore");

var order = ["lib"];

var excludesSrcPath = [
    ".DS_Store"
];

var excludesResPath = [
    "message",
    ".DS_Store",
    ".db",
    ".csb"
];

var resourcePath = [];


function scanDir(path, appFiles, excludesSourcePath) {
    var files = fs.readdirSync(path);
//    console.log(files);
    var tempArray = [];
    var extStr;
    var fileName;
    var isExcFile;
    for(var i = 0; i < files.length; i++) {
        isExcFile = false;
        //排除文件名
        fileName = files[i].toLowerCase();
        for (var j = 0; j < excludesSourcePath.length; j++) {
            extStr = excludesSourcePath[j].toLowerCase();
            if (fileName.indexOf(extStr) !== -1) {
                isExcFile = true;
                continue;
            }
        }

        if (isExcFile) {
            continue;
        }

        var tempPath = path + "/" + files[i];
        var status = fs.statSync(tempPath);
        if (status.isDirectory()) {
            //如查是目录
            scanDir(tempPath, appFiles, excludesSourcePath);
        } else {
            //是文件
            tempArray.push(util.format("%s", tempPath));
        }
    }

    for (i = 0; i < tempArray.length; i++){
        appFiles.push(tempArray[i]);
    }

}

//创建project.json
function createProjectJson() {

    var project = {
        "project_type": "javascript",
        "debugMode" : 1,
        "showFPS" : true,
        "frameRate" : 60,
        "id" : "gameCanvas",
        "renderMode" : 0,
        "engineDir":"frameworks/cocos2d-html5",
        "modules" : ["cocos2d", "extensions", "external"],

        "jsList" : []
    };

    for(var i = 0; i < order.length; i++) {
        scanDir("src/" + order[i], project.jsList, excludesSrcPath);
    }

    var jsonText = JSON.stringify(project, null, 4);
    console.log(jsonText);
    fs.writeFileSync("project.json", jsonText, "utf8");
}

function createJsFiles() {
    var jsFiles = [];
    for(var i = 0; i < order.length; i++) {
        scanDir("src/" + order[i], jsFiles, excludesSrcPath);
    }

    var jsonText = "var jsFiles=" + JSON.stringify(jsFiles, null, 4);
    fs.writeFileSync("src/files.js", jsonText, "utf8");
}

//根据resourcePath创建recource.js
function createResource() {
    var path = "src/resource.js";

    fs.writeFileSync(path, "//Auto Generation\n");

    _.each(resourcePath, function(dir) {
        var files = [];
        var dirName = dir;

        scanDir("res/" + dir, files, excludesResPath);

//        if (dir.slice(0, 3) === "GUI") {
//            dirName = dir.slice(4);
//        } else {
//            dirName = dir;
//        }


        var text = "\nvar G_" + dirName.toUpperCase() + " = [\n";
        _.each(files, function(file) {
            text += "    '" + file + "',\n";
        });
        text += "];\n";

        fs.appendFileSync(path, text);
    });
}

//创建resourcePath
function createResourcePath() {
    var dirs = fs.readdirSync("res");
    var extStr;
    var fileName;
    var isExcFile;
    for(var i = 0; i < dirs.length; i++) {
        isExcFile = false;
        //排除文件名
        fileName = dirs[i].toLowerCase();

        for (var j = 0; j < excludesResPath.length; j++) {
            extStr = excludesResPath[j].toLowerCase();
            if (fileName.indexOf(extStr) !== -1) {
                isExcFile = true;
                break;
            }
        }

        if (isExcFile) {
            continue;
        }

        var path = "res/" + dirs[i];
        var status = fs.statSync(path);

        if(status.isDirectory()) {
            resourcePath.push(util.format("%s", dirs[i]));
        }
    }
}

function createGUIRes() {
    var content = fs.readdirSync('res/GUI');

    _.each(content, function(element) {
        var path = 'res/GUI/' + element;
        var stat = fs.statSync(path);

        if (stat.isDirectory()) {
            resourcePath.push(('GUI/' + element).toString());
        }
    });
}



//添加G_CONFIG_MGR_KEY到resource.js
function createConfigMgrKey() {
    var text = "\nvar G_CONFIG_MGR_KEY = {\n";
    var files = [];
    //var exclude = {};
    var map = {};
    scanDir("res/config", files, excludesResPath);
    _.each(files, function(file) {
        var splitFile = file.split("/");
        splitFile = splitFile[2].split(".");
        console.log(splitFile[0]);
        map[splitFile[0]] = file;
        text += "    " + splitFile[0].toUpperCase() + " : '" + file + "',\n";
    });
    text += "};\n";
    console.log(text);
    fs.appendFileSync("src/generate/resource.js", text);
}

createResourcePath();
createResource();
createJsFiles();
