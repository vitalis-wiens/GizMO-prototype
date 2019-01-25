module.exports = function (wapi) {
    var canvas_config={};
    canvas_config.width=200+"px";
    canvas_config.height=200+"px";
    canvas_config.bgColor="#ECF0F1";


    // default layer configuration;
    // canvas_config.layerArray=["markerContainer","links","properties","nodes"];
    canvas_config.layerArray=["markerContainer","links","properties","nodes"];



    var canvas={};

    canvas.width=function(width){
        if (!arguments.length) return canvas_config.width;
        canvas_config.width=width;
    };
    canvas.height=function(height){
        if (!arguments.length) return canvas_config.height;
        canvas_config.height=height;
    };
    canvas.bgColor=function(color){
        if (!arguments.length) return canvas_config.bgColor;
        canvas_config.bgColor=color;
    };
    canvas.getLayers=function(){return canvas_config.layerArray};
    canvas.setLayers=function(layerArrayAsNamedStrings){canvas_config.layerArray=layerArrayAsNamedStrings;};

    // appends layer at the end of the layerArray;
    canvas.addLayer=function(namedLayer){canvas_config.layerArray.push(namedLayer);};


    return canvas;
};