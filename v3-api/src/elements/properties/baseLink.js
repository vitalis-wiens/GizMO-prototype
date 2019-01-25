var BaseElement = require("../baseElement");
var drawTools   = require("../drawTools")();
module.exports = (function () {
var Base = function (wapi) {
    BaseElement.apply(this, arguments);

    var that=this;
    var mouseIn=false;

    var elementSvgRoot;
    var renderingShape;
    var myConfig=undefined;
    var renderingTextElement;
    var domain,range;
    var text;
    var arrowHead,arrowTail;

    var visible=true;

    var propertyObject;

    this.propertyObject=function(val){
        if (!arguments.length) return propertyObject;
        else propertyObject=val;
    };

    this.visible=function(val){
        if (!arguments.length){ return visible;}
        else {visible=val;}
    };

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

    this.mouseHoverIn=function(){
        if (that.mouseEntered()) return;
        that.mouseEntered(true);
    };



    this.mouseHoverOut=function(){
        that.mouseEntered(false);
    };
    this.updateDrawedPosition=function(){
        // TODO vvvvv Put this into function for handling
        if (renderingShape && domain && range) {
            renderingShape.attr("x1", domain.x)
                .attr("y1", domain.y)
                .attr("x2", range.x)
                .attr("y2", range.y);
      }
    };

    this.getForceLink=function(){
        return [{ "source": that.domain(),
                 "target": that.range()
        }]; // using an array of element 1 , however for larger this makes sense when collection the force links for the collections
    };

    this.draw=function(elRoot,markerContainer){
        // console.log("drawing Base Link");
        elementSvgRoot=elRoot;
        renderingShape=drawTools.drawLinkElement(elementSvgRoot,myConfig);
        arrowHead=drawTools.drawArrowHead(elementSvgRoot,markerContainer,that.id()+"_arrowHead",myConfig);
        // arrowTail=drawTools.drawArrowTail(markerContainer,myConfig);

        addMouseEvents();
    };

    function addMouseEvents () {
        // add Hover Events;
        addHoverEvents();
    }

    function addHoverEvents(){
        renderingShape.on("mouseover",that.mouseHoverIn);
        renderingShape.on("mouseout",that.mouseHoverOut);
    }
    this.setLabelText=function(value){
        text=value;
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


    this.getPropertyNode=function(){
      // abstaract function
    };

    this.handlePositionUpdateByViewer=function( nPos, _callback,_callbackParam){
        var renderingElement=that.getPropertyNode();

        // console.log(renderingElement.tNode().getLabelForCurrentLang() + " visible" + renderingElement.visible() +  "pos: "+nPos[0]+" "+nPos[1]);
        // if (!renderingElement.visible()){
        //     // try to find the mL structure;
        //     if (renderingElement.tNode().getLinkStructure &&
        //         renderingElement.tNode().getLinkStructure()) {
        //         // reforcing drawing of the collapsed Multilink;
        //         renderingElement.tNode().getLinkStructure().getRenderingPrimitive().collapseMultiLinks(true);
        //     }
        // }
        //
        // // if visible?
        // if (renderingElement.visible()){
        //     if (renderingElement.tNode().getLinkStructure &&
        //         renderingElement.tNode().getLinkStructure()) {
        //         // reforcing drawing of the collapsed Multilink;
        //         renderingElement.tNode().getLinkStructure().getRenderingPrimitive().expandMultiLinks(true);
        //     }
        // }
        //
        //
        //     // make it your own to update also the links ;;;
        // console.log("current Pos: "+ renderingElement.x+ " "+renderingElement.y);
        renderingElement.handlePositionUpdateByViewerForLink(nPos, _callback,_callbackParam);



    };


};

Base.prototype = Object.create(BaseElement.prototype);
Base.prototype.constructor = Base;


return Base;
}());