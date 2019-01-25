var BaseElement = require("../baseElement");
var drawTools   = require("../drawTools")();
module.exports = (function () {
var Base = function (wapi) {
    BaseElement.apply(this, arguments);

    var that=this;
    var mouseIn=false;
    var elementSvgRoot;
    var renderingShape, renderingTextElement;
    var collapsedDtShape, collapsedLoopShape;
    var myConfig=undefined;
    var myConfigCollapseDt=wapi.elementsConfig.collapsedDatatypes;
    var myConfigCollapseLoop=wapi.elementsConfig.collapsedLoops;
    var configName=undefined;
    var collapsedDatatypesConfigName="collapsedDatatypes";
    var collapsedLoopsConfigName="collapsedLoops";
    var labelText=undefined;
    var collapsedDtL=false;
    var collapsedLoop=false;
    var collapsedDatatype=false;
    var shapeRadius=0;
    var isForceNodeForProperty=false;
    var structTypeNode;
    var isLinkElement=false;
    var linkElement=undefined;
    var tempArrayOfCollapsionElements=[];
    var temp_visiblityFlag=true;
    var hasCollapsibleNodes=false;
    var hasCollapsibleLoopElements=false;
    var elementTypeConstructorName="";


    this.are_loopCollapsed=function(){
        return collapsedLoop;
    };
    this.are_dtCollapsed=function(){
        return collapsedDatatype;
    };

    this.getDtCollapseCFG=function(){
        return myConfigCollapseDt;
    };

    this.getLoopCollapseCFG=function(){
        return myConfigCollapseLoop;
    };


    this.elementTypeConstructorName=function(type){
        if (!arguments.length){ return elementTypeConstructorName;}
        elementTypeConstructorName=type;
    };

    this.hasCollapsibleNodes=function(val){
        if (!arguments.length){ return hasCollapsibleNodes;}
        else {hasCollapsibleNodes=val;}
    };
    this.hasCollapsibleLoops=function(val){
        if (!arguments.length){ return hasCollapsibleLoopElements;}
        else {hasCollapsibleLoopElements=val;}
    };


    this.getTempCollapsionElements=function(){
        return tempArrayOfCollapsionElements;
    };

    this.isLinkElement=function(val){
        if (!arguments.length) return isLinkElement;
        isLinkElement=val;
    };

    this.setLinkElement=function(el){
        linkElement=el;
    };

    this.getLinkElement=function(){
        return linkElement;
    };

    this.handlePositionUpdateByViewer=function( nPos,_callback,_callbackParam){
        //  console.log(labelText+" oldPos: x:"+that.x+ " y:"+ that.y);
        //  console.log(labelText+" newPos: x:"+nPos[0]+ " y:"+ nPos[1]);
        // //
        if (!elementSvgRoot) {console.log("no elementSVG FOUND"); return;}
        var f_x=parseFloat(nPos[0]);
        var f_y=parseFloat(nPos[1]);
        elementSvgRoot.transition()
            .tween("attr.translate", function () {
                return function (t) {
                    var tr = d3.transform(elementSvgRoot.attr("transform"));
                    that.x=tr.translate[0];
                    that.y=tr.translate[1];
                    that.px=that.x;
                    that.py=that.y;

                };
            })
        .attr("transform", "translate(" +f_x + "," +f_y + ")")
        .each("end",function(){
           if (_callback){
               _callback(_callbackParam);
               wapi.graph.interpolatePositions();
           }


        });


    };


    this.handlePositionUpdateByViewerForLink=function( nPos,_callback,_callbackParam){
        //  console.log(labelText+" oldPos: x:"+that.x+ " y:"+ that.y);
        //  console.log(labelText+" newPos: x:"+nPos[0]+ " y:"+ nPos[1]);
        // //
        if (!elementSvgRoot) {console.log("no elementSVG FOUND"); return;}
        var f_x=parseFloat(nPos[0]);
        var f_y=parseFloat(nPos[1]);
        elementSvgRoot.transition()
            .tween("attr.translate", function () {
                return function (t) {
                    var tr = d3.transform(elementSvgRoot.attr("transform"));
                    that.x=tr.translate[0];
                    that.y=tr.translate[1];
                    that.px=that.x;
                    that.py=that.y;
                    wapi.updateMLRenderingPositions();
                    if(that.isLinkElement()){
                        that.getLinkElement().updateDrawedPosition();
                    }

                };
            })
            .attr("transform", "translate(" +f_x + "," +f_y + ")")
            .each("end",function(){
                if (_callback){
                    _callback(_callbackParam);
                    wapi.graph.interpolatePositions();
                }


            });


    };
    this.isForceNodeForProperty=function(val){
      if (!arguments.length) {
          return isForceNodeForProperty;
      }
      isForceNodeForProperty=val;
    };

    var notExportable=false;
    this.isNotExportable=function(val){
        if (!arguments.length) {
            return notExportable;
        }
        notExportable=val;
    };


    this.tNode=function(val){
        if(!arguments.length) return structTypeNode;
        structTypeNode=val;
    };

    this.defaultElementType("defaultNodeElement");
    var visible=true;
    var charge=-500;
    var nodeObject;
    this.charge=function(val){
      if (!arguments.length){ return charge;}
      else {charge=val;}
    };


    this.forceGraphRedraw=function(){
        wapi.graph.redraw();
    };

    this.getRadius=function(){
        if (shapeRadius) {
            return shapeRadius;
        }
        return parseInt(myConfig.radius);
    };

    this.getConfigObj=function (){
        return myConfig;
    };


    this.getConfigObjExpected=function(){

        if (configName===undefined){
            configName=this.defaultElementType();
        }
        // console.log("*** Updateing my Config ***"+configName);
        var expectedConfig=wapi.elementsConfig[configName];
        if (expectedConfig===undefined){
             // console.log("Not Found: use Default element "+this.defaultElementType());
            expectedConfig=wapi.elementsConfig[this.defaultElementType()];
        }
        return expectedConfig;


    };


    /** some function container set from outside **/
    var dblClickFunction;
    this.nodeObject=function(val){
        if (!arguments.length) return nodeObject;
        else nodeObject=val;
    };

    /** ---------------------------------------- **/
    this.visible=function(val){
        if (!arguments.length){ return visible;}
        else {visible=val;}
    };

    this.setLabelText=function(text){
        labelText=text;
    };
    this.getLabelText=function(){

        return labelText;
    };

    this.setConfigObject=function(jObj){
        myConfig=jObj;
    };
    this.setConfigName=function(name){
        configName=name;
    };

    this.updateConfig=function(){
        if (configName===undefined){
            configName=this.defaultElementType();
        }
         // console.log("*** Updateing my Config ***"+configName);
        myConfig=wapi.elementsConfig[configName];

        if (myConfig===undefined){
            // console.log("Not Found: use Default element "+this.defaultElementType());
            myConfig=wapi.elementsConfig[this.defaultElementType()];
        }
         // console.log(myConfig);
        // console.log(wapi.elementsConfig);
        // myConfigCollapseDt=wapi.elementsConfig[collapsedDatatypesConfigName];
        // myConfigCollapseLoop=wapi.elementsConfig[collapsedLoopsConfigName];
        myConfigCollapseDt=wapi.elementsConfig.collapsedDatatypes;
        myConfigCollapseLoop=wapi.elementsConfig.collapsedLoops;
    };

    this.mouseEntered=function(val){
      if (!arguments.length) return mouseIn;
      mouseIn=val;
    };

    this.mouseHoverIn=function(){
        if (that.mouseEntered()) return;
        that.mouseEntered(true);
        elementSvgRoot.style("cursor",myConfig.hoverInCursor);
        renderingShape.style("fill",myConfig.hoverInColor);
        if(myConfig.strokeElement===true || myConfig.strokeElement==="true") {
            renderingShape.style("stroke", myConfig.hoverInStrokeColor);
        }
        if (renderingTextElement){
            renderingTextElement.style("font-family",myConfig.hoverInFontFamily);
            renderingTextElement.style("font-size",myConfig.hoverInFontSize);
            renderingTextElement.style("fill",myConfig.hoverInFontColor);
            if (myConfigCollapseDt.renderingType==="umlStyle" || myConfigCollapseLoop.renderingType==="umlStyle") {
                if ((collapsedLoopShape && collapsedLoopShape.classed("hidden") === false )||
                    (collapsedDtShape && collapsedDtShape.classed("hidden") === false )) {
                    // do nothing
                }
                else {
                    reEvaluatioTextPoistion();

                }
            }else {
                reEvaluatioTextPoistion();
            }
        }

        // apply umlStyleChanges if needed;
        // if (myConfigCollapseDt.renderingType==="umlStyle" || myConfigCollapseLoop.renderingType==="umlStyle") {
        //     // assume new position of the text element;
        //
        //     if (collapsedLoopShape && collapsedLoopShape.classed("hidden") === false &&
        //         collapsedDtShape && collapsedDtShape.classed("hidden") === false) {
        //         var loopDt=drawTools.drawAllCollapsedEllements(that,elementSvgRoot,myConfig,myConfigCollapseDt,myConfigCollapseLoop);
        //         // console.log("Spacial Case? <<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>..");
        //         collapsedLoopShape=loopDt.loop;
        //         collapsedDtShape = loopDt.dt;
        //
        //     } else {
        //         if (collapsedDtShape && collapsedDtShape.classed("hidden") === false) {
        //             drawTools.updateTextPositionForUMLNotation(renderingTextElement, that, myConfig, myConfigCollapseDt);
        //         }
        //         if (collapsedLoopShape && collapsedLoopShape.classed("hidden") === false) {
        //             drawTools.updateTextPositionForUMLNotation(renderingTextElement, that, myConfig, myConfigCollapseLoop);
        //         }
        //
        //     }
        // }

    };

    this.mouseHoverOut=function(){
        that.mouseEntered(false);
        elementSvgRoot.style("cursor","default");
        renderingShape.style("fill",myConfig.bgColor);
        if(myConfig.strokeElement===true || myConfig.strokeElement==="true") {
            renderingShape.style("stroke", myConfig.strokeColor);
        }
        if (renderingTextElement){
            renderingTextElement.style("font-family",myConfig.fontFamily);
            renderingTextElement.style("font-size",myConfig.fontSize);
            renderingTextElement.style("fill",myConfig.fontColor);
            if (myConfigCollapseDt.renderingType==="umlStyle" || myConfigCollapseLoop.renderingType==="umlStyle") {
                if (collapsedLoopShape && collapsedLoopShape.classed("hidden") === false ||
                    collapsedDtShape && collapsedDtShape.classed("hidden") === false) {
                    // do nothing
                }
                else {
                    reEvaluatioTextPoistion();

                }
            }else {
                reEvaluatioTextPoistion();
            }
        }
        // apply umlStyleChanges if needed;
        // if (myConfigCollapseDt.renderingType==="umlStyle" || myConfigCollapseLoop.renderingType==="umlStyle") {
        //     // assume new position of the text element;
        //
        //     if (collapsedLoopShape && collapsedLoopShape.classed("hidden") === false &&
        //         collapsedDtShape && collapsedDtShape.classed("hidden") === false) {
        //         // console.log("Spacial Case? <<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>..");
        //     } else {
        //         if (collapsedDtShape && collapsedDtShape.classed("hidden") === false) {
        //             drawTools.updateTextPositionForUMLNotation(renderingTextElement, that, myConfig, myConfigCollapseDt);
        //         }
        //         if (collapsedLoopShape && collapsedLoopShape.classed("hidden") === false) {
        //             drawTools.updateTextPositionForUMLNotation(renderingTextElement, that, myConfig, myConfigCollapseLoop);
        //         }
        //
        //     }
        // }

    };
    this.setPosition=function(xP, yP){
        this.x=xP; this.y=yP;
    };
    this.getPosition=function(){
        return [that.x,that.y];
    };
    this.updateDrawedPosition=function(){
        elementSvgRoot.attr("transform", "translate(" + this.x + "," + this.y + ")");
    };

    function measureTextWidth(text,fontFamily,fontSize) {
        // console.log("Measuring TextWidth with: fontSize="+fontSize+ "fontFamily="+fontFamily);

        var d = d3.select("body").append("text");
            d.attr("id", "width-test");
            d.attr("style", "position:absolute; float:left; white-space:nowrap; font-family:"+fontFamily+";font-size: "+fontSize);
            d.text(text);
        var w = document.getElementById("width-test").offsetWidth;
        d.remove();
        return w;
    }

    this.computeRequiredWidth=function(){
        var fontSizeProperty = window.getComputedStyle(renderingTextElement.node()).getPropertyValue("font-size");
        var fontFamily = window.getComputedStyle(renderingTextElement.node()).getPropertyValue("font-family");
        var fontSize = parseFloat(fontSizeProperty);

        var textWidth = measureTextWidth(labelText, fontFamily, fontSize + "px");
        var offset=parseInt(myConfig.overWriteOffset);
        var width=0;
        if (myConfig.fontSizeOverWritesShapeSize === "true") {
            width = textWidth + offset;
        }
        if (myConfig.fontSizeOverWritesShapeSize === "false") {
            if (myConfig.renderingType === "circle") {
                width=parseInt(myConfig.width);
            }
            if (myConfig.renderingType === "rect" || myConfig.renderingType === "ellipse") {
                width=parseInt(myConfig.width);
            }
        }
        return width;


    };

    this.drawLabelText=function(elementSvgRoot,configObj){
      if (labelText){
          renderingTextElement=elementSvgRoot.append("text").text(labelText);
          renderingTextElement.style("font-family",configObj.fontFamily);
          renderingTextElement.style("font-size",configObj.fontSize);
          renderingTextElement.style("fill",configObj.fontColor);
          reEvaluatioTextPoistion();
          renderingTextElement.style("pointer-events","none");




          return renderingTextElement;
      }
      return null;
    };

    this.getShapeRadius=function(){
        return shapeRadius;
    };
    this.setShapeRadius=function(rad){
        shapeRadius=rad;
    };

    this.getExpectedShapeSize=function(){
        var retValue={};
        var expCfg=that.getConfigObjExpected();
        if (expCfg.fontSizeOverWritesShapeSize === "true") {
            var tempRTE=elementSvgRoot.append("text").text(labelText);
            tempRTE.style("font-family",expCfg.fontFamily);
            tempRTE.style("font-size",expCfg.fontSize);
            tempRTE.style("fill",expCfg.fontColor);

            var fontSizeProperty = window.getComputedStyle(tempRTE.node()).getPropertyValue("font-size");
            var fontFamily = window.getComputedStyle(tempRTE.node()).getPropertyValue("font-family");
            var fontSize = parseFloat(fontSizeProperty);
            var textWidth = measureTextWidth(labelText, fontFamily, fontSize + "px");
            var height = fontSize + parseInt(expCfg.overWriteOffset);
            var width = textWidth + parseInt(expCfg.overWriteOffset);
            var radius=Math.max(0.5*height, 0.5*width);
            tempRTE.remove();

            retValue={r:radius, w:width,h:height};
        }else{
            retValue={r:parseInt(myConfig.radius),w:parseInt(myConfig.width),h:parseInt(myConfig.height)};
        }
        return retValue;

    };

    this.getExpectedShapeRadius=function(){
        var retValue=0;
        if (myConfig.fontSizeOverWritesShapeSize === "true") {
            var fontSizeProperty = window.getComputedStyle(renderingTextElement.node()).getPropertyValue("font-size");
            var fontFamily = window.getComputedStyle(renderingTextElement.node()).getPropertyValue("font-family");
            var fontSize = parseFloat(fontSizeProperty);
            var textWidth = measureTextWidth(labelText, fontFamily, fontSize + "px");
            var height = fontSize;
            var width = textWidth + parseInt(myConfig.overWriteOffset);
            retValue=Math.max(0.5 * height, 0.5 * width);
        }else {
            retValue = myConfig.radius;
        }

        return parseInt(retValue);

    };

    that.computeUMLElementSize=function(){
        var fontSizecfg= myConfig.fontSize;
        var fontSize=fontSizecfg.split("px")[0];

        var fontFamily = myConfig.fontFamily;
        var textWidth = measureTextWidth(labelText, fontFamily, fontSize+"px");
        // if fontsize overwrites the shapeSize adjust it;
        var offset= parseInt(myConfig.overWriteOffset);
        // console.log(labelText+"   >> comptuing uml width of an element"+ textWidth+ " Identified Offset "+offset);
        if (myConfig.renderingType==="rect") {

            if (myConfig.fontSizeOverWritesShapeSize === "true") {
                var height = parseInt(fontSize) + offset;
                var width = parseInt(textWidth) + offset;
                return {w: width, h: height};
            } else {
                return {w: parseInt(myConfig.width), h: myConfig.height};
            }
        }


    };

    function reEvaluatioTextPoistion(tempShape) {
        shapeRadius=undefined;
        var fontSizeProperty = window.getComputedStyle(renderingTextElement.node()).getPropertyValue("font-size");
        var fontFamily = window.getComputedStyle(renderingTextElement.node()).getPropertyValue("font-family");
        var fontSize = parseFloat(fontSizeProperty);
        renderingTextElement.text(labelText);
        if (myConfig.fontSizeOverWritesShapeSize === "false") {
            if (myConfig.renderingType === "circle") {
                var rad=parseInt(myConfig.radius);
                that.setShapeRadius(rad);
            }
            if (myConfig.renderingType === "rect") {
                // adjust fontSize;
                var allowedWidth=parseFloat(myConfig.width)-10; // todo: just used fixed 10px offste
                drawTools.cropTextToItsWidth(allowedWidth,renderingTextElement);
            }
            if (myConfig.renderingType === "ellipse") {
                // adjust fontSize;
                var allowedWidth=parseFloat(myConfig.width)-10; // todo: just used fixed 10px offste
                drawTools.cropTextToItsWidth(allowedWidth,renderingTextElement);
            }


        }

        var textWidth = measureTextWidth(renderingTextElement.text(), fontFamily, fontSize + "px");
        var dx = -0.5 * textWidth;
        renderingTextElement.attr("dy", 0.25 * fontSize + "px");
        renderingTextElement.attr("dx", dx + "px");
        var modShape=renderingShape;
        if (tempShape) modShape=tempShape;


        if (modShape) {
            var offset=parseInt(myConfig.overWriteOffset);
            if (myConfig.fontSizeOverWritesShapeSize === "true") {
                var height = fontSize+offset;
                var width = textWidth+offset;
                var radius = Math.max(0.5*height, 0.5 * width);
                that.setShapeRadius(radius);
                var indicatorOffsetDT=parseInt(myConfigCollapseDt.inshapeIndicatorOffset);
                var indicatorRadiusDT=radius+indicatorOffsetDT;
                var indicatorWidthDT=width+indicatorOffsetDT;
                var indicatorHeightDT=height+indicatorOffsetDT;


                // reEvaluate shape sizes;
                if (myConfig.renderingType === "circle") {
                    modShape.attr("x", -radius);
                    modShape.attr("y", -radius);
                    modShape.attr("width", 2 * radius);
                    modShape.attr("height", 2 * radius);
                    modShape.attr("rx", radius);
                    modShape.attr("ry", radius);

                    if (collapsedDtShape && myConfigCollapseDt.renderingType==="inshape" && myConfigCollapseDt.inshapeType==="indicator") {
                        collapsedDtShape.attr("x", -indicatorRadiusDT);
                        collapsedDtShape.attr("y", -indicatorRadiusDT);
                        collapsedDtShape.attr("width", 2 * indicatorRadiusDT);
                        collapsedDtShape.attr("height", 2 * indicatorRadiusDT);
                        collapsedDtShape.attr("rx", indicatorRadiusDT);
                        collapsedDtShape.attr("ry", indicatorRadiusDT);
                    }

                }

                if (myConfig.renderingType === "ellipse") {
                    modShape.attr("x",-0.5* width);
                    modShape.attr("y",-0.5* height);
                    modShape.attr("width",width);
                    modShape.attr("height",height);
                    modShape.attr("rx",width);
                    modShape.attr("ry",height);


                    if (collapsedDtShape && myConfigCollapseDt.renderingType==="inshape" && myConfigCollapseDt.inshapeType==="indicator") {
                        collapsedDtShape.attr("x",-0.5* width);
                        collapsedDtShape.attr("y",-0.5* height);
                        collapsedDtShape.attr("width",width);
                        collapsedDtShape.attr("height",height);
                        collapsedDtShape.attr("rx",width);
                        collapsedDtShape.attr("ry",height);
                    }
                    return;
                }

                if (myConfig.renderingType === "rect") {
                    modShape.attr("x", -0.5 * width);
                    modShape.attr("y", -0.5 * height);
                    modShape.attr("width", width);
                    modShape.attr("height", height);
                    if (myConfig.roundedCorner) {
                        modShape.attr("rx", myConfig.roundedCorner[0]);
                        modShape.attr("ry", myConfig.roundedCorner[1]);
                    }
                    if (collapsedDtShape && myConfigCollapseDt.renderingType==="inshape" && myConfigCollapseDt.inshapeType==="indicator") {
                        collapsedDtShape.attr("x", -0.5 * indicatorWidthDT);
                        collapsedDtShape.attr("y", -0.5 * indicatorHeightDT);
                        collapsedDtShape.attr("width", indicatorWidthDT);
                        collapsedDtShape.attr("height", indicatorHeightDT);
                        if (myConfig.roundedCorner) {
                            collapsedDtShape.attr("rx", myConfig.roundedCorner[0] );
                            collapsedDtShape.attr("ry", myConfig.roundedCorner[1] );
                        }
                   }

                }
            }

        }
    }

    this.gerRenderingTextElement=function(){
        return renderingTextElement;
    };


    
    this.draw=function(elRoot){
        elementSvgRoot=elRoot;
        renderingShape=drawTools.drawElement(elementSvgRoot,myConfig,that);
        renderingTextElement=that.drawLabelText(elementSvgRoot,myConfig);
        var cdy=renderingTextElement.attr("dy");
        if (cdy.indexOf("px")!==-1){
            cdy=cdy.split("px")[0];
        }


        if (hasCollapsibleNodes===true&& hasCollapsibleLoopElements===false) {
            var renderCollapsedShape=(!temp_visiblityFlag || collapsedDatatype);
            if (temp_visiblityFlag===true ) renderCollapsedShape=false;
            if (temp_visiblityFlag===false) renderCollapsedShape=true;
            if (collapsedDatatype===true && temp_visiblityFlag===true){ renderCollapsedShape=true; }

            collapsedDtShape = drawTools.drawCollapsedDatatypes(that,elementSvgRoot, myConfig, myConfigCollapseDt);
            collapsedDtShape.classed("hidden",!renderCollapsedShape );
        }
        if (hasCollapsibleLoopElements===true && hasCollapsibleNodes===false) {
            if (temp_visiblityFlag===true )                renderCollapsedShape=false;
            if (temp_visiblityFlag===false)                renderCollapsedShape=true;
            if (collapsedLoop===true && temp_visiblityFlag===true){ renderCollapsedShape=true; }
            collapsedLoopShape = drawTools.drawCollapsedLoops(that,elementSvgRoot, myConfig, myConfigCollapseLoop);
            collapsedLoopShape.classed("hidden",!renderCollapsedShape );
        }
        if (hasCollapsibleLoopElements===false && hasCollapsibleLoopElements===false){
           // console.log("NOTHING TO RENDER ")
        }
        if (hasCollapsibleLoopElements===true && hasCollapsibleLoopElements===true){
            if (temp_visiblityFlag===true )                renderCollapsedShape=false;
            if (temp_visiblityFlag===false)                renderCollapsedShape=true;
            if (collapsedDatatype===true && collapsedLoop===true && temp_visiblityFlag===true){ renderCollapsedShape=true; }

            // console.log("RENDER ALL ELEMENTS");
            var loopDt=drawTools.drawAllCollapsedEllements(that,elementSvgRoot,myConfig,myConfigCollapseDt,myConfigCollapseLoop);
            collapsedLoopShape=loopDt.loop;
            // console.log("Should we hidde the elelemtsn?" + !renderCollapsedShape );
            collapsedLoopShape.classed("hidden",!renderCollapsedShape );
            collapsedDtShape = loopDt.dt;
            collapsedDtShape.classed("hidden",!renderCollapsedShape );
        }


        if (renderingShape.attr("r")){
            shapeRadius=renderingShape.attr("r");
        }



        addMouseEvents();
        if (dblClickFunction){
            renderingShape.on("dblclick",dblClickFunction);
            renderingTextElement.on("dblclick",dblClickFunction);
            if (collapsedDtShape)
                collapsedDtShape.on("dblclick",dblClickFunction);
            if (collapsedLoopShape)
                collapsedLoopShape.on("dblclick",dblClickFunction);
        }



    };

    function addMouseEvents () {
        // add Hover Events;
        addHoverEvents();
    }

    function addHoverEvents(){
        renderingShape.on("mouseover",that.mouseHoverIn);
        renderingShape.on("mouseout",that.mouseHoverOut);
    }

    this.isUmlCustomshape=function(){
        if (hasCollapsibleNodes || hasCollapsibleLoopElements){
            if (myConfigCollapseDt.renderingType==="umlStyle" || myConfigCollapseLoop.renderingType==="umlStyle") {
                return true;
            }
        }

        return false;
   };

    this.adjustShapeSize=function(radius, width, height){
        if (renderingShape) {
            // reEvaluate shape sizes;
            if (myConfig.renderingType === "circle") {
                renderingShape.attr("x", -radius);
                renderingShape.attr("y", -radius);
                renderingShape.attr("width", 2 * radius);
                renderingShape.attr("height", 2 * radius);
                renderingShape.attr("rx", radius);
                renderingShape.attr("ry", radius);
                that.setShapeRadius(radius);
            }

            if (myConfig.renderingType === "rect") {
                renderingShape.attr("x",-0.5* width);
                renderingShape.attr("y",-0.5* height);
                renderingShape.attr("width",width);
                renderingShape.attr("height",height);
                // console.log("<<<<<<<<<<<<UPDATE SHAPE SIZE TO"+ width+ "  "+ height);
                that.setShapeRadius(undefined);
            }

        }

    };

    this.getRenderingShape=function(){
        return renderingShape;
    };

    this.getRenderingTextElement=function(){
        return renderingTextElement;
    };

    this.connectDoubleClickAction=function(_callback){
        dblClickFunction=_callback;

    };
    this.handleDatatypeAndLoops=function(){
        wapi.graph.ignoreEvents();
        // console.log("handling datatype and loop collapse:" +hasCollapsibleNodes + "  " + hasCollapsibleLoopElements );
        if (hasCollapsibleNodes===false && hasCollapsibleLoopElements===false){
            // console.log("nothing to do here");
            return;
        }
        // console.log("Inside Node wants to callapse datatypes and loops;");
        collapsedDtL=!collapsedDtL;
        collapsedLoop=collapsedDtL;
        collapsedDatatype=collapsedDtL;
        nodeObject.showLoopsAndDatatype(!collapsedDtL);
    };

    function reEvaluateDatatypeAndLoopHandler(){
        collapsedDtL=(collapsedDatatype && collapsedLoop);

        // handling is like this;
        //if one of the elements is collapsed on double click will be expanded
        // if bothh are expand it will be collapsed;
        // console.log("reEvaluateDatatypeAndLoopHandler << CALLED");

    }


    this.setTemporalCollapsedElements=function(arrayOfElements){
        // use just the properties;
        tempArrayOfCollapsionElements=arrayOfElements;
    };


    this.collapseTempElements=function(val, redraw){
        if (val) temp_visiblityFlag=!val;
        else
            temp_visiblityFlag=!temp_visiblityFlag;


        // console.log("Elements should be Visible? "+ temp_visiblityFlag);
        for (var i=0;i<tempArrayOfCollapsionElements.length;i++){

            var property=tempArrayOfCollapsionElements[i];
            if (property.domain()===property.range()){
                // this is a loop;
                property.visible(temp_visiblityFlag);
                collapsedLoop=!temp_visiblityFlag;
            } else {
                property.visible(temp_visiblityFlag);
                collapsedDatatype=!temp_visiblityFlag;
                property.range().visible(temp_visiblityFlag);
            }

        }
      if (redraw===true){
            wapi.graph.redraw();
      }
    };



    this.collapseDatatypes=function(redraw){
        // console.log("calling collapse DATATYPES");
        collapsedDatatype=true;
        if (collapsedDtShape) { collapsedDtShape.classed("hidden",!collapsedDatatype);}
        nodeObject.showDatatype(!collapsedDatatype,redraw);
        // console.log("elements Collapsed Datatypes");
        reEvaluateDatatypeAndLoopHandler();

    };
    this.expandDatatypes=function(redraw){
        collapsedDatatype=false;
        if (collapsedDtShape) { collapsedDtShape.classed("hidden",!collapsedDatatype);}
        // console.log("elements Expanded Datatypes BEFORE");
        nodeObject.showDatatype(!collapsedDatatype,redraw);
        // console.log("elements Expanded Datatypes AFTER");
        reEvaluateDatatypeAndLoopHandler();
    };
    this.collapseLoops=function(redraw){
        collapsedLoop=true;
        if (collapsedLoopShape) { collapsedLoopShape.classed("hidden",!collapsedLoop);}
        nodeObject.showLoops(!collapsedLoop,redraw);
        reEvaluateDatatypeAndLoopHandler();
    };
    this.expandLoops=function(redraw){
        collapsedLoop=false;
        if (collapsedLoopShape) { collapsedLoopShape.classed("hidden",!collapsedLoop);}
        nodeObject.showLoops(!collapsedLoop,redraw);
        reEvaluateDatatypeAndLoopHandler();
    };


    this.smartExpanding=function(val){
        // TODO: // we need a computation of free angular space based on the
        // elements connected to the domain from the baseNODE ..
        // this requires the structural data which is identified when parsing the ontology;


      // val tells it if the rendering element is expanded or not
        // if true , we recompute the smart expanding positions;


        // if false (set its position to be 0, 0 ) << this is for testing;


    };



    this.handleGizmoRepresentationChanges=function(){
        if (renderingShape===undefined) return;

        if (collapsedLoopShape) { collapsedLoopShape.remove(collapsedLoopShape) ; }
        if (collapsedDtShape)   { collapsedDtShape.remove(collapsedDtShape)     ; }

        that.updateConfig();
        // create temporal renderingShape;
        var tempShapeParent=d3.select(document.createElement("g"));
        var tShape=drawTools.drawElement(tempShapeParent,myConfig,that);

        reEvaluatioTextPoistion(tShape);
        renderingShape.transition()
                .duration(300)
                .attr("x", tShape.attr("x"))
                .attr("y", tShape.attr("y"))
                .attr("width", tShape.attr("width"))
                .attr("height", tShape.attr("height"))
                .attr("rx", tShape.attr("rx"))
                .attr("ry", tShape.attr("ry") )
                .attr("fill",tShape.attr("fill"))
                .attr("style",tShape.attr("style"))
                .each("end",function(){

                    reEvaluatioTextPoistion();
                    handleTransformEnd( tShape.attr("style"), tShape.attr("fill"));
                    renderingTextElement.style("font-family",myConfig.fontFamily);
                    renderingTextElement.style("font-size",myConfig.fontSize);
                    renderingTextElement.style("fill",myConfig.fontColor);
                    addHoverEvents();
                    // remove temp elements;
                    tShape.remove();
                    tempShapeParent.remove();
                    tempShapeParent=null;
                    tShape=null;
                });
    };

    function handleTransformEnd(newStyle, fillColor){
        renderingShape.attr("style",newStyle);
        // renderingShape.attr("fill",fillColor);
        // console.log("Setting bgColor "+ renderingShape.style("fill"));


        // we need to remove the rendering elements;
        var cdy=renderingTextElement.attr("dy");
        if (cdy.indexOf("px")!==-1){
            cdy=cdy.split("px")[0];
        }

        // datatypes;
        if (hasCollapsibleNodes && !hasCollapsibleLoopElements) {
            var renderCollapsedShape=(!temp_visiblityFlag || collapsedDatatype);
            if (temp_visiblityFlag===true ) renderCollapsedShape=false;
            if (temp_visiblityFlag===false) renderCollapsedShape=true;
            if (collapsedDatatype===true && temp_visiblityFlag===true){ renderCollapsedShape=true; }
            // console.log(">>> Should draw Collapsible Datatypes");
            collapsedDtShape = drawTools.drawCollapsedDatatypes(that,elementSvgRoot, myConfig, myConfigCollapseDt);
            collapsedDtShape.classed("hidden",!renderCollapsedShape );
        }
        // loops;
        if (hasCollapsibleLoopElements && !hasCollapsibleNodes ) {
            if (temp_visiblityFlag===true )                renderCollapsedShape=false;
            if (temp_visiblityFlag===false)                renderCollapsedShape=true;
            if (collapsedLoop===true && temp_visiblityFlag===true){ renderCollapsedShape=true; }
            collapsedLoopShape = drawTools.drawCollapsedLoops(that,elementSvgRoot, myConfig, myConfigCollapseLoop);
            collapsedLoopShape.classed("hidden",!renderCollapsedShape );
        }


        if (hasCollapsibleNodes && hasCollapsibleLoopElements){

                if (temp_visiblityFlag===true )                renderCollapsedShape=false;
                if (temp_visiblityFlag===false)                renderCollapsedShape=true;
                if (collapsedDatatype===true && collapsedLoop===true && temp_visiblityFlag===true){ renderCollapsedShape=true; }

            var loopDt=drawTools.drawAllCollapsedEllements(that,elementSvgRoot,myConfig,myConfigCollapseDt,myConfigCollapseLoop);
            collapsedLoopShape=loopDt.loop;
            collapsedLoopShape.classed("hidden",!renderCollapsedShape );
            collapsedDtShape = loopDt.dt;
            collapsedDtShape.classed("hidden",!renderCollapsedShape);


        }
        if (myConfigCollapseDt.renderingType==="umlStyle" || myConfigCollapseLoop.renderingType==="umlStyle") {
            if (collapsedLoopShape && collapsedLoopShape.classed("hidden") === false ||
                collapsedDtShape && collapsedDtShape.classed("hidden") === false) {
                // do nothing
            }
            else {
                reEvaluatioTextPoistion();

            }
        }

        // reEvaluate node text stuff
        // if (myConfigCollapseDt.renderingType==="umlStyle" || myConfigCollapseLoop.renderingType==="umlStyle"){
        //     // assume new position of the text element;
        //     renderingTextElement.attr("dy",cdy+"px"); // reset position;
        //     if ((collapsedDtShape && collapsedDtShape.classed("hidden")===false) ||
        //         collapsedLoopShape&& collapsedLoopShape.classed("hidden")===false) {
        //         drawTools.updateTextPositionForUMLNotation(renderingTextElement, that, myConfig, myConfigCollapseDt);
        //     }
        //}



    }


};

Base.prototype = Object.create(BaseElement.prototype);
Base.prototype.constructor = Base;


return Base;
}());