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
        var configName;
        var propertyNode=undefined;
        var mlContainer;
        var domain,range;
        var propertyObject;
        var arrowHead,arrowTail;




        var linkVisible=false;
        this.visible=function(val){
            if (!arguments.length){
                return linkVisible;
            }else{
                linkVisible=val;
            }
        };

        var linkDistance=350;
        this.linkDistance=function(val){
            if(!arguments.length){
                return linkDistance;}
            else{ linkDistance=val;}
        };
        var linkStrength=0.5;
        this.linkStrength=function(val){
            if(!arguments.length){
                return linkStrength;}
            else{ linkStrength=val;}
        };


        this.setLinkContainer=function(container){
            mlContainer=container;
            domain=mlContainer.domain().renderingPrimitive();
            range=mlContainer.range().renderingPrimitive();
            text="<"+container.getNumberOfLinks()+">";

        };
        this.setPropertyNode=function(propertyN){
            propertyNode=propertyN;
        };

        this.setLabelText=function(value){
            text=value;
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

        this.setConfigName=function(name){
            configName=name;
        };

        this.updateConfig=function(){
            myConfig=wapi.elementsConfig[configName];
            if (myConfig===undefined){
                myConfig=wapi.elementsConfig["collapsedMultiLinkProperty"];
            }
        };


        this.interpolateML_Position=function(){
            // console.log("domain: x:"+domain.x+ "  y:"+domain.y);
            // console.log("range: x:"+range.x+ "  y:"+range.y);
            that.updateDrawedPosition();
        };

        this.getPropertyNode=function(){
            return propertyNode;
        };

        this.createPropertyNode=function(labelText){
            that.setLabelText(text);
            propertyNode= new propNodeConst(wapi);
            propertyNode.setConfigName(configName);
            this.updateConfig();
            propertyNode.updateConfig();
            propertyNode.x=0;
            propertyNode.y=0;
            propertyNode.setLabelText(text);
            propertyNode.isNotExportable(true);

            propertyNode.connectDoubleClickAction(handleCollapseExpansion);
            propertyNode.tNode(propertyObject);
            propertyNode.isLinkElement(true);
            propertyNode.setLinkElement(that);
            return propertyNode;
        };

        this.getRenderingShape=function(){
            return renderingShape;
        };
        this.mouseHoverIn=function(){
            if (that.mouseEntered()) return;
            that.mouseEntered(true);
        };

        this.mouseHoverOut=function(){
            that.mouseEntered(false);
        };
        this.updateDrawedPosition=function(){

            if (!renderingShape){
                // console.log("multilink has no rendering shape oO");
                return;

            }
            // TODO vvvvv Put this into function for handling
            var iP=wapi.computeIntersectionPoints(domain,range,1);


            renderingShape.attr("x1", iP.x1)
                .attr("y1", iP.y1)
                .attr("x2", iP.x2)
                .attr("y2", iP.y2);



            // console.log("renderingML line:  "+renderingShape.attr("x1")+" " +
            // renderingShape.attr("y1")+" " +
            // renderingShape.attr("x2")+" " +
            // renderingShape.attr("y2")+" " );


            // console.log(renderingShape.node());

            var cx=0.5*(iP.x2+iP.x1);
            var cy=0.5*(iP.y2+iP.y1);
            propertyNode.setPosition(cx,cy);
            propertyNode.updateDrawedPosition();


        };

        this.getForceLink=function(){
            return [{ "source": that.domain(),
                "target": that.range(),
                "propertyData": that
            }
            ];
        };

        this.draw=function(elRoot,markerContainer){
            if (propertyNode===undefined){
                //missing Property node;

            }
            // console.log("Drawing ML Handler")
            elementSvgRoot=elRoot;
            renderingShape=drawTools.drawLinkElement(elementSvgRoot,myConfig);
            arrowHead=drawTools.drawArrowHead(elementSvgRoot,markerContainer,that.id()+"_arrowHead",myConfig);

            // addMouseEvents();
        };

        this.expandMultiLinks=function(redraw){
            wapi.graph.ignoreEvents();
            ML_expand(redraw);
        };

        this.collapseMultiLinks=function(redraw){
            wapi.graph.ignoreEvents();
            ML_collapse(redraw);
        };

        this.expandMultiLinksForView=function(){
            wapi.graph.ignoreEvents();
            ML_expandForView();
        };

        this.collapseMultiLinksForView=function(){
            wapi.graph.ignoreEvents();
            ML_collapseForView();
        };


        function addMouseEvents () {
            // add Hover Events;
            addHoverEvents();
        }

        function addHoverEvents(){
            renderingShape.on("mouseover",that.mouseHoverIn);
            renderingShape.on("mouseout",that.mouseHoverOut);
        }



        // add ml expansion functions;

        function ML_expandForView() {
            var props=mlContainer.getPropertyMap();


            // compute vector
            var dX=domain.x;
            var dY=domain.y;
            var rX=range.x;
            var rY=range.y;

            var vX=rX-dX;
            var vY=rY-dY;

            var len=Math.sqrt(vX*vX+vY*vY);
            var nX=vX/len;
            var nY=vY/len;

            var halfX=nX*0.5*len;
            var halfY=nY*0.5*len;

            // orthonagonal vector
            var oX=nY;
            var oY=-nX;

            var offset=20;

            var total=offset*props.length;
            var halfOffsetX=halfX+0.5*-1*oX*total;
            var halfOffsetY=halfY+0.5*-1*oY*total;

            for (i=0;i<props.length;i++){
                var prNode=props[i].getRenderingPrimitive().getPropertyNode();
                prNode.updateConfig();
                prNode.x=dX+halfOffsetX+oX*offset*i;
                prNode.px=dX+halfOffsetX+oX*offset*i;
                prNode.y=dY+halfOffsetY+oY*offset*i;
                prNode.py=dY+halfOffsetY+oY*offset*i;

            }


            for (var i=0;i<props.length;i++){
                props[i].getRenderingPrimitive().visible(true);
                props[i].getRenderingPrimitive().updateConfig();
            }
            linkVisible=false;
            if (propertyNode) propertyNode.visible(false);
            wapi.graph.redrawForView();
        }




        function ML_expand(redraw){
            var props=mlContainer.getPropertyMap();

            // console.log(">>>>>>>>>>>>ML EXPAND?> ");

            // compute vector
            var dX=domain.x;
            var dY=domain.y;
            var rX=range.x;
            var rY=range.y;

            var vX=rX-dX;
            var vY=rY-dY;

            var len=Math.sqrt(vX*vX+vY*vY);
            var nX=vX/len;
            var nY=vY/len;

            var halfX=nX*0.5*len;
            var halfY=nY*0.5*len;

            // orthonagonal vector
            var oX=nY;
            var oY=-nX;

            var offset=20;

            var total=offset*props.length;
            var halfOffsetX=halfX+0.5*-1*oX*total;
            var halfOffsetY=halfY+0.5*-1*oY*total;

            for (i=0;i<props.length;i++){
                var prNode=props[i].getRenderingPrimitive().getPropertyNode();
                prNode.updateConfig();
                prNode.x=dX+halfOffsetX+oX*offset*i;
                prNode.px=dX+halfOffsetX+oX*offset*i;
                prNode.y=dY+halfOffsetY+oY*offset*i;
                prNode.py=dY+halfOffsetY+oY*offset*i;

            }


            for (var i=0;i<props.length;i++){
                props[i].getRenderingPrimitive().visible(true);
                props[i].getRenderingPrimitive().updateConfig();
            }

            linkVisible=false;
            if (propertyNode) propertyNode.visible(false);

            // console.log("expanded elements, so node should not be visible");

            if (redraw && redraw===true) wapi.graph.redraw();
        }


        function ML_collapseForView(redraw){
            var props=mlContainer.getPropertyMap();
            for (var i=0;i<props.length;i++){
                props[i].getRenderingPrimitive().visible(false);
            }
            linkVisible=true;
            if (propertyNode) propertyNode.visible(true);
            wapi.graph.redrawForView();
        }

        function ML_collapse(redraw){
            var props=mlContainer.getPropertyMap();
            for (var i=0;i<props.length;i++){
                props[i].getRenderingPrimitive().visible(false);
            }
            linkVisible=true;
            if (propertyNode) propertyNode.visible(true);
            if (redraw && redraw===true) wapi.graph.redraw();
        }

        function handleCollapseExpansion() {
            wapi.graph.ignoreEvents();
            linkVisible ? ML_expand(true) : ML_collapse(true);
        }
        this.handleGizmoRepresentationChanges=function(index,size,_callBack,_param){
            // console.log("MultiLinkHandler  Property Link yupdate for Gizmo Animation");
            if (renderingShape===undefined) return;
            that.updateConfig();
            var iP=wapi.computeExpected_IntersectionPoints(domain,range,1);
            var cx=0.5*(iP.x2+iP.x1);
            var cy=0.5*(iP.y2+iP.y1);
            propertyNode.setPosition(cx,cy);
            propertyNode.updateDrawedPosition();
            // console.log(propertyNode.getRenderingShape());
            // create temporal renderingShape;
            var tempShapeParent=d3.select(document.createElement("g"));




            var tShape=drawTools.drawLinkElement(tempShapeParent,myConfig);
            renderingShape.transition()
                .duration(300)
                .attr("style",tShape.attr("style"))
                .attr("x1", iP.x1)
                .attr("y1", iP.y1)
                .attr("x2", iP.x2)
                .attr("y2", iP.y2)
                .each("end",function(){tShape.remove();



                    if (index===size){
                        if (_callBack && _param){
                            _callBack(_param)
                        }else {
                            wapi.graph.resumeForce();
                        }

                    }


                });
        };


    };

    Base.prototype = Object.create(BaseElement.prototype);
    Base.prototype.constructor = Base;


    return Base;
}());