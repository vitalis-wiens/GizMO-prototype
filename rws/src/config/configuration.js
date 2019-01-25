module.exports = function (wapi) {
    var globalConfig={};

    globalConfig.canvas=require("./canvasConfig")(wapi);
    globalConfig.owlClass=require("./class_config")(wapi);
    console.log(globalConfig.canvas);
    return globalConfig;
};