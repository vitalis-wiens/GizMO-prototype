var wapiConstructor=require("./wapi");

var wapy={};
wapy.sayHello=function(){
    console.log("Temp!")
};

wapy.createAPI=function(){
    console.log("want to create new wapi constructor!");
    return new wapiConstructor();
};


module.exports = wapy;