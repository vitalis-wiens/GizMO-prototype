

var rwsConstructor=require("./rws");
var rws={};

rws.Instance=undefined;


rws.getRWS_API=function(){
    // singleton!
    if (rws.Instance)
        return rws.Instance;
    else {
        rws.Instance=new rwsConstructor();
        return rws.Instance;
    }
};
rws.getRWS_API();

module.exports = rws.Instance;

