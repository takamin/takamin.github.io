(function(gc) {
    var isWindow = false;
    var isWorker = false;
    var isNodeJs = false;
    if("importScripts" in gc) {
        console.log("The global context is determined as Worker cause 'importScript' exists");
        isWorker = true;
    }
    var gcname = gc.constructor.name || ("" + gc); 
    console.log("global context name is", gcname);
    switch(gcname) {
        case "Window":// webkit
        case "[object Winow]":// IE11
            console.log("The global context is determined as Window by its name");
            isWindow = true;
            gcname = "Window";
            break;
        case "DedicatedWorkerGlobalScope":// webkit
        case "[object WorkerGlobalScope]":// IE11
            console.log("The global context is determined as Worker by its name");
            isWorker = true;
            gcname = "Worker";
            break;
        case "Object"://Probably node.js
            console.log("The global context is determined as NodeJs by its name");
            isNodeJs = true;
            gcname = "NodeJs";
            break;
        default:
            console.warn("unrecognized global context name");
            break;
    }
    function GlobalContext() {}
    GlobalContext.name = gcname;
    GlobalContext.isWindow = function() {
        return isWindow;
    };
    GlobalContext.isWorker = function() {
        return isWorker;
    };
    GlobalContext.isNodeJs = function() {
        return isNodeJs;
    };
}(this));
