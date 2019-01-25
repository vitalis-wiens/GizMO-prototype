module.exports = function () {
    var d={};
    d.debugLevel=100;
    d.setDebugLevel=function(lvl){d.debugLevel=lvl;};
    d.log=function(lvl,msg) {
        if (d.debugLevel >= lvl) console.log(msg);
    };
    return d;
};

