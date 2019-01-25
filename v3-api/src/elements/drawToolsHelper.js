module.exports = function (wapi) {
    var dth={};


    dth.cropText=function(availableWidth,txtElement){
        // given the availableWidth and the txt element it will automatically set the cropped text
        var originalText=txtElement.text();
        var index=1;

        var fontSizeProperty = window.getComputedStyle(txtElement.node()).getPropertyValue("font-size");
        var fontFamily = window.getComputedStyle(txtElement.node()).getPropertyValue("font-family");
        var fontSize = parseFloat(fontSizeProperty);
        var croppedText=originalText;
        var theTextLength=dth.measureTextWidth(originalText, fontFamily, fontSize + "px");
        while (theTextLength > availableWidth ){
            croppedText=originalText.slice(0,originalText.length-index)+"...";
            txtElement.text(croppedText);
            index++;
            if (index>originalText.length){
                croppedText=".";
                txtElement.text(croppedText);
                break;
            }
            theTextLength=dth.measureTextWidth(croppedText, fontFamily, fontSize + "px");
        }
    };

    dth.measureTextWidth=function(text,fontFamily,fontSize) {
        // console.log("Measuring TextWidth with: fontSize="+fontSize+ "fontFamily="+fontFamily);

        var d = d3.select("body").append("text");
        d.attr("id", "width-test");
        d.attr("style", "position:absolute; float:left; white-space:nowrap; font-family:"+fontFamily+";font-size: "+fontSize);
        d.text(text);
        var w = document.getElementById("width-test").offsetWidth;
        d.remove();
        return w;
    };
    dth.computeCropedText=function (path,textNode,dynamicMargin){
        var originalText=textNode.text();
        var index=1;

        var parentNode=textNode.node();
        var pathNode=path.node();

        var fontSizeProperty = window.getComputedStyle(parentNode.parentNode).getPropertyValue("font-size");
        var fontFamily = window.getComputedStyle(parentNode.parentNode).getPropertyValue("font-family");
        var fontSize = parseFloat(fontSizeProperty);
        var cropedText=originalText;
        var thePathLength=pathNode.getTotalLength();
        var theTextLength=dth.measureTextWidth(originalText, fontFamily, fontSize + "px")+dynamicMargin;

        while (theTextLength > thePathLength ){
            cropedText=originalText.slice(0,originalText.length-index)+"...";
            textNode.text(cropedText);
            index++;
            if (index>originalText.length){
                cropedText=".";
                textNode.text(cropedText);
                break;
            }
            theTextLength=dth.measureTextWidth(cropedText, fontFamily, fontSize + "px")+dynamicMargin;
        }
    };


    dth.applyIndicatorShapeParameter=function(renderingShape, parentNode, parentConfig, collapsedConfig){


        var indicatorOffset=parseInt(collapsedConfig.inshapeIndicatorOffset);
        // render element based on the shape of the parent config;

        var width=parseInt(parentConfig.width);
        var height=parseInt(parentConfig.height);
        var shapeObj=parentNode.getExpectedShapeSize();
        if (parentConfig.fontSizeOverWritesShapeSize==="true"){
            width=shapeObj.w;
            height=shapeObj.h;

        }
        var indicatorWidth=width+indicatorOffset;
        var indicatorHeight=height+indicatorOffset;
        if (parentConfig.renderingType==="circle"){
            var elementRadius=shapeObj.r;
            var indicatorRadius=elementRadius+indicatorOffset;
            renderingShape.attr("x",-indicatorRadius);
            renderingShape.attr("y",-indicatorRadius);
            renderingShape.attr("width",2*indicatorRadius);
            renderingShape.attr("height",2*indicatorRadius);
            renderingShape.attr("rx",indicatorRadius);
            renderingShape.attr("ry",indicatorRadius);
        }
        if (parentConfig.renderingType==="rect"){

            renderingShape.attr("x",-0.5* indicatorWidth);
            renderingShape.attr("y",-0.5* indicatorHeight);
            renderingShape.attr("width",indicatorWidth);
            renderingShape.attr("height",indicatorHeight);
            if (parentConfig.roundedCorner){
                renderingShape.attr("rx",parentConfig.roundedCorner[0]);
                renderingShape.attr("ry",parentConfig.roundedCorner[1]);
            }
        }

        if (parentConfig.renderingType==="ellipse"){
            var qw=indicatorWidth;
            var qh=indicatorHeight;
            renderingShape.attr("x",-0.5* indicatorWidth);
            renderingShape.attr("y",-0.5* indicatorHeight);
            renderingShape.attr("width",indicatorWidth);
            renderingShape.attr("height",indicatorHeight);
            renderingShape.attr("rx",indicatorWidth);
            renderingShape.attr("ry",indicatorHeight);
        }

        // generic info;
        renderingShape.attr("fill","none");
        renderingShape.style("stroke", collapsedConfig.inshapeStrokeColor);
        renderingShape.style("stroke-width", collapsedConfig.inshapeStrokeStrokeWidth);
        if (collapsedConfig.inshapeStrokeType!=="solid"){
            if (collapsedConfig.inshapeStrokeType==="dashed") renderingShape.style("stroke-dasharray", 8);
            if (collapsedConfig.inshapeStrokeType==="dotted") renderingShape.style("stroke-dasharray", 3);
        }
    };




    dth.applySegmentShapeParameterForDatatypes=function(renderingShape, parentNode, parentConfig, collapsedConfig, indicator){
        // get number of properties and extract the required elements
        var collapsedDataProperties=getCollapsedDatatypesProperties(parentNode);
        if (parentConfig.renderingType==="circle") {
            createSegmentsForCircleShape(collapsedDataProperties,renderingShape, parentNode, parentConfig, collapsedConfig,indicator);
        }
    };

    dth.applySegmentShapeParameterForLoops=function(renderingShape, parentNode, parentConfig, collapsedConfig,indicator){
        // get number of properties and extract the required elements
        var collapsedLoops=getCollapsedLoopProperties(parentNode);
        if (parentConfig.renderingType==="circle") {
            createSegmentsForCircleShape(collapsedLoops,renderingShape, parentNode, parentConfig, collapsedConfig,indicator);
        }
    };




    function createSegmentsForCircleShape(collapsedElements,renderingShape, parentNode, parentConfig, collapsedConfig,indicatorURL) {
        var borderOffset = 0;
        var arcHeight = 8;
        var fullSegmentAngle = 360;

        // some helper variables
        var s1_x, s1_y;
        var s2_x, s2_y;
        var s3_x, s3_y;
        var s4_x, s4_y;

        var d1_nx = 0;
        var d1_ny = 1;
        var d2_nx = 1;
        var d2_ny = 1;

        // extract and pre-compute some values
        var elementRadius = parentNode.getExpectedShapeRadius();
        var startAngle = collapsedConfig.segmentStartAngle;
        if (collapsedConfig.segmentHeight) {
            arcHeight = collapsedConfig.segmentHeight;
        }
        if (collapsedConfig.segmentOffset) {
            elementRadius += collapsedConfig.segmentOffset;
        }

        var arc1Radius = elementRadius - borderOffset;
        var arc2Radius = elementRadius - arcHeight - borderOffset;

        // this should never happen but just in case we return an empty shape
        if (collapsedElements.length === 0) {
            return renderingShape;
        }

        // adjust segment drawing area
        if (collapsedConfig.segmentType == "full") {
            fullSegmentAngle = 360;
        }
        if (collapsedConfig.segmentType == "half") {
            fullSegmentAngle = 180;
        }
        if (collapsedConfig.segmentType == "quarter") {
            fullSegmentAngle = 90;
        }

        var angleOffset = -fullSegmentAngle / collapsedElements.length;
        var oneElementFlag = "0";
        if (collapsedElements.length === 1 && collapsedConfig.segmentType == "full") {
            oneElementFlag = "1";
        }

        // draw segments for the individual properties
        for (var i = 0; i < collapsedElements.length; i++) {
            var path = renderingShape.append("path");
            var p1 = getPointFromAngle(startAngle + i * angleOffset);
            var p2 = getPointFromAngle(startAngle + (i + 1) * angleOffset);

            d1_nx = p1.x;
            d1_ny = p1.y;
            d2_nx = p2.x;
            d2_ny = p2.y;
            s1_x = d1_nx * arc2Radius;
            s1_y = d1_ny * arc2Radius;
            s2_x = d1_nx * arc1Radius;
            s2_y = d1_ny * arc1Radius;
            s3_x = d2_nx * arc1Radius;
            s3_y = d2_ny * arc1Radius;
            s4_x = d2_nx * arc2Radius;
            s4_y = d2_ny * arc2Radius;
            path.attr("d",
                "M" + s1_x + " " + s1_y +
                "L" + s2_x + " " + s2_y +
                "A" + arc1Radius + " " + arc1Radius + ", 0, " + oneElementFlag + ", 1, " + s3_x + " " + s3_y +
                "L" + s4_x + " " + s4_y +
                "A" + arc2Radius + " " + arc2Radius + ", 0, " + oneElementFlag + ", 0, " + s1_x + " " + s1_y
                + "Z"
            );


            // apply some given styles and add hover text
            var color = collapsedElements[i].getPropertyNode().getConfigObj().bgColor;
            path.style("fill", color);
            path.style("stroke", "#000000");
            path.style("stroke-width", "0.5px");
            var titleString = collapsedElements[i].getPropertyNode().getLabelText();
            // differ between datatypes and loop

            if (collapsedElements[i].getPropertyNode().elementTypeConstructorName()==="owl:ObjectProperty"){
                // thats a loop
                // titleString += "\n" + collapsedElements[i].;
            }else{
                titleString += "\n" + collapsedElements[i].range().getLabelText();
            }


            path.append("title").text(titleString);

            // draw label text into the segment
            if (collapsedConfig.showLabelInSegment === "true") {
                var textPath = renderingShape.append("path");
                textPath.attr("fill", "none");

                // pre-compute the arc for the text (the path used to bend the text)
                var nX1 = s2_x - s1_x;
                var nY1 = s2_y - s1_y;
                var nX2 = s3_x - s4_x;
                var nY2 = s3_y - s4_y;

                var n1Len = Math.sqrt(nX1 * nX1 + nY1 * nY1);
                var n2Len = Math.sqrt(nX2 * nX2 + nY2 * nY2);

                var fX1 = nX1 / n1Len;
                var fY1 = nY1 / n1Len;
                var fX2 = nX2 / n2Len;
                var fY2 = nY2 / n2Len;


                var qrx = s1_x + 0.5 * (s2_x - s1_x) - (0.35 * collapsedConfig.segmentLabelSize * fX1);
                var qry = s1_y + 0.5 * (s2_y - s1_y) - (0.35 * collapsedConfig.segmentLabelSize * fY1);

                var wrx = s4_x + 0.5 * (s3_x - s4_x) - (0.35 * collapsedConfig.segmentLabelSize * fX2);
                var wry = s4_y + 0.5 * (s3_y - s4_y) - (0.35 * collapsedConfig.segmentLabelSize * fY2);


                var textArcRadius = Math.sqrt(qrx * qrx + qry * qry);

                textPath.attr("d",
                    "M" + qrx + " " + qry +
                    "A" + textArcRadius + " " + textArcRadius + ", 0, " + oneElementFlag + ", 1, " + wrx + " " + wry);


                textPath.node().id = parentNode.id() + "_"+indicatorURL+"_segment_id" + i;
                var text = renderingShape.append("text");
                text.style("font-size", collapsedConfig.segmentLabelSize + "px");
                text.style("text-anchor", "middle");
                var txtPathNode = text.append("textPath");
                txtPathNode.attr("xlink:href", "#" + textPath.node().id);
                txtPathNode.attr("startOffset", "50%");
                txtPathNode.text(collapsedElements[i].getPropertyNode().getLabelText());
                txtPathNode.node().id = parentNode.id() + "_txtNodeId" + i;

                // adjust renderedText;
                dth.computeCropedText(textPath, txtPathNode, collapsedConfig.segmentAdjustmentMargin);
            }
        }
    }





    // umlNotationHelper
    dth.reEvaulateUMLStylePositions=function(textElement,parentNode, parentNodeCFG, collapseConfig){
        var fontFamily = window.getComputedStyle(textElement.node()).getPropertyValue("font-family");
        var fontSizeProperty = window.getComputedStyle(textElement.node()).getPropertyValue("font-size");
        var fontSize = parseFloat(fontSizeProperty);
        var cdy=textElement.attr("dy");
        if (cdy.indexOf("px")!==-1){
            cdy=cdy.split("px")[0];
        }

        var udy;
        // we need parent RenderingType;
        var parentType=parentNodeCFG.renderingType;
        if (parentType==="circle"){
            if (collapseConfig.umlShapeAdjustsShapeSize==="header"){
                var shapeRadius=parentNode.getShapeRadius();
                udy=cdy-shapeRadius+fontSize;
                textElement.attr("dy",udy+"px");
                // adjust shapeRadius for header;
                var textWidth = 0.5*dth.measureTextWidth(textElement.text(), fontFamily, fontSize + "px");
                // testing:
                var nOffset=udy-fontSize;
                var nRadius=Math.sqrt(nOffset*nOffset+textWidth*textWidth);
                parentNode.adjustShapeSize(nRadius);
            }

        }



        if (parentType==="rect"){
            if (collapseConfig.umlShapeAdjustsShapeSize==="header"){
                var shape=parentNode.getRenderingShape();
                var collapsedDataProperties=getCollapsedDatatypesProperties(parentNode);
                var collapsedLoops=getCollapsedLoopProperties(parentNode);
                // use segment height for their representation;
                // use the umlScaleFactor to adjust the size of the renderingElements inside the uml element;
                var scaleFactor=parseFloat(collapseConfig.umlElementScaleFactor);
                var requredHeight=parseInt(fontSize) + 3 ;
                var requiredWidth=parentNode.computeRequiredWidth();

                var i;
                for (i=0;i<collapsedDataProperties.length;i++){
                    var wxh=collapsedDataProperties[i].getPropertyNode().computeUMLElementSize();
                    var sw=scaleFactor*wxh.w;
                    var sh=scaleFactor*wxh.h;
                    requredHeight+=sh+parseInt(collapseConfig.umlHeightOffset);
                    requiredWidth=Math.max(requiredWidth,sw);
                }
                for (i=0;i<collapsedLoops.length;i++){
                    var wxh=collapsedLoops[i].getPropertyNode().computeUMLElementSize();
                    var sw=scaleFactor*wxh.w;
                    var sh=scaleFactor*wxh.h;
                    requredHeight+=sh+parseInt(collapseConfig.umlHeightOffset);
                    requiredWidth=Math.max(requiredWidth,sw);
                }
                var allowedWidth=parentNode.computeRequiredWidth();
                // requiredWidth=Math.min(requiredWidth,allowedWidth);
                //
                // requiredWidth+=parseFloat(collapseConfig.umlMarginLeft);
                // requiredWidth+=parseFloat(collapseConfig.umlMarginRight);
                //
                requredHeight+=parseInt(collapseConfig.umlOffsetToHeader);
                requredHeight+=parseInt(collapseConfig.umlOffsetToAfterLastElement);
                //
                // var usedWidth=Math.min(allowedWidth,requiredWidth);
                // console.log(">>>>>>>>> computed required Height?" + requredHeight);
                // console.log(">>>>>>>>> parentNode.are_dtCollapsed()" + parentNode.are_dtCollapsed());
                // console.log(">>>>>>>>> parentNode.are_loopCollapsed()?" + parentNode.are_loopCollapsed());

                if (parentNode.are_dtCollapsed()===true || parentNode.are_loopCollapsed()===true) {
                    // console.log("This should do it!"+requredHeight);
                    parentNode.adjustShapeSize(undefined, allowedWidth, requredHeight);
                }
                var height=parseFloat(shape.attr("height"));
                udy=cdy-0.5*height+fontSize;
                textElement.attr("dy",udy+"px");

                allowedWidth-=parseFloat(collapseConfig.umlMarginLeft);
                allowedWidth-=parseFloat(collapseConfig.umlMarginRight);
                // console.log("allowedWidth" + allowedWidth);
                return allowedWidth;
            }

            if (collapseConfig.umlShapeAdjustsShapeSize==="datatypes"){
                var shape=parentNode.getRenderingShape();
                var collapsedDataProperties=getCollapsedDatatypesProperties(parentNode);
                var collapsedLoops=getCollapsedLoopProperties(parentNode);
                // use segment height for their representation;
                // use the umlScaleFactor to adjust the size of the renderingElements inside the uml element;
                var scaleFactor=parseFloat(collapseConfig.umlElementScaleFactor);
                var requredHeight=parseInt(fontSize) + 3 ;
                var requiredWidth=parentNode.computeRequiredWidth();

                var i;
                var requiredDtWidth=0;


                for (i=0;i<collapsedLoops.length;i++){
                    var wxh=collapsedLoops[i].getPropertyNode().computeUMLElementSize();
                    var sw=scaleFactor*wxh.w;
                    var sh=scaleFactor*wxh.h;
                    requredHeight+=sh+parseInt(collapseConfig.umlHeightOffset);
                }

                for (i=0;i<collapsedDataProperties.length;i++){
                    var wxh=collapsedDataProperties[i].getPropertyNode().computeUMLElementSize();
                    var sw=scaleFactor*wxh.w;
                    var sh=scaleFactor*wxh.h;
                    requredHeight+=sh+parseInt(collapseConfig.umlHeightOffset);
                    sw+=parseFloat(collapseConfig.umlMarginLeft)+parseFloat(collapseConfig.umlMarginBetween);
                    requiredWidth=Math.max(requiredWidth,sw);

                    // console.log("Width for property:"+ collapsedDataProperties[i].getPropertyNode().getLabelText() +" is "+ sw);

                    var wxhDt=collapsedDataProperties[i].range().computeUMLElementSize();
                    var swDT=scaleFactor*wxhDt.w;
                    var shDT=scaleFactor*wxhDt.h;
                    requiredWidth=Math.max(requiredWidth,swDT);

                    //

                }



                var allowedWidth=parentNode.computeRequiredWidth();




                allowedWidth=2*Math.max(allowedWidth,requiredWidth);

                //
                requredHeight+=parseInt(collapseConfig.umlOffsetToHeader);
                requredHeight+=parseInt(collapseConfig.umlOffsetToAfterLastElement);
                //
                // var usedWidth=Math.min(allowedWidth,requiredWidth);
                // console.log(">>>>>>>>> computed required Height?" + requredHeight);

                if (parentNode.are_dtCollapsed()===true || parentNode.are_loopCollapsed()===true) {
                    parentNode.adjustShapeSize(undefined, allowedWidth, requredHeight);
                }
                var height=shape.attr("height");


                var textWidth = 0.5*dth.measureTextWidth(textElement.text(), fontFamily, fontSize + "px");

                udy=cdy-0.5*height+fontSize;


                var udx;
                if (collapseConfig.umlHeaderAlign==="left") udx=-0.5*allowedWidth+parseFloat(collapseConfig.umlMarginLeft);
                if (collapseConfig.umlHeaderAlign==="right") udx=0.5*allowedWidth-2*textWidth-parseFloat(collapseConfig.umlMarginRight);
                if (collapseConfig.umlHeaderAlign==="center") udx=-textWidth;


                textElement.attr("dy",udy+"px");
                textElement.attr("dx",udx+"px");
                // console.log("updated text position X "+udx);
                allowedWidth-=parseFloat(collapseConfig.umlMarginLeft);
                allowedWidth-=parseFloat(collapseConfig.umlMarginRight);
                // console.log("allowedWidth" + allowedWidth);
                return allowedWidth;


            }

            if (collapseConfig.umlShapeAdjustsShapeSize==="loops"){
                var shape=parentNode.getRenderingShape();
                var collapsedDataProperties=getCollapsedDatatypesProperties(parentNode);
                var collapsedLoops=getCollapsedLoopProperties(parentNode);
                // use segment height for their representation;
                // use the umlScaleFactor to adjust the size of the renderingElements inside the uml element;
                var scaleFactor=parseFloat(collapseConfig.umlElementScaleFactor);
                var requredHeight=parseInt(fontSize) + 3 ;
                var requiredWidth=parentNode.computeRequiredWidth();

                var i;
                var requiredDtWidth=0;
                for (i=0;i<collapsedLoops.length;i++){
                    var wxh=collapsedLoops[i].getPropertyNode().computeUMLElementSize();
                    var sw=scaleFactor*wxh.w;
                    var sh=scaleFactor*wxh.h;
                    requredHeight+=sh+parseInt(collapseConfig.umlHeightOffset);
                    sw+=parseFloat(collapseConfig.umlMarginLeft)+parseFloat(collapseConfig.umlMarginBetween);
                    requiredWidth=Math.max(requiredWidth,sw);

                    // console.log("Width for property:"+ collapsedLoops[i].getPropertyNode().getLabelText() +" is "+ sw);

                }



                var allowedWidth=parentNode.computeRequiredWidth();




                allowedWidth=Math.max(allowedWidth,requiredWidth);
                // console.log("Loops compute allowed width"+allowedWidth);

                //
                requredHeight+=parseInt(collapseConfig.umlOffsetToHeader);
                requredHeight+=parseInt(collapseConfig.umlOffsetToAfterLastElement);
                //
                // var usedWidth=Math.min(allowedWidth,requiredWidth);
                // console.log(">>>>>>>>> computed required Height?" + requredHeight);

                if (parentNode.are_dtCollapsed()===true || parentNode.are_loopCollapsed()===true) {
                    parentNode.adjustShapeSize(undefined, allowedWidth, requredHeight);
                }
                var height=shape.attr("height");


                var textWidth = 0.5*dth.measureTextWidth(textElement.text(), fontFamily, fontSize + "px");

                udy=cdy-0.5*height+fontSize;


                var udx;
                if (collapseConfig.umlHeaderAlign==="left") udx=-0.5*allowedWidth+parseFloat(collapseConfig.umlMarginLeft);
                if (collapseConfig.umlHeaderAlign==="right") udx=0.5*allowedWidth-2*textWidth-parseFloat(collapseConfig.umlMarginRight);
                if (collapseConfig.umlHeaderAlign==="center") udx=-textWidth;


                textElement.attr("dy",udy+"px");
                textElement.attr("dx",udx+"px");
                // console.log("updated text position X "+udx);
                allowedWidth-=parseFloat(collapseConfig.umlMarginLeft);
                allowedWidth-=parseFloat(collapseConfig.umlMarginRight);
                // console.log("allowedWidth" + allowedWidth);
                return allowedWidth;


            }


        }




    };




    dth.drawUMLElementsForDatatypesAndLoops=function(availableWidth,dt_renderingGroup,lp_renderingGroup, parentNode,parentCFG,dtCfg,loopCfg){
        var collapsedDataProperties=getCollapsedDatatypesProperties(parentNode);
        var collapsedLoops=getCollapsedLoopProperties(parentNode);


        // assume the order is datatype first then loops;
        var i;
        var renParentHeight=parentNode.getRenderingShape().attr("height");
        // console.log("Found rendering height?" + renParentHeight);
        // console.log("The Width for the parentElement? " + availableWidth);
        var fontSize=parentCFG.fontSize;
        fontSize= parseFloat(fontSize.split("px")[0]);
        var marginLeft=parseInt(dtCfg.umlMarginLeft);
        var marginRight=parseInt(dtCfg.umlMarginRight);
        // console.log("DT marginLeft"+marginLeft);
        // console.log("DT marginRight"+marginRight);
        // for property
        var elementWidth= availableWidth - umlMarginBetweenElements-marginLeft-marginRight;
        var startElementY=-0.5*parseFloat(renParentHeight) + fontSize + parseInt(dtCfg.umlOffsetToHeader) ;
        // console.log("StartElement position:" + startElementY);
        var startYForLoops=0;
        for (i=0;i<collapsedDataProperties.length;i++) {
            var propertyElement = collapsedDataProperties[i];
            var property_configObject = propertyElement.getPropertyNode().getConfigObj();
            var datatype_configObject = propertyElement.range().getConfigObj();
            var elementGroup=dt_renderingGroup.append("g");
            var datatypeGroup=dt_renderingGroup.append("g");
            var dtShapeScaleWidth=1.0;
            var umlPropertyhShift=0;
            var umlDatatypeShift=0;
            var umlMarginBetweenElements=0;

            if (dtCfg.umlShowDatatypeProperty==="true"){
                dtShapeScaleWidth=0.5;
                umlMarginBetweenElements=parseFloat(dtCfg.umlMarginBetween);
                umlPropertyhShift = - 0.25 * availableWidth - umlMarginBetweenElements+marginLeft;
                umlDatatypeShift  = + 0.25 * availableWidth + umlMarginBetweenElements-marginRight;

            }
            // for property
            if (dtCfg.umlShowDatatypeProperty==="true") {
                var elementWidth= 0.5*availableWidth - 0.5*umlMarginBetweenElements;
                elementWidth-=marginLeft;
                elementWidth-=marginRight;
                // console.log(">>>> element Width for a property"+ elementWidth);
                var temp=startElementY;
                var tObj=createUMLElement(i,startElementY, elementWidth,umlPropertyhShift,propertyElement.getPropertyNode(), elementGroup, property_configObject,dtCfg);
                startElementY=tObj.startElementY;
                createUMLElement(i, temp, elementWidth, umlDatatypeShift, propertyElement.range(), datatypeGroup, datatype_configObject, dtCfg);
            }
            else{
                var elementWidth= availableWidth - umlMarginBetweenElements;
                elementWidth-=marginLeft;
                elementWidth-=marginRight;

                // console.log(">>>> element Width for a property"+ elementWidth);
                var tempobj= createUMLElement(i,startElementY, elementWidth,umlPropertyhShift,propertyElement.getPropertyNode(), elementGroup, property_configObject,dtCfg);
                startElementY=tempobj.startElementY;
                startYForLoops=tempobj.endElement;
            }
            // console.log("Drawing Datatype Element at postion "+startYForLoops);
        }
        // console.log("Drawing LOOPS _______\n__________\n Starting pos "+startYForLoops);
        for (i=0;i<collapsedLoops.length;i++) {
            var propertyElement = collapsedLoops[i];
            var property_configObject = propertyElement.getPropertyNode().getConfigObj();
            var elementGroup=lp_renderingGroup.append("g");
            var umlPropertyShift=0;
            var umlMarginBetweenElements=0;
            var marginLeft=parseInt(loopCfg.umlMarginLeft);
            var marginRight=parseInt(loopCfg.umlMarginRight);
            // console.log("LP marginLeft"+marginLeft);
            // console.log("LP marginRight"+marginRight);

            // for property
            var elementWidth= availableWidth - umlMarginBetweenElements-marginLeft-marginRight;
            // for property
           // var elementWidth= availableWidth - umlMarginBetweenElements;
            createUMLElementForLoops((i+1),startYForLoops, elementWidth,umlPropertyShift,propertyElement.getPropertyNode(), elementGroup, property_configObject,loopCfg);

        }
    };

    dth.drawUMLElementsForLoops=function(availableWidth,renderingGroup, parentNode,parentCFG,loopCfg){

        // extract the rendering elements;
        var collapsedDataProperties=getCollapsedDatatypesProperties(parentNode);
        var collapsedLoops=getCollapsedLoopProperties(parentNode);


        // assume the order is datatype first then loops;
        var i;
        var renParentHeight=parentNode.getRenderingShape().attr("height");
        var fontSize=parentCFG.fontSize;
        fontSize= parseFloat(fontSize.split("px")[0]);


        // if we have some datatypes in the node we need to shift this

        var startElementY=-0.5*parseFloat(renParentHeight) + fontSize +parseInt(loopCfg.umlOffsetToHeader) ;

        var collapseConfig=parentNode.getDtCollapseCFG();
        // compute loop shift
        var requiredHeight = 0;
        if (loopCfg.umlShapeAdjustsShapeSize==="header") {
            var scaleFactor = parseFloat(collapseConfig.umlElementScaleFactor);


            for (i = 0; i < collapsedDataProperties.length; i++) {
                var wxh = collapsedDataProperties[i].getPropertyNode().computeUMLElementSize();
                var sh = scaleFactor * wxh.h;
                requiredHeight += sh + parseInt(collapseConfig.umlHeightOffset);
            }
        }

        if (loopCfg.umlShapeAdjustsShapeSize==="loops") {
            var scaleFactor = parseFloat(collapseConfig.umlElementScaleFactor);


            for (i = 0; i < collapsedDataProperties.length; i++) {
                var wxh = collapsedDataProperties[i].getPropertyNode().computeUMLElementSize();
                var sh = scaleFactor * wxh.h;
                requiredHeight += sh + parseInt(collapseConfig.umlHeightOffset);
            }
        }

        startElementY+=requiredHeight;

        for (i=0;i<collapsedLoops.length;i++) {
            var propertyElement = collapsedLoops[i];
            var property_configObject = propertyElement.getPropertyNode().getConfigObj();
            var elementGroup=renderingGroup.append("g");
            var umlPropertyShift=0;
            var umlMarginBetweenElements=0;
            var marginLeft=parseInt(loopCfg.umlMarginLeft);
            var marginRight=parseInt(loopCfg.umlMarginRight);
                        // for property
            var elementWidth= availableWidth - umlMarginBetweenElements-marginLeft-marginRight;
            startElementY= createUMLElementForLoops(i,startElementY, elementWidth,umlPropertyShift,propertyElement.getPropertyNode(), elementGroup, property_configObject,loopCfg).startElementY;

        }
    };

    dth.drawUMLElementsForDatatypes=function(availableWidth,renderingGroup, parentNode,parentCFG,dtCfg){

        // extract the rendering elements;
        var collapsedDataProperties=getCollapsedDatatypesProperties(parentNode);
        var collapsedLoops=getCollapsedLoopProperties(parentNode);


        // assume the order is datatype first then loops;
        var i;
        var renParentHeight=parentNode.getRenderingShape().attr("height");
        // console.log("Found rendering height?" + renParentHeight);
        // console.log("The Width for the parentElement? " + availableWidth);
        var fontSize=parentCFG.fontSize;
        fontSize= parseFloat(fontSize.split("px")[0]);

        var startElementY=-0.5*parseFloat(renParentHeight) + fontSize + parseInt(dtCfg.umlOffsetToHeader) ;
        // console.log("StartElement position:" + startElementY);
        for (i=0;i<collapsedDataProperties.length;i++) {
            var propertyElement = collapsedDataProperties[i];
            var property_configObject = propertyElement.getPropertyNode().getConfigObj();
            var datatype_configObject = propertyElement.range().getConfigObj();
            var elementGroup=renderingGroup.append("g");
            var datatypeGroup=renderingGroup.append("g");
            var dtShapeScaleWidth=1.0;
            var umlPropertyhShift=0;
            var umlDatatypeShift=0;
            var marginLeft=parseInt(dtCfg.umlMarginLeft);
            var marginRight=parseInt(dtCfg.umlMarginRight);
            var umlMarginBetweenElements=0;
            if (dtCfg.umlShowDatatypeProperty==="true"){
                dtShapeScaleWidth=0.5;
                umlMarginBetweenElements=parseFloat(dtCfg.umlMarginBetween);
                umlPropertyhShift = - 0.25 * availableWidth - umlMarginBetweenElements+ marginLeft;
                umlDatatypeShift  = + 0.25 * availableWidth + umlMarginBetweenElements- marginRight;

            }
            // for property
            if (dtCfg.umlShowDatatypeProperty==="true") {
                var elementWidth= 0.5*availableWidth - 0.5*umlMarginBetweenElements - marginLeft - marginRight;
                // console.log(">>>> element Width for a property"+ elementWidth);
                var temp=startElementY;
                startElementY= createUMLElement(i,startElementY, elementWidth,umlPropertyhShift,propertyElement.getPropertyNode(), elementGroup, property_configObject,dtCfg).startElementY;
                createUMLElement(i, temp, elementWidth, umlDatatypeShift, propertyElement.range(), datatypeGroup, datatype_configObject, dtCfg);
            }
            else{
                var elementWidth= availableWidth - umlMarginBetweenElements - marginLeft - marginRight;
                // console.log(">>>> element Width for a property"+ elementWidth);
                var temp=startElementY;
                startElementY= createUMLElement(i,startElementY, elementWidth,umlPropertyhShift,propertyElement.getPropertyNode(), elementGroup, property_configObject,dtCfg).startElementY;
            }
        }
    };

    function createUMLElement(index,startElementY,elementWidth,elementShift,baseElement,elementGroup,configObject,dtCfg){

        var renderingUMLShape=drawUMLShapeElement(elementWidth,baseElement,elementGroup,configObject,dtCfg);
        var heightOffset=parseInt(dtCfg.umlHeightOffset);

        var elementHeight=parseFloat(renderingUMLShape.attr("height"));
        if (index===0){ startElementY+=0.5*elementHeight;} // adjust height of the first element
        var elementOffset=index*(heightOffset+elementHeight);
        var ypos=startElementY+elementOffset;
        elementGroup.attr("transform", "translate(" +elementShift + "," +ypos + ")");

        // set the properer position;
        // add the label;
        var umlText=baseElement.getLabelText();
        var renderingTextElement=elementGroup.append("text").text(umlText);
        renderingTextElement.style("font-family",configObject.fontFamily);


        var updatedFontSizeWithScale=configObject.fontSize;
        updatedFontSizeWithScale=updatedFontSizeWithScale.split("px")[0];
        updatedFontSizeWithScale=parseFloat(updatedFontSizeWithScale);
        updatedFontSizeWithScale*=parseFloat(dtCfg.umlElementScaleFactor);

        renderingTextElement.style("font-size",updatedFontSizeWithScale+"px");
        renderingTextElement.style("fill",configObject.fontColor);
        renderingTextElement.style("pointer-events","none");

        var umlWidth=parseFloat(renderingUMLShape.attr("width"))-2;// reduce atleast by one pixel
        dth.cropText(umlWidth,renderingTextElement);

        var textWidth = dth.measureTextWidth(renderingTextElement.text(), configObject.fontFamily, updatedFontSizeWithScale+ "px");
        var dx = -0.5 * textWidth; // centered

        if (dtCfg.umlPropertyAlign==="left"){
            dx=-0.5*elementWidth+2;
        }
        if (dtCfg.umlPropertyAlign==="right"){
            dx= 0.5*elementWidth-textWidth-2;
        }



        renderingTextElement.attr("dy", 0.25 * updatedFontSizeWithScale + "px");
        // console.log("renderingText element dx="+dx);
        renderingTextElement.attr("dx", dx + "px");

        // return the startY postion, used when modified for the first element
        return {startElementY:startElementY,endElement:ypos};


    }
    function createUMLElementForLoops(index,startElementY,elementWidth,elementShift,baseElement,elementGroup,configObject,loopCfg){

        var renderingUMLShape=drawUMLShapeElement(elementWidth,baseElement,elementGroup,configObject,loopCfg);
        var heightOffset=parseInt(loopCfg.umlHeightOffset);

        var elementHeight=parseFloat(renderingUMLShape.attr("height"));
        if (index===0){ startElementY+=0.5*elementHeight;} // adjust height of the first element
        var elementOffset=index*(heightOffset+elementHeight);
        var ypos=startElementY+elementOffset;
        elementGroup.attr("transform", "translate(" +elementShift + "," +ypos + ")");

        // set the properer position;
        // add the label;
        var umlText=baseElement.getLabelText();
        var renderingTextElement=elementGroup.append("text").text(umlText);
        renderingTextElement.style("font-family",configObject.fontFamily);

        var updatedFontSizeWithScale=configObject.fontSize;
        updatedFontSizeWithScale=updatedFontSizeWithScale.split("px")[0];
        updatedFontSizeWithScale=parseFloat(updatedFontSizeWithScale);
        updatedFontSizeWithScale*=parseFloat(loopCfg.umlElementScaleFactor);

        renderingTextElement.style("font-size",updatedFontSizeWithScale+"px");
        renderingTextElement.style("fill",configObject.fontColor);
        renderingTextElement.style("pointer-events","none");

        var umlWidth=parseFloat(renderingUMLShape.attr("width"))-2;// reduce atleast by one pixel
        dth.cropText(umlWidth,renderingTextElement);

        var textWidth = dth.measureTextWidth(renderingTextElement.text(), configObject.fontFamily, updatedFontSizeWithScale+ "px");
        var dx = -0.5 * textWidth;


        if (loopCfg.umlPropertyAlign==="left"){
            dx=-0.5*elementWidth+2;
        }
        if (loopCfg.umlPropertyAlign==="right"){
            dx= 0.5*elementWidth-textWidth-2;
        }
        renderingTextElement.attr("dy", 0.25 * updatedFontSizeWithScale + "px");
        renderingTextElement.attr("dx", dx + "px");


        // return the startY postion, used when modified for the first element
        return  {startElementY:startElementY,endElement:ypos};


    }



    function drawUMLShapeElement(availableWidth, parentNode,renderingGroup,propertyCfg,collapseCfg){
        var renderingUMLShape=renderingGroup.append("rect");
        var scaleFactor=parseFloat(collapseCfg.umlElementScaleFactor);
        var wxh=parentNode.computeUMLElementSize();
        var w=wxh.w;
        var h=wxh.h;

        // need to reEvaluate the size;



        var radius=propertyCfg.radius  * scaleFactor;
        var width=parseFloat(w)* scaleFactor;
        var height=parseFloat(h)* scaleFactor;
        /**  render a pure cirlce **/

        // adjust width to availible width;
        if (availableWidth) {
            width = availableWidth;
        }


        if (propertyCfg.renderingType==="circle"){
            renderingUMLShape.attr("x",-radius);
            renderingUMLShape.attr("y",-radius);
            renderingUMLShape.attr("width",2*radius);
            renderingUMLShape.attr("height",2*radius);
            renderingUMLShape.attr("rx",radius);
            renderingUMLShape.attr("ry",radius);
        }
        /**  render a rectangle with possible rounded corners provided by config **/
        if (propertyCfg.renderingType==="rect"){

            renderingUMLShape.attr("x",-0.5* width);
            renderingUMLShape.attr("y",-0.5* height);
            renderingUMLShape.attr("width",width);
            renderingUMLShape.attr("height",height);
            if (propertyCfg.roundedCorner){
                renderingUMLShape.attr("rx",propertyCfg.roundedCorner[0]*scaleFactor);
                renderingUMLShape.attr("ry",propertyCfg.roundedCorner[1]*scaleFactor);
            }
        }
        /**  render an ellips **/
        if (propertyCfg.renderingType==="ellipse"){
            renderingUMLShape.attr("x",-0.5* width);
            renderingUMLShape.attr("y",-0.5* height);
            renderingUMLShape.attr("width",width);
            renderingUMLShape.attr("height",height);
            renderingUMLShape.attr("rx",width);
            renderingUMLShape.attr("ry",height);
        }

        /** apply stroke and fill colors as addition stroke style related paramters **/
        renderingUMLShape.attr("fill",propertyCfg.bgColor);
        if (propertyCfg.strokeElement===true || propertyCfg.strokeElement==="true") {
            renderingUMLShape.style("stroke", propertyCfg.strokeColor);
            renderingUMLShape.style("stroke-width", propertyCfg.strokeWidth);
            if (propertyCfg.strokeStyle!=="solid"){
                if (propertyCfg.strokeStyle==="dashed") renderingUMLShape.style("stroke-dasharray", 8);
                if (propertyCfg.strokeStyle==="dotted") renderingUMLShape.style("stroke-dasharray", 3);
            }
        }
        return renderingUMLShape;
    }

    // some math helper
    function getPointFromAngle(angle){
        var xn = Math.cos(angle * Math.PI / 180);
        var yn = Math.sin(angle * Math.PI / 180);
        return {x: xn, y: -yn}
    }

    /** extracts the properties (baseLink and sibling) elements**/
    function getCollapsedDatatypesProperties(parentNode){
        var collapsedElements=parentNode.getTempCollapsionElements();
        if (collapsedElements.length===0 && parentNode.tNode()){
            var tProperties=parentNode.tNode().getDatatypeProperties();
            collapsedElements=[];
            for (var pI=0;pI<tProperties.length;pI++){
                collapsedElements.push(tProperties[pI].getRenderingPrimitive());
            }
        }else{
            var i;
            var realDtElement=[];
            for (i=0;i<collapsedElements.length;i++){
                if (collapsedElements[i].domain()!==collapsedElements[i].range())
                    realDtElement.push(collapsedElements[i]);
            }
            return realDtElement;
        }
        return collapsedElements;
    }

    dth.getCollapsedDatatypesProperties=function(parentNode){
        return getCollapsedDatatypesProperties(parentNode);
    };

    dth.getCollapsedLoopProperties=function(parentNode){
        return getCollapsedLoopProperties(parentNode);
    };

    function getCollapsedLoopProperties(parentNode){

        var realLoopElement=[];
        var i;
        var collapsedElements=parentNode.getTempCollapsionElements();
        if (collapsedElements.length===0 && parentNode.tNode()){
            var tProperties=parentNode.tNode().getLoopProperties();
            collapsedElements=[];
            for ( i=0;i<tProperties.length;i++){
                collapsedElements.push(tProperties[i].getRenderingPrimitive());
            }
        }else{
            for (i=0;i<collapsedElements.length;i++){
                if (collapsedElements[i].domain()===collapsedElements[i].range())
                    realLoopElement.push(collapsedElements[i]);
            }
            return realLoopElement;
        }
        return collapsedElements;
    }
    return dth;
};