var dth  = require("./drawToolsHelper")();
module.exports = function (wapi) {
    var drawTools={};

    drawTools.cropTextToItsWidth=function(width,textElement){
        dth.cropText(width,textElement);
    };
    drawTools.getHelper=function(){
        return dth;
    };



    drawTools.computeRequiredShapeSize=function(textElement,pNode,pCfg,dtCfg,lpCfg){
        var fontFamily = window.getComputedStyle(textElement.node()).getPropertyValue("font-family");
        var fontSizeProperty = window.getComputedStyle(textElement.node()).getPropertyValue("font-size");
        var fontSize = parseFloat(fontSizeProperty);
        var cdy=textElement.attr("dy");
        if (cdy.indexOf("px")!==-1){
            cdy=cdy.split("px")[0];
        }
        var udy;
        // we need parent RenderingType;
        var parentType=pCfg.renderingType;

        if (parentType==="rect"){

            // console.log(">>>>>>>>>>>>>TODO <<<<<<<< Combined rendering Elements");

        }

    };

    drawTools.drawAllCollapsedEllements=function(pNode,pGroup,pConf,dtColConf,lpColConf){
        var renderingShapeLoop;
        var renderingShapeDt;
        /** No rendering type for collpased loops**/
        if (dtColConf.renderingType==="none" && lpColConf.renderingType==="none" ){
            // not really needed but for otherwise we need to check if it exists
            renderingShapeLoop=pGroup.append("rect");
            renderingShapeDt=pGroup.append("rect");

            return {loop:renderingShapeLoop, dt:renderingShapeDt};
        }

        //     // compute the height of the elements ()
        //     renderingShape=parentGroup.append("g");
        //     var renderingTextElement=pNode.gerRenderingTextElement();
        //     var availableWidth=drawTools.computeRequiredShapeSize(renderingTextElement,pNode,pConf,dtColConf,lpColConf);
        //
        //
        //
        // }

     if (dtColConf.renderingType==="umlStyle" && lpColConf.renderingType==="umlStyle" ) {
         // the oder is fixed to first show dt and then loops.
         renderingShapeDt = pGroup.append("g");
         renderingShapeLoop = pGroup.append("g");
         renderingShapeDt.attr("id", pNode.id() + "collapsedDTShape");
         renderingShapeLoop.attr("id", pNode.id() + "collapsedLoopShape");


         var renderingTextElement = pNode.gerRenderingTextElement();
         // console.log("Rendering Combined Stuff ----------------------------------------\n >>>>>>>>>>>>>>>>");

         // get required width for shape element
         var shapeSize = estimateShapeSize(pNode, renderingTextElement, lpColConf, dtColConf);

//        dth.drawUMLElementsForLoops(availableWidth,renderingShape,parentNode,parentNode.getConfigObj(),collapsedConfig);
         if (dtColConf.umlDrawHeaderLine === "true" || lpColConf.umlDrawHeaderLine === "true") {
             drawUMLHeaderLine(renderingShapeDt, pNode);
             // console.log(" > drawing headerLine");
         }

         dth.drawUMLElementsForDatatypesAndLoops(shapeSize.width,renderingShapeDt,renderingShapeLoop,pNode,pNode.getConfigObj(),dtColConf,lpColConf);



         return {loop: renderingShapeLoop, dt: renderingShapeDt};
     }
     else {
         renderingShapeLoop = pGroup.append("rect");
         renderingShapeDt = pGroup.append("rect");
         return {loop: renderingShapeLoop, dt: renderingShapeDt};
     }
    };



    function estimateShapeSize(parent, textElement, lconf,dconf){
        var fontFamily = window.getComputedStyle(textElement.node()).getPropertyValue("font-family");
        var fontSizeProperty = window.getComputedStyle(textElement.node()).getPropertyValue("font-size");
        var fontSize = parseFloat(fontSizeProperty);
        var cdy=textElement.attr("dy");
        if (cdy.indexOf("px")!==-1){
            cdy=cdy.split("px")[0];
        }

        var udy;

        // first we want the height of our rendering shape element;
        var collapsedDataProperties=dth.getCollapsedDatatypesProperties(parent);
        var collapsedLoops=dth.getCollapsedLoopProperties(parent);
        // use segment height for their representation;
        // use the umlScaleFactor to adjust the size of the renderingElements inside the uml element;
        var l_scaleFactor=parseFloat(lconf.umlElementScaleFactor);
        var d_scaleFactor=parseFloat(dconf.umlElementScaleFactor);
        var requredHeight=parseInt(fontSize) + 3 ;

        var i;
        var loopWidth=0;
        var dtWidth=0;
        for (i=0;i<collapsedDataProperties.length;i++){
            var d_wxh=collapsedDataProperties[i].getPropertyNode().computeUMLElementSize();
            var d_sw=d_scaleFactor*d_wxh.w;
            var d_sh=d_scaleFactor*d_wxh.h;
            // console.log(d_sh+parseInt(dconf.umlHeightOffset));
            requredHeight+=d_sh+parseInt(dconf.umlHeightOffset);
            dtWidth=Math.max(dtWidth,d_sw);

        }

        for (i=0;i<collapsedLoops.length;i++){
            var l_wxh=collapsedLoops[i].getPropertyNode().computeUMLElementSize();
            var l_sw=l_scaleFactor*l_wxh.w;
            var l_sh=l_scaleFactor*l_wxh.h;
            requredHeight+=l_sh+parseInt(lconf.umlHeightOffset);
            loopWidth=Math.max(loopWidth,l_sw);
        }
        requredHeight+=parseInt(dconf.umlOffsetToHeader);
        requredHeight+=parseInt(dconf.umlOffsetToAfterLastElement);

        // adjust size ;
        var shape=parent.getRenderingShape();
        var currentWidth=shape.attr("width");

        var requiredWidth=currentWidth;
        var headerWidth=parent.computeRequiredWidth();


        if (dconf.umlShapeAdjustsShapeSize==="header"){
            requiredWidth=headerWidth;
        }

        if (dconf.umlShapeAdjustsShapeSize==="datatypes"){
            requiredWidth=dtWidth;
        }
        if (dconf.umlShapeAdjustsShapeSize==="loops"){
            requiredWidth=loopWidth;
        }
        if (dconf.umlShapeAdjustsShapeSize==="allElements"){
            var a=Math.max(loopWidth,dtWidth);
            var b=Math.max(headerWidth,currentWidth);
            requiredWidth=Math.max(a,b);
        }

        // min width is the headerWidth;
        requiredWidth=Math.max(requiredWidth,headerWidth);
        requiredWidth+=parseInt(dconf.umlMarginLeft);
        requiredWidth+=parseInt(dconf.umlMarginRight);

        parent.adjustShapeSize(undefined, requiredWidth, requredHeight);
        var height=parseFloat(shape.attr("height"));
        udy=-0.5*height+fontSize;
        textElement.attr("dy",udy+"px");

        // render the individual elements
        return {width:requiredWidth,height:requredHeight};
    }



     /** collapsed loops and datatypes based on their definitions
      * using dth to capsule some of the reoccurring functions to reduce code reading complexity**/
     drawTools.drawCollapsedLoops=function(parentNode,parentGroup, parentConfig, collapsedConfig){
         // console.log("drawing collapsible LOOPS!");
         // console.log(parentConfig);
         // console.log(collapsedConfig);
         // console.log("#####################");

         var renderingShape;
        /** No rendering type for collpased loops**/
        if (collapsedConfig.renderingType==="none") {
            // not really needed but for otherwise we need to check if it exists
            renderingShape=parentGroup.append("rect");
            return renderingShape;
        }

         /** collapsed loops using "INSHAPE" as rendering element **/
        if (collapsedConfig.renderingType==="inshape"){

            /** indicator: basically an additional stroke with further options **/
            if (collapsedConfig.inshapeType==="indicator"){
                renderingShape=parentGroup.append("rect");
                dth.applyIndicatorShapeParameter(renderingShape,parentNode,parentConfig,collapsedConfig);
            }
            /** segment: renders segments into shape, allows to hover and see element name **/
            if (collapsedConfig.inshapeType==="segment"){
                renderingShape=parentGroup.append("g");
                dth.applySegmentShapeParameterForLoops(renderingShape,parentNode,parentConfig,collapsedConfig,"loopElement");
            }
        }


        /** uml - style notation **/

        if (collapsedConfig.renderingType==="umlStyle"){
            renderingShape=parentGroup.append("g");
            // assume new position of the text element;
            var renderingTextElement=parentNode.gerRenderingTextElement();
            var availableWidth=drawTools.updateTextPositionForUMLNotation(renderingTextElement,parentNode,parentNode.getConfigObj(),collapsedConfig);
            dth.drawUMLElementsForLoops(availableWidth,renderingShape,parentNode,parentNode.getConfigObj(),collapsedConfig);
            if (collapsedConfig.umlDrawHeaderLine==="true") {
                drawUMLHeaderLine(renderingShape, parentNode);
            }
        }
        renderingShape.attr("id",parentNode.id()+"collapsedLoopShape");
        return renderingShape;
    };


    drawTools.drawCollapsedDatatypes=function(parentNode,parentGroup, parentConfig, collapsedConfig){
        var renderingShape;
        /** No rendering type for collpased loops**/
        if (collapsedConfig.renderingType==="none") {
            // not really needed but for otherwise we need to check if it exists
            renderingShape=parentGroup.append("rect");
            return renderingShape;
        }

        /** collapsed loops using "INSHAPE" as rendering element **/
        if (collapsedConfig.renderingType==="inshape"){

            /** indicator: basically an additional stroke with further options **/
            if (collapsedConfig.inshapeType==="indicator"){
                renderingShape=parentGroup.append("rect");
                dth.applyIndicatorShapeParameter(renderingShape,parentNode,parentConfig,collapsedConfig);
            }
            /** segment: renders segments into shape, allows to hover and see element name **/
            if (collapsedConfig.inshapeType==="segment"){
                renderingShape=parentGroup.append("g");
                dth.applySegmentShapeParameterForDatatypes(renderingShape,parentNode,parentConfig,collapsedConfig,"dtType");
            }
        }

        if (collapsedConfig.renderingType==="umlStyle"){
            renderingShape=parentGroup.append("g");
            var renderingTextElement=parentNode.gerRenderingTextElement();
            // get required width for shape element
            var shapeSize = estimateShapeSize(parentNode, renderingTextElement, collapsedConfig, collapsedConfig);
            //var availableWidth=drawTools.updateTextPositionForUMLNotation(renderingTextElement,parentNode,parentNode.getConfigObj(),collapsedConfig);
            dth.drawUMLElementsForDatatypes(shapeSize.width,renderingShape,parentNode,parentNode.getConfigObj(),collapsedConfig);
            if (collapsedConfig.umlDrawHeaderLine==="true") {
                drawUMLHeaderLine(renderingShape, parentNode);
            }
        }
        renderingShape.attr("id",parentNode.id()+"collapsedDataShape");

        return renderingShape;

    };

    function drawUMLHeaderLine(renderingGroup,parentNode){

        var line=renderingGroup.append("line");

        var x=parentNode.getRenderingShape().attr("x");
        var y=parentNode.getRenderingShape().attr("y");
        var w=parentNode.getRenderingShape().attr("width");
        var h=parentNode.getRenderingShape().attr("height");

        var textElement=parentNode.getRenderingTextElement();
        var fontSizeProperty = window.getComputedStyle(textElement.node()).getPropertyValue("font-size");
        var fontSize = parseFloat(fontSizeProperty);


        var linePosY=parseFloat(y)+8+fontSize;
        var linePosX=parseFloat(x)+parseFloat(w);
        line.attr("x1", x)
            .attr("y1", linePosY)
            .attr("x2", linePosX)
            .attr("y2", linePosY);
        line.style("stroke","black");


    }





    /** draws the element based on its config (rect, circle, ellipse, and other parameters) **/
    drawTools.drawElement=function(parentGroup,configObject,parentNode){
        var renderingShape=parentGroup.append("rect");
        var radius,width,height;

        if (parentNode) {
            var shapeOBJ = parentNode.getExpectedShapeSize();
            radius = shapeOBJ.r;
            width = shapeOBJ.w;
            height = shapeOBJ.h;
        }else{
            radius=parseInt(configObject.radius);
            width=parseInt(configObject.width);
            height=parseInt(configObject.height);
        }

        /**  render a pure cirlce **/
        if (configObject.renderingType==="circle"){

            renderingShape.attr("x",-radius);
            renderingShape.attr("y",-radius);
            renderingShape.attr("width",2*radius);
            renderingShape.attr("height",2*radius);
            renderingShape.attr("rx",radius);
            renderingShape.attr("ry",radius);
        }

        /**  render a rectangle with possible rounded corners provided by config **/
        if (configObject.renderingType==="rect"){
            renderingShape.attr("x",-0.5* width);
            renderingShape.attr("y",-0.5* height);
            renderingShape.attr("width",width);
            renderingShape.attr("height",height);
            if (configObject.roundedCorner){
                renderingShape.attr("rx",parseFloat(configObject.roundedCorner[0]));
                renderingShape.attr("ry",parseFloat(configObject.roundedCorner[1]));
            }
        }

        /**  render an ellips **/
        if (configObject.renderingType==="ellipse"){
            renderingShape.attr("x",-0.5* width);
            renderingShape.attr("y",-0.5* height);
            renderingShape.attr("width",width);
            renderingShape.attr("height",height);
            renderingShape.attr("rx",width);
            renderingShape.attr("ry",height);
        }

        /** apply stroke and fill colors as addition stroke style related paramters **/
        renderingShape.attr("fill",configObject.bgColor);
        if (configObject.strokeElement===true || configObject.strokeElement==="true") {
            renderingShape.style("stroke", configObject.strokeColor);
            renderingShape.style("stroke-width", configObject.strokeWidth);
            if (configObject.strokeStyle!=="solid"){
                if (configObject.strokeStyle==="dashed") renderingShape.style("stroke-dasharray", 8);
                if (configObject.strokeStyle==="dotted") renderingShape.style("stroke-dasharray", 3);
            }
        }

        return renderingShape;
    };

    /** link elements (straight line or arc)  **/
    drawTools.drawLinkElement=function(parentGroup,configObject){
          var renderingShape;
        if (configObject.link_strokeWidth) {

            renderingShape = parentGroup.append(configObject.link_renderingType);
            renderingShape.style("stroke",configObject.link_strokeColor);
            renderingShape.style("stroke-width",configObject.link_strokeWidth);
            renderingShape.style("stroke-width",configObject.link_strokeWidth);
            if (configObject.link_strokeStyle!=="solid"){
                if (configObject.link_strokeStyle==="dashed") renderingShape.style("stroke-dasharray", 8);
                if (configObject.link_strokeStyle==="dotted") renderingShape.style("stroke-dasharray", 3);
            }
        }else{
          renderingShape = parentGroup.append("line");
          renderingShape.style("stroke","#000");
          renderingShape.style("stroke-width","2px");
      }
          return renderingShape;
    };
    drawTools.drawArcLinkElement=function(parentGroup,configObject){
        // FORCE IT TO BE A PATH THAT IS ADJUSTED BY THE PROPERTY LINK ITSELF
        var renderingShape;
        if (configObject.link_strokeWidth) {
            renderingShape = parentGroup.append("path");
            renderingShape.style("stroke",configObject.link_strokeColor);
            renderingShape.style("stroke-width",configObject.link_strokeWidth);
            if (configObject.link_strokeStyle!=="solid"){
                if (configObject.link_strokeStyle==="dashed") renderingShape.style("stroke-dasharray", 8);
                if (configObject.link_strokeStyle==="dotted") renderingShape.style("stroke-dasharray", 3);
            }
        }else{
            renderingShape = parentGroup.append("path");
            renderingShape.style("stroke","#000");
            renderingShape.style("stroke-width","2px");
        }
        renderingShape.style("fill","none");
        return renderingShape;
    };

    /** marker elements **/
    drawTools.drawArrowHead=function(parent,container,identifier,configObject){

        if (configObject.link_arrowHead === "true") {
            var v1,v2,v3,v4;
            var scale=configObject.link_arrowHead_scaleFactor;
            v1=scale*-14;
            v2=scale*-10;
            v3=scale*28;
            v4=scale*20;

            var vB_String=v1+" "+v2+" "+v3+" "+v4;
            var arrowHead = container.append("marker")
            // .datum(property)
                .attr("id", identifier)
                .attr("viewBox", vB_String)
                .attr("markerWidth", scale*10)
                .attr("markerHeight",scale*10)
                //.attr("markerUnits", "userSpaceOnUse")
                .attr("orient", "auto");

            parent.attr("marker-end", "url(#" + identifier + ")");

            var m1X = -12*scale;
            var m1Y = 8*scale;
            var m2X = -12*scale;
            var m2Y = -8*scale;
            var renderingShape = arrowHead.append("path");
            renderingShape.attr("d", "M0,0L " + m1X + "," + m1Y + "L" + m2X + "," + m2Y + "L" + 0 + "," + 0);
            renderingShape.style("stroke", configObject.link_arrowHead_strokeColor);
            renderingShape.style("stroke-width", configObject.link_arrowHead_strokeWidth);
            renderingShape.style("fill", configObject.link_arrowHead_fillColor);
            if (configObject.link_arrowHead_strokeStyle!=="solid"){
                if (configObject.link_arrowHead_strokeStyle==="dashed") renderingShape.style("stroke-dasharray", 8);
                if (configObject.link_arrowHead_strokeStyle==="dotted") renderingShape.style("stroke-dasharray", 3);
            }
            return [arrowHead,renderingShape];
        }


    };
    drawTools.drawArrowTail=function(container,identifier,configObject){};


    /** -- uml style --**/
    drawTools.updateTextPositionForUMLNotation=function(text,parentNode,parentCfg,collapseCfg){
        return dth.reEvaulateUMLStylePositions(text,parentNode,parentCfg,collapseCfg);


    };



    /** object return **/
    return drawTools;
};