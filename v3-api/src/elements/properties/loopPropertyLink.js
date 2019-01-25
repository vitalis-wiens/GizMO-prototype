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
        var linkDistance=120;
        var arrowHead,arrowtail;
        var configName;
        var my_markerContainer;
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
                myConfig=wapi.elementsConfig["defaultPropertyElement"];
            }
        };

        this.createPropertyNode=function(labelText){
            that.setLabelText(labelText);
            propertyNode= new propNodeConst(wapi);
            propertyNode.setConfigName(configName);
            propertyNode.updateConfig();
            propertyNode.x=0;
            propertyNode.y=0;
            propertyNode.setLabelText(labelText);
            propertyNode.charge(-500);
            propertyNode.isForceNodeForProperty(true);
            propertyNode.isLinkElement(true);
            propertyNode.setLinkElement(that);
            propertyNode.tNode(propertyObject);

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
            if (!renderingShape) return;
            renderingShape.attr("d", lineFunction(calculateLoopPath()));
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
            my_markerContainer=markerContainer;
            renderingShape=drawTools.drawArcLinkElement(elementSvgRoot,myConfig);
            arrowHead=drawTools.drawArrowHead(elementSvgRoot,markerContainer,that.id()+"_arrowHead",myConfig);
            // addMouseEvents();
        };

        this.handleGizmoRepresentationChanges=function(index,size,_callBack,_param){

            if (renderingShape===undefined) return;
            that.updateConfig();

            // using true flag to get the expected positions
            // renderingShape.attr("d", lineFunction(calculateLoopPath(true)));
            // create temporal renderingShape;
            var tempShapeParent=d3.select(document.createElement("g"));
            var tShape=drawTools.drawArcLinkElement(tempShapeParent,myConfig);


            renderingShape.transition()
                .duration(300)
                .attr("style",tShape.attr("style"))
                .attr("d", lineFunction(calculateLoopPath(true)))
                .each("end",function(){tShape.remove();
                        if (index===size){
                            if (_callBack && _param){
                                _callBack(_param)
                            }else {
                                wapi.graph.resumeForce();
                            }
                            wapi.graph.resumeForce();
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
            .interpolate("cardinal")
            .tension(-1);

        function calculateLoopPath(expected) {
            var node = domain;
            var label = propertyNode;
            var divisor=2;
            if (propertyObject && propertyObject.getLinkStructure()) {
                divisor = propertyObject.getLinkStructure().getNumberOfLinks();
            }
            var fairShareLoopAngle = 360 / divisor,
                fairShareLoopAngleWithMargin = fairShareLoopAngle * 0.8,
                loopAngle = Math.min(60, fairShareLoopAngleWithMargin);

            var dx = label.x - node.x,
                dy = label.y - node.y,
                labelRadian = Math.atan2(dy, dx),
                labelAngle = calculateAngle(labelRadian);

            var startAngle = labelAngle - loopAngle / 2,
                endAngle = labelAngle + loopAngle / 2;


            var radius=node.getRadius();
            if (expected)
                radius=node.getExpectedShapeRadius();

            var arcFrom = calculateRadian(startAngle),
                arcTo = calculateRadian(endAngle),

                x1 = Math.cos(arcFrom) * radius,
                y1 = Math.sin(arcFrom) * radius,

                x2 = Math.cos(arcTo) * radius,
                y2 = Math.sin(arcTo) * radius,

                fixPoint1 = {"x": domain.x + x1, "y": domain.y + y1},
                fixPoint2 = {"x": label.x, "y": +label.y},
                fixPoint3 = {"x": domain.x + x2, "y": domain.y + y2};

            return [fixPoint1, fixPoint2, fixPoint3];
        }

        function calculateRadian(angle) {
            angle = angle % 360;
            if (angle < 0) {
                angle = angle + 360;
            }
            return (Math.PI * angle) / 180;
        }

        function calculateAngle(radian) {
            return radian * (180 / Math.PI);
        }



    };




    Base.prototype = Object.create(BaseElement.prototype);
    Base.prototype.constructor = Base;


    return Base;
}());