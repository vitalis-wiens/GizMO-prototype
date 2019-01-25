
module.exports = (function () {

    var SideMenu= function (rws,title, alignment,collapible) {
        var that=this;
        var ALIGNMENT=alignment;
        var MENU_PARENT_DOM;
        var MENU_CONTAINER;
        var wapi;
        var drawTools;
        var mouseIn=false;
        var accordionId=0;


        var map_nodes,map_properties,map_datatypes;

        function addAccordionClasses(){
            rws.createCSSSelector(".accordion-trigger",
                "background: #24323e; cursor: pointer; padding: .5em;");
            rws.createCSSSelector(".accordion-trigger.accordion-trigger-active:before",
                "padding-right: 0px; float: left; content: '\\25BC';");
            rws.createCSSSelector(".accordion-trigger:not(.accordion-trigger-active):before",
                "padding-right: 0px; float: left;  content: '\\25BA';");
            rws.createCSSSelector("accordion-container.scrollable",
                "max-height: 40%; overflow: auto;");

            // if not already there add it;
            rws.createCSSSelector(".hidden","display: none");

        }

        function init() {
            addAccordionClasses();
            console.log("Creating side Menu:" + alignment);
            // create properParentString;
            var mainObj=document.getElementsByTagName("MAIN")[0];
            console.log(mainObj);
            MENU_CONTAINER=d3.select(mainObj).insert("div",":first-child");
            MENU_CONTAINER.node().innerHTML=title;

            MENU_CONTAINER.style("color","#FFF");
            MENU_CONTAINER.style("position","absolute");
            MENU_CONTAINER.style("width", "220px");
            MENU_CONTAINER.style("height", "100px");
            MENU_CONTAINER.style("background-color", "#f00");
            MENU_CONTAINER.style("overflow-x", "hidden");
            MENU_CONTAINER.style("overflow-y", "auto");

            switch(ALIGNMENT) {
                case rws.SIDE_MENU_LEFT:
                    MENU_CONTAINER.style("top", "0");
                    MENU_CONTAINER.style("width", "100px");
                    MENU_CONTAINER.style("height", "100%");

                    MENU_CONTAINER.style("left", "0");
                    break;
                case rws.SIDE_MENU_RIGHT:
                    MENU_CONTAINER.style("top", "0");
                    MENU_CONTAINER.style("width", "100px");
                    MENU_CONTAINER.style("height", "100%");

                    MENU_CONTAINER.style("right", "0");
                    break;
                default:
                    break;
            }




        }
        init();

        that.setLookUpMap=function(nodes,properties,datatypes){
            map_nodes=nodes;
            map_properties=properties;
            map_datatypes=datatypes;
        };

        that.setWebVOWLAPI=function(api){
            wapi=api;
            drawTools=wapi.getDrawTools();
        };

        that.setSize=function(width,height) {
            MENU_CONTAINER.style("width", width);
            MENU_CONTAINER.style("height", height);
        };


        that.setTitle=function(t){
          MENU_CONTAINER.node().innerHTML="<h5 style='margin:0;text-align: center;background-color: royalblue;'>"+t+"</h5>";
        };

        that.appendHTML_Child=function(c){
            MENU_CONTAINER.node().appendChild(c);
        };



        that.appendAccordionElement=function(title,expand){
            // something like this
            // <h3 class="accordion-trigger accordion-trigger-active">Description</h3>
            //     <div class="accordion-container scrollable">
            //     <p id="description"></p>
            //     </div>


            var accordionHeader=MENU_CONTAINER.append('h5');
            accordionHeader.style("margin","0");
            accordionHeader.style("text-align","center");
            accordionHeader.style("background-color","royalblue");
            accordionHeader.style("padding","0");
            accordionHeader.text(title);
            var bodyIdStr="_accordion_id_"+accordionId++;
            accordionHeader.attr("bodyId",bodyIdStr);

            var accordionBody=MENU_CONTAINER.append('div');
            accordionBody.node().id=bodyIdStr;


            // an uncallapsed accordion shows the arrow down
            accordionHeader.classed("accordion-trigger",true);
            accordionHeader.classed("accordion-trigger-active",true);

            // connect button and return the div accordion body;

            accordionHeader.on("click",function(){
                var ah=d3.select(this);
                var bodyId=ah.attr("bodyId");
                var isActive=ah.classed("accordion-trigger-active");
                if (isActive===true){
                    ah.classed("accordion-trigger-active",false);
                    d3.select("#"+bodyId).classed("hidden",true);
                }else {
                    ah.classed("accordion-trigger-active",true);
                    d3.select("#"+bodyId).classed("hidden",false);
                }
            });

            if (expand===false){
                accordionHeader.classed("accordion-trigger-active",false);
                accordionBody.classed("hidden",true);
            }

            return accordionBody;


        };


        that.clearMenuContainer=function(){

            var htmlContainer=MENU_CONTAINER.node().children;
            var numChildren=htmlContainer.length;
            for (var i=0;i<numChildren;i++){
                htmlContainer[0].remove();
            }
        };

        that.setSize=function(width,height,o_width,o_height){
            var setWidth=width;
            var setHeight=height;
            if (typeof width === "number" && typeof o_width === "number" ){
                setWidth=width+o_width+"px";
            }
            if (typeof height === "number" && typeof o_height=== "number" ){
                setHeight=height+o_height+"px";
            }
            // compute width of parent;
            if (width.indexOf("%")!==-1){
                var pWidth= width.split("%")[0]/100;
               if (o_width.indexOf("%")!==-1) {
                  var poWidth= o_width.split("%")[0]/100;
                      setWidth = window.innerWidth*pWidth + (window.innerWidth * poWidth);
                  }else{
                        setWidth = window.innerWidth*pWidth + parseInt(o_width.split("px")[0]);
                    }
            }
            if (height.indexOf("%")!==-1){
                var pHeight= height.split("%")[0]/100;
                if (o_height.indexOf("%")!==-1) {
                    var poHeight= o_height.split("%")[0]/100;
                    setHeight = window.innerHeight*pWidth + (window.innerHeight * poHeight);
                }else{
                    setHeight= window.innerHeight*pHeight + parseInt(o_height.split("px")[0]);
                }
            }
            if (typeof setWidth === "number"){
                setWidth+="px"
            }

            if (typeof setHeight === "number"){
                setHeight+="px"
            }
            MENU_CONTAINER.style("width",setWidth);
            MENU_CONTAINER.style("height",setHeight);

        };

        that.setBackgroundColor=function(colorAsString){
            MENU_CONTAINER.style("background-color",colorAsString)
        };

        that.addDropDownBoxWithButton=function(label,selectorId,optsArray,btText,btOnClickFunction){

                var thisDiv=MENU_CONTAINER.append('div');
                thisDiv.style("dispay","grid");
                thisDiv.style("margin-top","5px");
                var lb=thisDiv.append('label');
                lb.node().innerHTML=label;

                var sel=thisDiv.append('select');
                sel.node().id=selectorId;
                var setFirstElementSelected=false;
                for (var i=0;i<optsArray.length;i++){
                    var optA=sel.append('option');
                    optA.node().innerHTML=optsArray[i];
                    if (optsArray[i].indexOf("---")!==-1){
                        optA.node().disabled=true;
                    }else{
                        if (setFirstElementSelected===false){
                            setFirstElementSelected=true;
                            optA.node().selected=true;
                        }
                    }
                }

                var bt=thisDiv.append("button");
                    bt.node().innerHTML=btText;
                bt.attr("correspondingSelectionDropDownMenu",sel.node());
                bt.on("click",btOnClickFunction);
            };

            that.addRenderingElement=function(name,pos,onClickFunction){
                // console.log(pos +" Adding rendering element"+name);

                var aDiv;
                aDiv=MENU_CONTAINER.append("div");
                var nameInConfig=name;
                if (nameInConfig.indexOf(":")!==-1){
                    nameInConfig=nameInConfig.replace(":","");
                }
                aDiv.node().id=nameInConfig;

                that.drawElementAndConnect(aDiv,name,pos,onClickFunction);
            };





            that.addRenderingElement_Accordion=function(parent,name,pos,onClickFunction){
                // console.log(pos +" Adding rendering TO ACCORDION >>>>>>>>>>>>>>"+name);
                var aDiv;
                aDiv=parent.append("div");
                var nameInConfig=name;
                if (nameInConfig.indexOf(":")!==-1){
                    nameInConfig=nameInConfig.replace(":","");
                }
                aDiv.node().id=nameInConfig;

                that.drawElementAndConnect(aDiv,name,pos,onClickFunction);
            };


            that.drawElementAndConnect=function(aDiv,name,pos,onClickFunction){
                // remove the switcher;
                var configObj;
                var labelText=name;
                if (name==="defaultNodeElement"){
                    labelText="defaultNode";
                }
                if (name==="defaultPropertyElement"){
                    labelText="defaultProperty";
                }if (name==="defaultDatatypeElement"){
                    labelText="defaultDatatype";
                }

                if (name==="collapsedDatatypes"){
                    labelText="ParentNode";
                }

                if (name==="collapsedMultiLinkProperty"){
                    labelText="< # > ";
                }

                if (name==="collapsedLoops"){
                    labelText="ParentNode";
                }


                var label=aDiv.append("label");
                label.node().innerHTML=name;
                var svg=aDiv.append("svg");
                var containerWidth=parseInt(MENU_CONTAINER.style("width"));
                var nameInConfig=name;
                if (nameInConfig.indexOf(":")!==-1){
                    nameInConfig=nameInConfig.replace(":","");
                }

                if (name==="collapsedDatatypes" || name ==="collapsedLoops"){
                    nameInConfig="owlClass";
                    configObj=wapi.elementsConfig[nameInConfig];
                    if (configObj===undefined){
                        nameInConfig="defaultNodeElement";
                        configObj=wapi.elementsConfig[nameInConfig];
                    }
                }else {
                    configObj = wapi.elementsConfig[nameInConfig];
                }
                if (configObj===undefined){
                    // add it to the elements config , just using a copy of the original thing
                    if (map_nodes.indexOf(name)!==-1){
                        wapi.elementsConfig[nameInConfig]=JSON.parse(JSON.stringify(wapi.elementsConfig[map_nodes[0]]));
                    }
                    if (map_properties.indexOf(name)!==-1){
                        wapi.elementsConfig[nameInConfig]=JSON.parse(JSON.stringify(wapi.elementsConfig[map_properties[0]]));
                    }
                    if (map_datatypes.indexOf(name)!==-1){
                        wapi.elementsConfig[nameInConfig]=JSON.parse(JSON.stringify(wapi.elementsConfig[map_datatypes[0]]));
                    }
                }

                // apply the new config element;
                configObj=wapi.elementsConfig[nameInConfig];
                var radius=parseInt(configObj.radius);
                var height=parseInt(configObj.height);
                var maxHeight=Math.max(2*radius,height)+10;

                svg.attr("width", containerWidth);
                svg.attr("height", maxHeight);
                var node=svg.append("g");

                var element=drawTools.drawElement(node,configObj);
                node.attr("transform", "translate(" + 0.5*containerWidth + "," + 0.5*maxHeight + ")");
                addText(node,labelText,configObj,element);
                addHoverEvents(element,configObj);
                aDiv.on("click",function(){
                    // console.log(name +" triggers on Click");
                    onClickFunction(name,configObj,labelText)});

                // call the function on an add call
                if (pos) {
                    // console.log("Forcing Trigger");
                    onClickFunction(name,configObj,labelText);
                }
            };

            function addHoverEvents(parent,myConfig){
                function mouseHoverIn(){
                    if (that.mouseEntered()) return;
                    that.mouseEntered(true);
                    parent.style("cursor",myConfig.hoverInCursor);
                    parent.style("fill",myConfig.hoverInColor);
                }

                function  mouseHoverOut(){
                    that.mouseEntered(false);
                    parent.style("cursor","default");
                    parent.style("fill",myConfig.bgColor);
                }
                parent.on("mouseover",mouseHoverIn);
                parent.on("mouseout",mouseHoverOut);
            }

            function addText(parent,labelText,configObj,element){
                var renderingTextElement=parent.append("text").text(labelText);
                renderingTextElement.style("font-family",configObj.fontFamily);
                renderingTextElement.style("font-size",configObj.fontSize);
                var fontSizeProperty = window.getComputedStyle(renderingTextElement.node()).getPropertyValue("font-size");
                var fontSize = parseFloat(fontSizeProperty);
                var textWidth = measureTextWidth(labelText,configObj);

                var dx=-0.5*textWidth;
                renderingTextElement.attr("dy", 0.25*fontSize + "px");
                renderingTextElement.attr("dx", dx+"px");
                renderingTextElement.style("pointer-events","none");

                if (element){
                    if (configObj.fontSizeOverWritesShapeSize==="true"){

                        var height=fontSize +parseInt(configObj.overWriteOffset);
                        var width=textWidth+parseInt(configObj.overWriteOffset);
                        var radius=Math.max(0.5*height,0.5*width);

                        // reEvaluate shape sizes;
                        if (configObj.renderingType==="circle"){
                            element.attr("x",-radius);
                            element.attr("y",-radius);
                            element.attr("width",2*radius);
                            element.attr("height",2*radius);
                            element.attr("rx",radius);
                            element.attr("ry",radius);

                        }
                        if (configObj.renderingType==="rect"){
                            element.attr("x",-0.5* width);
                            element.attr("y",-0.5* height);
                            element.attr("width",width);
                            element.attr("height",height);
                            if (configObj.roundedCorner){
                                element.attr("rx",configObj.roundedCorner[0]);
                                element.attr("ry",configObj.roundedCorner[1]);
                            }
                        }

                        if (configObj.renderingType==="ellipse"){
                            element.attr("x",-0.5* width);
                            element.attr("y",-0.5* height);
                            element.attr("width",width);
                            element.attr("height",height);
                            element.attr("rx",width);
                            element.attr("ry",height);
                        }


                    }
                }

                return renderingTextElement;

            }
        function measureTextWidth(text,config) {
            var d = d3.select("body").append("text");
            d.attr("id", "width-test");
            d.attr("style", "position:absolute; float:left; white-space:nowrap; visibility:hidden; font-family:"+config.fontFamily+";font-size: "+config.fontSize);
            d.text(text);
            var w = document.getElementById("width-test").offsetWidth;
            d.remove();
            return w;
        }
        this.mouseEntered=function(val){
            if (!arguments.length) return mouseIn;
            mouseIn=val;
        };



    };
    SideMenu.prototype = Object.create(SideMenu.prototype);
    SideMenu.prototype.constructor = SideMenu;
    return SideMenu;
}());
