var BaseElement = require("./baseLink");
var drawTools   = require("../drawTools")();
var propNodeConst=require("../nodes/baseNode");

module.exports = (function () {
var Base = function (wapi) {
    BaseElement.apply(this, arguments);

    var that=this;
    var mouseIn=false;
    var text="hello";
    var elementSvgRoot;
    var renderingShape;
    var myConfig=undefined;
    var renderingTextElement;
    var propertyNode=undefined;
    var linkVisible=true;
    var propertyObject;
    var configName;
    var arrowHead,arrowTail;
    var arrowHeadPath,arrowHeadMarker;
    var linkDistance=300;
    var my_markerContainer;
    this.linkDistance=function(val){
        if(!arguments.length){
            return linkDistance;}
        else{ linkDistance=val;}
    };
    var linkStrength=0.8;
    this.linkStrength=function(val){
        if(!arguments.length){
            return linkStrength;}
        else{ linkStrength=val;}
    };

    this.propertyObject=function(val){
        if (!arguments.length) return propertyObject;
        else propertyObject=val;
    };
    this.visible=function(val){
        if (!arguments.length){
            return linkVisible;
        }else{
            linkVisible=val;
            if (propertyNode) propertyNode.visible(val);
        }
    };


    this.drawLabelText=function(elementSvgRoot){
        if (text){
            renderingTextElement=elementSvgRoot.append("text").text(text);
            var fontSize =renderingTextElement.node().getBoundingClientRect().height;
            var textWidth= renderingTextElement.node().getBoundingClientRect().width;
            renderingTextElement.attr("dy", 0.25*fontSize + "px");
            renderingTextElement.attr("dx",-0.5*textWidth+"px");
            renderingTextElement.style("pointer-events","none");
            return renderingTextElement;
        }
        return null;
    };

    this.setPropertyNode=function(propertyN){
        propertyNode=propertyN;
    };
    this.getPropertyNode=function(){
        return propertyNode;
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

    this.setConfigName=function(name){
        configName=name;
    };

    this.updateConfig=function(){
        myConfig=wapi.elementsConfig[configName];
        if (myConfig===undefined){
            myConfig=wapi.elementsConfig[this.defaultElementType()];
        }

    };

    this.createPropertyNode=function(labelText){
        that.setLabelText(labelText);
        propertyNode= new propNodeConst(wapi);
        propertyNode.setConfigName(configName);
        propertyNode.x=0;
        propertyNode.y=0;
        propertyNode.setLabelText(labelText);
        propertyNode.tNode(propertyObject);
        propertyNode.isLinkElement(true);
        propertyNode.setLinkElement(that);
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

        if (!renderingShape){
            // console.log("single property link  has no rendering shape oO");
            return;
        }

        var iP=wapi.computeIntersectionPoints(domain,range);

        // console.log("Got the intersection points");
        // console.log(iP);

        renderingShape.attr("x1", iP.x1)
            .attr("y1", iP.y1)
            .attr("x2", iP.x2)
            .attr("y2", iP.y2);

        var cx=0.5*(iP.x2+iP.x1);
        var cy=0.5*(iP.y2+iP.y1);
        propertyNode.setPosition(cx,cy);
        propertyNode.updateDrawedPosition();


    };

    this.getForceLink=function(){
        if (linkVisible){
        return [{ "source": that.domain(),
                 "target": that.range(),
                 "propertyData": that
                }
                ];
        }else{ return [];}
    };

    this.draw=function(elRoot,markerContainer){
        if (!linkVisible) return;
        if (propertyNode===undefined){
            //missing Property node;

        }
        elementSvgRoot=elRoot;
        my_markerContainer=markerContainer;
        renderingShape=drawTools.drawLinkElement(elementSvgRoot,myConfig);
        arrowHead=drawTools.drawArrowHead(elementSvgRoot,markerContainer,that.id()+"_arrowHead",myConfig);

        // addMouseEvents();
    };

    this.handleGizmoRepresentationChanges=function(index, size,_callBack,_param){

        if (renderingShape===undefined) return;
        that.updateConfig();
        // create temporal renderingShape;

        var iP=wapi.computeExpected_IntersectionPoints(domain,range,1);
        //var iPX=wapi.computeIntersectionPoints(domain,range,1);

       // console.log(iP);

        var cx=0.5*(iP.x2+iP.x1);
        var cy=0.5*(iP.y2+iP.y1);
        propertyNode.setPosition(cx,cy);
        propertyNode.updateDrawedPosition();

        var tempShapeParent=d3.select(document.createElement("g"));
        var tShape=drawTools.drawLinkElement(tempShapeParent,myConfig);
        var tPM=drawTools.drawArrowHead(elementSvgRoot,my_markerContainer,that.id()+"_arrowHead",myConfig);


        renderingShape.transition()
            .duration(300)
            .attr("style",tShape.attr("style"))
            .attr("x1", iP.x1)
            .attr("y1", iP.y1)
            .attr("x2", iP.x2)
            .attr("y2", iP.y2)
            .each("end",function(){
                tShape.remove();
                if (index===size){
                    if (_callBack && _param){
                        _callBack(_param)
                    }else {
                        wapi.graph.resumeForce();
                    }
                }
            });



        arrowHead[1].transition()
            .duration(300)
            .attr("d",tPM[1].attr("d"))
            .attr("style",tPM[1].attr("style"));

        arrowHead[0].transition()
            .duration(300)
            .attr("viewBox",tPM[0].attr("viewBox"))
            .attr("markerWidth",tPM[0].attr("markerWidth"))
            .attr("markerHeight",tPM[0].attr("markerHeight"))
            .attr("orient",tPM[0].attr("orient"))
            .each("end",function() {
                tPM[0].remove();
            });

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