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
        var arrowHead,arrowTail;
        var my_markerContainer;
        var linkDistance=200;
        var configName;
        this.linkDistance=function(val){
            if(!arguments.length){
                return linkDistance;}
            else{ linkDistance=val;}
        };
        var linkStrength=1;
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
                if (propertyNode) propertyNode.visible(linkVisible);
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

        this.getPropertyNode=function(){
            return propertyNode;
        };

        this.createPropertyNode=function(labelText){
            that.setLabelText(labelText);
            // console.log("Creating multiLInk property element : "+ configName);
            propertyNode= new propNodeConst(wapi);
            propertyNode.setConfigName(configName);
            propertyNode.defaultElementType("collapsedMultiLinkProperty");
            propertyNode.x=0;
            propertyNode.y=0;
            propertyNode.setLabelText(labelText);
            propertyNode.connectDoubleClickAction(handleCollapseExpansion);
            propertyNode.charge(-2000);
            propertyNode.tNode(propertyObject);
            propertyNode.isForceNodeForProperty(true);
            propertyNode.isLinkElement(true);
            propertyNode.setLinkElement(that);
            return propertyNode;
        };

        function handleCollapseExpansion() {
            wapi.graph.ignoreEvents();
            // console.log("handling collapse opteration! ");
            ML_collapse(true);
            // console.log("done")

        }
        function ML_collapse(redraw){
            propertyObject.getLinkStructure().getRenderingPrimitive().collapseMultiLinks(redraw);
        }

        this.mouseHoverIn=function(){
            if (that.mouseEntered()) return;
            that.mouseEntered(true);
        };

        this.mouseHoverOut=function(){
            that.mouseEntered(false);
        };
        this.updateDrawedPosition=function(){
            if (!renderingShape) return;
            renderingShape.attr("d", lineFunction(calculateLinkPath()));
            // // TODO vvvvv Put this into function for handling
            // renderingShape.attr("x1", domain.x)
            //     .attr("y1", domain.y)
            //     .attr("x2", range.x)
            //     .attr("y2", range.y);

            // var cx=0.5*(range.x+domain.x);
            // var cy=0.5*(range.y+domain.y);
            // propertyNode.setPosition(cx,cy);
            propertyNode.updateDrawedPosition();

        };

        this.getForceLink=function(){
            if (!linkVisible) return [];
            return [
                {
                    "source": that.domain(),
                    "target": propertyNode,
                    "propertyData": that
                },{
                    "source": propertyNode,
                    "target": that.range(),
                    "propertyData": that
                }
            ];
        };

        this.draw=function(elRoot,markerContainer){
            if (!linkVisible) return;
            if (propertyNode===undefined){
                //missing Property node;

            }
            elementSvgRoot=elRoot;
            //renderingShape=drawTools.drawLinkElement(elementSvgRoot,myConfig);
            renderingShape=drawTools.drawArcLinkElement(elementSvgRoot,myConfig);
            my_markerContainer=markerContainer;
            arrowHead=drawTools.drawArrowHead(elementSvgRoot,markerContainer,that.id()+"_arrowHead",myConfig);
            // addMouseEvents();
        };
        this.handleGizmoRepresentationChanges=function(index,size,_callBack,_param){
            // console.log("MultiLink Property Link update for Gizmo Animation");
            if (renderingShape===undefined) return;
            that.updateConfig();

            // renderingShape.attr("d", lineFunction(calculateLinkPath(true)));
            // create temporal renderingShape;
            var tempShapeParent=d3.select(document.createElement("g"));
            var tShape=drawTools.drawArcLinkElement(tempShapeParent,myConfig);
            renderingShape.transition()
                .duration(300)
                .attr("style",tShape.attr("style"))
                .attr("d", lineFunction(calculateLinkPath(true)))
                .each("end",function(){tShape.remove();
                    if (index===size){
                        if (_callBack && _param){
                            _callBack(_param)
                        }else {
                            wapi.graph.resumeForce();
                        }
                    }
                });

            var tPM=drawTools.drawArrowHead(elementSvgRoot,my_markerContainer,that.id()+"_arrowHead",myConfig);

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



        // helper :

        var lineFunction = d3.svg.line()
            .x(function (d) {
                return d.x;
            })
            .y(function (d) {
                return d.y;
            })
            .interpolate("cardinal");


        function calculateLinkPath(expected) {
            var iP;
            if (expected) {
                iP=wapi.computeExpected_IntersectionPointsForMLP(domain,propertyNode,range,1);
            }else {
                iP = wapi.computeIntersectionPointsForMLP(domain,propertyNode, range, 1);
            }

            var fixPoint1 = {"x": iP.x1, "y": iP.y1},
                fixPoint2 = {"x": propertyNode.x, "y": propertyNode.y},
                fixPoint3 = {"x": iP.x2, "y": iP.y2};


            return [fixPoint1, fixPoint2, fixPoint3];
        }

    };




    Base.prototype = Object.create(BaseElement.prototype);
    Base.prototype.constructor = Base;


    return Base;
}());