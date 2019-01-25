var BaseElement = require("../baseElement");
var drawTools   = require("../drawTools")();
var propNodeConst=require("../nodes/baseNode");

module.exports = (function () {
var Base = function (wapi) {
    BaseElement.apply(this, arguments);

    console.log("creating that dnr NODE >>>>>>>>>>>>>>>>>>>");
    var that=this;
    var mouseIn=false;
    var text="hello";
    var elementSvgRoot;
    var renderingShape;
    var myConfig=undefined;
    var propertyNode=undefined;

    this.setPropertyNode=function(propertyN){
        propertyNode=propertyN;
    };

    this.setLabelText=function(value){
        text=value;
    };

    var domain,range;
    this.domain=function(d){
        if (!arguments.length){return domain;}
        domain=d;
    };
    this.range=function(r){
        if (!arguments.length){return range;}
        range=r;
    };

    this.setConfigObject=function(jObj){
        myConfig=jObj;
    };

    this.mouseEntered=function(val){
      if (!arguments.length) return mouseIn;
      mouseIn=val;
    };

    this.createForceNode=function(labelText){
        that.setLabelText(labelText);
        propertyNode= new propNodeConst(wapi);
        propertyNode.setConfigObject(wapi.elementsConfig.objectProperty);
        propertyNode.x=0;
        propertyNode.y=0;
        console.log("created propertyNode!!!");
        console.log(propertyNode);
        return propertyNode;
    };

    this.mouseHoverIn=function(){
        if (that.mouseEntered()) return;
        that.mouseEntered(true);
    };

    this.mouseHoverOut=function(){
        that.mouseEntered(false);
    };
    this.updateDrawedPosition=function(){
        // TODO vvvvv Put this into function for handling
        renderingShape.attr("x1", domain.x)
            .attr("y1", domain.y)
            .attr("x2", range.x)
            .attr("y2", range.y);


    };

    this.getForceLink=function(){
        return [{ "source": that.domain(),
                 "target": propertyNode
        },
            { "source": propertyNode,
                "target": that.range()
            }

        ];
    };

    this.draw=function(elRoot){
        if (propertyNode===undefined){
            //missing Property node;

        }
        elementSvgRoot=elRoot;
        renderingShape=drawTools.drawLinkElement(elementSvgRoot,myConfig);

        // addMouseEvents();
    };

    function addMouseEvents () {
        // add Hover Events;
        addHoverEvents();
    }

    function addHoverEvents(){
        renderingShape.on("mouseover",that.mouseHoverIn);
        renderingShape.on("mouseout",that.mouseHoverOut);
    }



};

Base.prototype = Object.create(BaseElement.prototype);
Base.prototype.constructor = Base;


return Base;
}());