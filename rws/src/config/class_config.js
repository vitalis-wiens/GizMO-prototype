module.exports = function (wapi) {
    var class_config={};
    class_config.renderingType="circle";
    class_config.width=100;
    class_config.height=50;
    class_config.bgColor="#ffa621";
    class_config.strokeElment=true;
    class_config.strokeWidth="1px";
    class_config.strokeStyle="solid";
    class_config.strokeColor="#000";
    class_config.radius=50;
    class_config.rendingLayer=undefined;

    // hover configuration
    class_config.hoverInCurser="pointer";
    class_config.hoverInColor="#f00";



    var class_rending={};


    class_rending.strokeElement=function(yesno){
        if (!arguments.length) return class_config.strokeElment;
        class_config.strokeElment=yesno;
    };

    class_rending.renderingType=function(type){
        if (!arguments.length) return class_config.renderingType;
        class_config.renderingType=type;
    };
    class_rending.width=function(width){
        if (!arguments.length) return class_config.width;
        class_config.width=width;
    };
    class_rending.height=function(height){
        if (!arguments.length) return class_config.height;
        class_config.height=height;
    };
    class_rending.bgColor=function(color){
        if (!arguments.length) return class_config.bgColor;
        class_config.bgColor=color;
    };
    class_rending.strokeWidth=function(sWidth){
        if (!arguments.length) return class_config.strokeWidth;
        class_config.strokeWidth=sWidth;
    };
    class_rending.strokeStyle=function(sStyle){
        if (!arguments.length) return class_config.strokeStyle;
        class_config.strokeStyle=sStyle;
    };
    class_rending.strokeColor=function(sColor){
        if (!arguments.length) return class_config.strokeColor;
        class_config.strokeColor=sColor;
    };
    class_rending.radius=function(radius){
        if (!arguments.length) return class_config.radius;
        class_config.radius=radius;
    };
    class_rending.renderingLayer=function(layer){
        if (!arguments.length) return class_config.renderingLayer;
        class_config.renderingLayer=layer;
    };


    return class_rending;
};