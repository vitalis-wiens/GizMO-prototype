module.exports = function (wapi) {
    var graph={};
    var nodeElements=[];
    var linkElements=[];
    var metaInformation;
    var propertyElements=[];
    // some graph rendering variables
    var zoom;
    var dragBehaviour;
    var graphTranslation=[0,0];
    var zoomFactor=1.0;
    var transformAnimation=false;
    var graphContainer;

    var renderedNodes;
    var renderedLink;
    var renderedProperties;
    // temps

    var force;
    var forcePaused=false;
    var graphCharge=-500;
    var graphGravity=0.025;
    var zoomToExtentOfGraph=false;

    var g_colide=false;
    var onNodeClick=undefined;
    var debugContainer;
    var debugMode=false;
    var forceAlpha=3;
    var now,then;

    // view variables;
    var viewArray=[];
    var currentSelectedView=-1;
    var coreApi;
    var notationArray=[];


    var parserdOntologyData;
    var currentlyUsedNotation;

    var triplePositionInformationMap={};

    var debugTextInput;


    graph.getTriplePositionInformationMap=function(){
        return triplePositionInformationMap;
    };

    graph.setParseOntologyData=function(val){
        parserdOntologyData=val;
    };
    graph.setDebugTextInput=function(val){
        debugTextInput=val;
    };

    graph.coreApi=function(val){
        if(!arguments.length) {
            return coreApi;
        }
        coreApi=val;
    };

    graph.viewListFunc=undefined;

    graph.setMetaInformation=function(val){metaInformation=val;};

    graph.setViewInformation=function(val){


        if (val){
            viewArray=[]; // reset views
            // extract the subObjects
            console.log("Added views to graph ");
            for (var i=0;i<val.length;i++){
                var aView=val[i];
                viewArray.push(aView);
                console.log("pushed a view");
                console.log(aView);
            }
            currentSelectedView=0;
        }else{          // clear the viewArray;
            console.log("Could not find views in loaded file!");
            viewArray=[];
            currentSelectedView=-1;
        }

        if (graph.viewListFunc){
            graph.viewListFunc();
        }

    };

    graph.applyViewIfPresent=function(){
      //  console.log("wannt to to apply view "+currentSelectedView );
        // console.log(viewArray.length);
        if (viewArray.length>0 && currentSelectedView>-1){
            console.log("Applying View ");
            graph.applyView(viewArray[currentSelectedView]);
            console.log("DONE");
        }

    };

    graph.applyViewByIndex=function(index){

        // console.log("Try to find view by index");
        currentSelectedView=index;
        graph.applyViewIfPresent();
    };

    graph.continueForceStateAfterAnimation=function(param){
        if (forcePaused===false) {
            forceAlpha = 0.05;
       //     console.log("force alpha is : " + forceAlpha);
            force.resume();
            graph.resumeForce();
        }

        graph.updateAllConfigObjects();
        graph.redraw();
        if (param){
            // the parameter is the graph options from the view;
            graph.applyGraphOptionsForView(param);
        }
    };

    graph.applyGraphOptionsForView=function(opts){
        if (opts){

            var zF=parseFloat(opts.graphZoomFactor);
            var tX=parseFloat(opts.graphTranslation[0]);
            var tY=parseFloat(opts.graphTranslation[1]);
            var forceActive=opts.forceActive;

            if (forceActive==="true" ||  forceActive===true)
                forceActive=true;
            else{
                forceActive=false;
            }

            forcePaused=!forceActive;
          //
          //   console.log("want to apply graph opts");
          //   console.log("Zoom Factor "+ zF);
          //   console.log("Translation "+ tX+ " "+ tY);
          //   console.log("ForceActive "+ forceActive);

            graph.zoomToGivenPosition(zF, tX,tY);

            if (forceActive===true){
                graph.resumeForce();
            } else {
                graph.stopForce();
            }


            coreApi.reEvaluatePauseButton();
        }


    };

    graph.applyView=function(view){
        // the view holds the information for node positions and the gizmo configuration file;
        console.log("Apply View is called");
        graph.stopForce();
        var elementAttributes=view.elementAttributes;

        // if (view.viewNotation){
        //     console.log("That notation "+ view.viewNotation);
        //     // change notation
        //     coreApi.applyProvidedNotation(view.viewNotation);
        // }

        var graphOpts=view.graphOptions;
        console.log("Wannt to apply view! ^^^^^^^^^^^^^^^^  "+view.viewNotation);

        // console.log(elementAttributes);
        // console.log(view.graphOptions);

        // prepare initial rendering;
        graph.updateAllConfigObjects();


        for (var i=0;i<elementAttributes.length;i++){
            var el_id=elementAttributes[i].id;
            var elVisible=elementAttributes[i].visible;
            var renderingEl=coreApi.getRenderingElementForId(el_id);
            var oldStatus=renderingEl.visible();
            renderingEl.visible(elVisible);
            var renEl=undefined;
            var lS=undefined;
            if (elVisible===false) {
                if (renderingEl.getPropertyNode ){
                    renEl=renderingEl.getPropertyNode();
                    // TODO : differ between datatypes and multiLink Strucutres!!
                    if (renEl.tNode&& renEl.tNode().getLinkStructure && renEl.tNode().getLinkStructure()) {
                        // reforcing drawing of the collapsed Multilink;
                        lS=renEl.tNode().getLinkStructure();
                        if (lS.isDatatype()){
                            lS.getParentDomainNode().renderingPrimitive().collapseDatatypes(false);
                        }
                        if (lS.isLoop()){
                            lS.getParentDomainNode().renderingPrimitive().collapseLoops(false);
                        }
                        if (lS.isMultiLink()) {
                            if (lS.getRenderingPrimitive()) {
                                lS.getRenderingPrimitive().collapseMultiLinks(false);
                            }
                        }
                    }
                }
            }

            if (elVisible===true &&  oldStatus!==elVisible){
                if (renderingEl.getPropertyNode){
                    renEl=renderingEl.getPropertyNode();


                    if (renEl.tNode&& renEl.tNode().getLinkStructure && renEl.tNode().getLinkStructure()) {

                        // reforcing drawing of the collapsed Multilink;
                        lS=renEl.tNode().getLinkStructure();
                        //console.log("Loop:" +lS.isLoop()+ "  datatype: "+lS.isDatatype()+ "  multiLink:"+lS.isMultiLink());
                        if (lS.isDatatype()){
                            lS.getParentDomainNode().renderingPrimitive().expandDatatypes(false);
                        }
                        if (lS.isLoop()){
                            lS.getParentDomainNode().renderingPrimitive().expandLoops(false);
                        }
                        if (lS.isMultiLink()) {
                            if (lS.getRenderingPrimitive()) {
                                lS.getRenderingPrimitive().expandMultiLinks(false);
                            }
                        }

                    }
                }
            }
        }
        graph.redraw();
        graph.stopForce();

     //   console.log("---------------------- REDRAW !!!!!!!!");
        function _callback(param){
            // interpolate node positions;
      //      console.log("calling callback function");
            var numElements=param.length;
            var el_id;
            var elPos;
            var elVisible;
            var renderingEl;
            for (var i=0;i<numElements-1;i++){
                el_id=param[i].id;
                elPos=param[i].pos;
                elVisible=param[i].visible;
          //      console.log(param[i]);
                renderingEl=coreApi.getRenderingElementForId(el_id);
                renderingEl.visible(elVisible);
                renderingEl.handlePositionUpdateByViewer(elPos);
            }
            var lastIndex=numElements-1;
            el_id=param[lastIndex].id;
            elPos=param[lastIndex].pos;
            elVisible=param[lastIndex].visible;
            renderingEl=coreApi.getRenderingElementForId(el_id);
            renderingEl.visible(elVisible);
            renderingEl.handlePositionUpdateByViewer(elPos, graph.continueForceStateAfterAnimation,graphOpts);

            // update all configs and redraw





        }

        // // _callback(elementAttributes);
        // if (false){
        //     console.log("this thing wants a gizmo config file to be loaded");
        //     if (loadedGizmoFile!==gizmoDescription) {
        //         coreApi.loadGizmoConfigWithCallBack(gizmoDescription, _callback, elementAttributes);
        //     }
        //     else{
        //         _callback(elementAttributes);
        //         if (graphOpts){
        //             console.log("--------------------------------------");
        //             console.log(graphOpts);
        //             if (graphOpts.forceActive===true || graphOpts.forceActive==="true"){
        //                 forcePaused=false;
        //                 graph.resumeForce();
        //             }
        //
        //         }
        //     }
        //
        // } else {
           // console.log("a one in all file is acctually loaded, currently not yet implemented");
            if (view.viewNotation) {
                console.log("requesting applying notation");
                coreApi.applyProvidedNotation(view.viewNotation);
            }
            _callback(elementAttributes);
            if (graphOpts){
                console.log("--------------------------------------");
                console.log(graphOpts);
                if (graphOpts.forceActive===true || graphOpts.forceActive==="true"){
                    forcePaused=false;
                    graph.resumeForce();
                }
                graph.zoomToGivenPosition(graphOpts.graphZoomFactor,graphOpts.graphTranslation[0],graphOpts.graphTranslation[1])

            }


    }


    ;

    graph.getMetaInformation=function(){return metaInformation;};

    graph.setDebugContainer=function(val){debugContainer=val;};

    // mapping functions for nodes link and property layer;s
    function mapNodesLayer(){
        return "#"+wapi.getCanvasId()+"nodes";
    }
    function mapLinkLayer(){
        return "#"+wapi.getCanvasId()+"links";
    }
    function mapPropertyLayer(){
        return "#"+wapi.getCanvasId()+"properties";
    }


    function addLayers(){

        var layerArray=wapi.config.canvas.getLayers();
        for (var i=0;i<layerArray.length;i++){
            if (layerArray[i]==="markerContainer"){
                var markerContainer= wapi.getCanvasGraphRoot().append('defs');
                markerContainer.node().id = wapi.getCanvasId() + layerArray[i];
            }else {
                var layer = wapi.getCanvasGraphRoot().append('g');
                layer.node().id = wapi.getCanvasId() + layerArray[i];
            }
        }

        // all the zooming function;
        if (zoom) {
            wapi.getCanvasSvgRoot().call(zoom);
        }

    }
    graph.colide=function(val){
        g_colide=val;
    };
    function zoomed(){
        var zoomEventByMWheel = false;
        if (d3.event.sourceEvent) {
            if (d3.event.sourceEvent.deltaY) zoomEventByMWheel = true;
        }
        if (zoomEventByMWheel === false) {
            if (transformAnimation === true) {
                return;
            }
            zoomFactor = d3.event.scale;
            graphTranslation = d3.event.translate;
            graphContainer.attr("transform", "translate(" + graphTranslation + ")scale(" + zoomFactor + ")");
            return;
        }
        /** animate the transition **/
        zoomFactor = d3.event.scale;
        graphTranslation = d3.event.translate;
        graphContainer.transition()
            .tween("attr.translate", function () {
                return function (t) {
                    transformAnimation = true;
                    var tr = d3.transform(graphContainer.attr("transform"));
                    graphTranslation[0] = tr.translate[0];
                    graphTranslation[1] = tr.translate[1];
                    zoomFactor = tr.scale[0];
                };
            })
            .each("end", function () {
                transformAnimation = false;
            })
            .attr("transform", "translate(" + graphTranslation + ")scale(" + zoomFactor + ")")
            .ease('linear')
            .duration(250);
    }

    graph.forcePlayPause=function(){
        forcePaused=!forcePaused;
        if (forcePaused){
            force.stop();
        }else {
            force.resume();
        }
        return forcePaused;
    };

    graph.isForcePaused=function(){
        return forcePaused;
    };

    function recalculatePositionsWithFPS(){
        // compute the fps

        recalculatePositions();
        now = Date.now();
        var diff=now-then;
        var fps=(1000 / (diff)).toFixed(2);
        debugContainer.node().innerHTML="FPS: "+fps+ "<br>Nodes:"+force.nodes().length + "<br>Links:"+force.links().length;
        then=Date.now();


    }

    graph.interpolatePositions=function(){
        recalculatePositions();
    };


    function recalculatePositions(){
        forceAlpha=force.alpha();
        if (renderedNodes===undefined) {
            console.log("No Data to Visualize");
            return;}
        if (g_colide===false) {
            renderedNodes.attr("transform", function (node) {
                return "translate(" + node.x + "," + node.y + ")";
            });
            renderedLink.each(function (link) {
                link.updateDrawedPosition();
            });
        }else {
            var q = d3.geom.quadtree(nodeElements),
                i = 0,
                n = nodeElements.length;
            while (++i < n) {
                q.visit(collide(nodeElements[i]));
            }
            renderedNodes.attr("transform", function (node) {
                return "translate(" + node.x + "," + node.y + ")";
            });

        }



    }

    graph.showFPSAndElementStatistic=function(val){
        debugMode=val;

    };

    function collide(node) {


        var r = node.radius+16 ,
            nx1 = node.x - r,
            nx2 = node.x + r,
            ny1 = node.y - r,
            ny2 = node.y + r;
        return function(quad, x1, y1, x2, y2) {
            if (quad.point && (quad.point !== node)) {
                var x = node.x - quad.point.x,
                    y = node.y - quad.point.y,
                    l = Math.sqrt(x * x + y * y),
                    r = node.radius + quad.point.radius;
                if (l < r) {
                    l = (l - r) / l * .5;
                    node.x -= x *= l;
                    node.y -= y *= l;
                    quad.point.x += x;
                    quad.point.y += y;
                }
            }
            return x1 > nx2
                || x2 < nx1
                || y1 > ny2
                || y2 < ny1;
        };
    }



    graph.ignoreEvents=function(){
        if (d3.event){ d3.event.stopPropagation()}
    };

    graph.charge=function(val){
        if(!arguments.length) return graphCharge;
        graphCharge=val;
    };

    graph.gravity=function(val){
        if(!arguments.length) return graphGravity;
        graphGravity=val;
    };


    graph.zoomToExtentOfGraphWhenFinished=function(val){
        zoomToExtentOfGraph=val;

    };
    function createForceElements()
    {
        if (force===undefined){
            force =  d3.layout.force();
            //
            if (debugMode){
                force.on("tick", recalculatePositionsWithFPS);
            } else {
                force.on("tick", recalculatePositions);
            }
        }
        // console.log("calling createForceElements" + force);
        var forceLinks = [];
        var forceNodes= [];

        var i;
        for ( i = 0; i < linkElements.length; i++) {
            // if (linkElements[i].visible()){
            forceLinks = forceLinks.concat(linkElements[i].getForceLink());
            // }
        }

        // update force nodes based on visible flag
        for (i=0;i<nodeElements.length;i++){
            if (nodeElements[i].visible()===true){
                forceNodes.push(nodeElements[i]);
            }
        }
        // console.log(force);
        // console.log("force ^^^ ");
        force.nodes(forceNodes);
        force.links(forceLinks);
        // create forceLinks;
        force.charge(function (element) {
            return element.charge();
        })
            .linkDistance(function (link) {
                return link.propertyData.linkDistance();
            })

            .linkStrength(function (link) {
                return link.propertyData.linkStrength();
            })
            .size(wapi.getSize())
            .gravity(graph.gravity());



    }
    graph.createFroceDirectedLayout=function(){
        // console.log("hello Force");
        force = d3.layout.force();
        //
        if (debugMode){
            force.on("tick", recalculatePositionsWithFPS);
        } else {
            force.on("tick", recalculatePositions);
        }
        createForceElements();
        force.start();
        console.log("");
    };

    graph.updateForceLayout=function(){
        createForceElements();
        force.start();
        force.stop();
        if (!forcePaused) {
            force.resume();
        }
    };


    graph.initializeRendering=function(){
        graph.createFroceDirectedLayout();
        // console.log("initializing Rendering");
        graphContainer=wapi.getCanvasGraphRoot();
        var moved = false;
        dragBehaviour = d3.behavior.drag()
            .origin(function (d) {
                return d;
            })
            .on("dragstart", function (d) {

                d3.event.sourceEvent.stopPropagation(); // Prevent panning
                d.fixed=true;

            })
            .on("drag", function (d) {
                d3.event.sourceEvent.stopPropagation(); // Prevent panning
                d.setPosition(d3.event.x, d3.event.y);
                d.px = d3.event.x;
                d.py = d3.event.y;

                if (!forcePaused) {
                    force.resume();
                } else { force.on("tick")(); }

                d.updateDrawedPosition();


            })
            .on("dragend", function (d) {
                // force.resume();
                d.fixed=false;

            });

        // Apply the zooming factor.
        zoom = d3.behavior.zoom()
            .duration(150)
            .scaleExtent([0.2,5])
            .on("zoom", zoomed)
            .on("zoomstart", function(){

                if (d3.event.sourceEvent && d3.event.sourceEvent.buttons && d3.event.sourceEvent.buttons===1)
                    wapi.getCanvasSvgRoot().style("cursor", "move");
            })
            .on("zoomend", function(){
                wapi.getCanvasSvgRoot().style("cursor", "auto");


                // save the graph values;

                var t = d3.transform(graphContainer.attr("transform")),
                    x = t.translate[0],
                    y = t.translate[1],
                    z=t.scale[0];
                // console.log("x:"+x+"  y:"+y+ "  z:"+ z);
                graphTranslation[0]=x;
                graphTranslation[1]=y;
                zoomFactor=z;
            });
        wapi.getCanvasSvgRoot().call(zoom);
        zoom = zoom.scaleExtent([0.02,5]);
        if (graphContainer) {
            zoom.event(graphContainer);
        }
    };


    graph.createNodeFromtNode=function(tNode){
        var basicNode=new wapi.baseNodeConstructor(wapi);
        // default wapiConfigObjl
        basicNode.nodeObject(tNode);
        var defNode="defaultNodeElement";
        // map the nodeConfigTypeFrom <prefix>:Type to <prefix>Type
        basicNode.setLabelText(tNode.getLabelForCurrentLang());
        if (tNode.type()==="owl:Class"){
            basicNode.setConfigName("owlClass");
            basicNode.connectDoubleClickAction(function(){
                console.log("Double Click action on owlClass");
                basicNode.handleDatatypeAndLoops();
            });
        }
        if (tNode.type()==="owl:Thing"){
            basicNode.setConfigName("owlThing");
            basicNode.setLabelText("Thing");
            basicNode.connectDoubleClickAction(function(){
                //console.log("Double Click action on owlClass");
                basicNode.handleDatatypeAndLoops();
            });
        }
        if (tNode.type()==="rdfs:Datatype"){
            basicNode.setConfigName("rdfsDatatype");
            defNode="defaultDatatypeElement";
        }
        if (tNode.type()==="rdfs:Literal"){
            basicNode.setConfigName("rdfsLiteral");
            defNode="defaultDatatypeElement"
        }
        basicNode.defaultElementType(defNode);
        basicNode.updateConfig();

        if  (tNode.initialPosition()===undefined) {
            basicNode.setPosition(100 * Math.random(), 100 * Math.random()); // random node pos init
        }

        tNode.renderingPrimitive(basicNode);
        nodeElements.push(basicNode);
        coreApi.addRenderingElementToIdMap(basicNode,tNode.id());


        if (tNode.getDatatypeProperties() ){
            if (tNode.getDatatypeProperties().length>0) {
                basicNode.hasCollapsibleNodes(true);
            }
        }
        return basicNode;
    };

    graph.createMultiLinkStructures=function(mlProperty){
        var PropertyConfig="collapsedMultiLinkProperty";
        if (mlProperty.isMultiLink() && !mlProperty.isLoop()){
            var propertyElement=new wapi.multiLinkHandlerConstructor(wapi);
            propertyElement.setLinkContainer(mlProperty);
            propertyElement.setConfigName(PropertyConfig);
            var proNode=propertyElement.createPropertyNode("");
            proNode.tNode(propertyElement);
            proNode.defaultElementType("collapsedMultiLinkProperty");
            proNode.updateConfig();
            propertyElements.push(proNode);
            linkElements.push(propertyElement);
            mlProperty.setRenderingPrimitive(propertyElement);
            propertyElement.collapseMultiLinks();
            coreApi.addMLRenderingElementToMap(propertyElement);
        }

    };



    graph.createPropertyFromtProperty=function(tProp){

        var defPropType="defaultPropertyElement";
        if (!tProp.isMultiLink() && !tProp.isLoop()){
            var propertyElement=new wapi.singleLinkConstructor(wapi);
            propertyElement.defaultElementType(defPropType);
            propertyElement.setLabelText(tProp.getLabelForCurrentLang());
            propertyElement.propertyObject(tProp);

            if (tProp.type().toLowerCase()==="owl:datatypeProperty".toLowerCase()){
                propertyElement.setConfigName("owlDatatypeProperty");

            }
            if (tProp.type().toLowerCase()==="owl:objectProperty".toLowerCase()){
                propertyElement.setConfigName("owlObjectProperty");
            }
            if (tProp.type().toLowerCase()==="rdfs:subClassOf".toLowerCase()){
                propertyElement.setConfigName("rdfssubClassOf");
                tProp.label("Subclass of");

                // console.log("__________________DOMAIN "+tProp.domain().iri());
                // console.log("__________________RANGE "+tProp.range().iri());
            }
            propertyElement.updateConfig();
            propertyElement.domain(tProp.domain().renderingPrimitive());
            propertyElement.range(tProp.range().renderingPrimitive());
            var proNode=propertyElement.createPropertyNode(tProp.getLabelForCurrentLang());
            proNode.defaultElementType(defPropType);
            proNode.updateConfig();
            propertyElements.push(proNode);
            linkElements.push(propertyElement);
            tProp.setRenderingPrimitive(propertyElement);
            propertyElement.updateConfig();
            coreApi.addRenderingElementToIdMap(propertyElement,tProp.id());


            // add trible information object
            var s=tProp.domain().iri();
            var p=tProp.iri();
            var o=tProp.range().iri();

            var tiO={};
            tiO.identifier=s+p+o;
            tiO[s]=tProp.domain();
            tiO[p]=tProp;
            tiO[o]=tProp.range();
            // console.log(tiO);
            triplePositionInformationMap[tiO.identifier]=tiO;

            return propertyElement;
        } else if (tProp.isLoop()){
            var loopPropertyElement=new wapi.loopLinkConstructor(wapi);
            loopPropertyElement.defaultElementType(defPropType);
            loopPropertyElement.setLabelText(tProp.getLabelForCurrentLang());
            loopPropertyElement.propertyObject(tProp);

            if (tProp.type().toLowerCase()==="owl:objectProperty".toLowerCase()){
                loopPropertyElement.setConfigName("owlObjectProperty");
            }
            loopPropertyElement.updateConfig();

            loopPropertyElement.domain(tProp.domain().renderingPrimitive());
            loopPropertyElement.domain().hasCollapsibleLoops(true);
            loopPropertyElement.range(tProp.range().renderingPrimitive());
            var loopNode=loopPropertyElement.createPropertyNode(tProp.getLabelForCurrentLang());
            loopNode.defaultElementType(defPropType);
            loopNode.updateConfig();

            nodeElements.push(loopNode);
            linkElements.push(loopPropertyElement);
            tProp.setRenderingPrimitive(loopPropertyElement);
            coreApi.addRenderingElementToIdMap(loopPropertyElement,tProp.id());

            // add trible information object
            var s=tProp.domain().iri();
            var p=tProp.iri();
            var o=tProp.range().iri();
            var tiO={};
            tiO.identifier=s+p+o;
            tiO[s]=tProp.domain();
            tiO[p]=tProp;
            tiO[o]=tProp.range();
           // console.log(tiO);
            triplePositionInformationMap[tiO.identifier]=tiO;


            return loopPropertyElement;
        } else {
            var multiPropertyElement=new wapi.multiLinkConstructor(wapi);
            multiPropertyElement.defaultElementType(defPropType);
            multiPropertyElement.setLabelText(tProp.getLabelForCurrentLang());
            multiPropertyElement.propertyObject(tProp);
            if (tProp.type().toLowerCase()==="owl:datatypeProperty".toLowerCase()){
                multiPropertyElement.setConfigName("owlDatatypeProperty");
            }
            if (tProp.type().toLowerCase()==="owl:objectProperty".toLowerCase()){
                multiPropertyElement.setConfigName("owlObjectProperty");
            }
            if (tProp.type().toLowerCase()==="rdfs:subClassOf".toLowerCase()){
                multiPropertyElement.setConfigName("rdfssubClassOf");
                tProp.label("Subclass of");
            }
            multiPropertyElement.updateConfig();
            multiPropertyElement.domain(tProp.domain().renderingPrimitive());
            multiPropertyElement.range(tProp.range().renderingPrimitive());
            var mlPropNode=multiPropertyElement.createPropertyNode(tProp.getLabelForCurrentLang());
            mlPropNode.defaultElementType(defPropType);
            mlPropNode.updateConfig();
            nodeElements.push(mlPropNode);
            linkElements.push(multiPropertyElement);
            tProp.setRenderingPrimitive(multiPropertyElement);
            coreApi.addRenderingElementToIdMap(multiPropertyElement,tProp.id());
            // add trible information object
            var s=tProp.domain().iri();
            var p=tProp.iri();
            var o=tProp.range().iri();
            var tiO={};
            tiO.identifier=s+p+o;
            tiO[s]=tProp.domain();
            tiO[p]=tProp;
            tiO[o]=tProp.range();
         //   console.log(tiO);
            triplePositionInformationMap[tiO.identifier]=tiO;
        }


    };


    function getWorldPosFromScreen(x, y, translate, scale) {
        var temp = scale[0], xn, yn;
        if (temp) {
            xn = (x - translate[0]) / temp;
            yn = (y - translate[1]) / temp;
        } else {
            xn = (x - translate[0]) / scale;
            yn = (y - translate[1]) / scale;
        }
        return {x: xn, y: yn};
    }
    function transform(p, cx, cy) {
        zoomFactor = wapi.getSize()[1] / p[2];
        graphTranslation = [(cx - p[0] * zoomFactor), (cy - p[1] * zoomFactor)];
        // update the values in case the user wants to break the animation
        zoom.translate(graphTranslation);
        zoom.scale(zoomFactor);
        return "translate(" + graphTranslation[0] + "," + graphTranslation[1] + ")scale(" + zoomFactor + ")";
    }

    function interpolateView(time, options){


        var sx=options[0];
        var sy=options[1];

        var tx=options[2];
        var ty=options[3];

        var sZ=options[4];
        var tZ=options[5];


        graphTranslation[0]=sx+time*(tx-sx);
        graphTranslation[1]=sy+time*(ty-sy);
        zoomFactor=sZ+time*(tZ-sZ);

        return "translate(" + graphTranslation[0] + "," + graphTranslation[1] + ")scale(" + zoomFactor + ")";
    }



    graph.zoomToGivenPosition=function(newZoom,translationX,translationY){
        var lenAnimation = 500;

        console.log("zooming to given position");
        console.log("current", "translate(" + graphTranslation + ")scale(" + zoomFactor + ")");
        console.log("New", "translate(" + translationX+", "+translationY+ " )scale(" + newZoom+ ")");

        var opts=[graphTranslation[0],graphTranslation[1],translationX,translationY,zoomFactor,newZoom];


        graphContainer.transition()
            .duration(lenAnimation)
            .attr( "transform", interpolateView(0,opts))
            .attrTween("transform", function () {
                return function (t) {
                    return interpolateView(t,opts);
                };
            })
            .each("end", function () {
                graphTranslation[0]=translationX;
                graphTranslation[1]=translationY;
                zoomFactor=newZoom;
                graphContainer.attr("transform", "translate(" + graphTranslation + ")scale(" + zoomFactor + ")");
                zoom.translate( graphTranslation );
                zoom.scale( zoomFactor );

            });
    };

    graph.zoomToExtentOfGraph=function(){
        // we need to kill the halo to determine the bounding box;
        var bbox=graphContainer.node().getBoundingClientRect();
        // get the graph coordinates
        var bboxOffset=50; // default radius of a node;
        var topLeft  = getWorldPosFromScreen(bbox.left,bbox.top,graphTranslation,zoomFactor);
        var botRight = getWorldPosFromScreen(bbox.right,bbox.bottom,graphTranslation,zoomFactor);
        var w = wapi.getSize()[0];
        var h = wapi.getSize()[1];

        topLeft.x  -= bboxOffset;
        topLeft.y  -= bboxOffset;
        botRight.x += bboxOffset;
        botRight.y += bboxOffset;

        var g_w = botRight.x-topLeft.x;
        var g_h = botRight.y-topLeft.y;
        //console.log("Size "+g_w+"  "+g_h);

        // endpoint position calculations
        var posX = 0.5*(topLeft.x + botRight.x);
        var posY = 0.5*(topLeft.y + botRight.y);
        var cx   = 0.5 * w,
            cy   = 0.5 * h;
        var cp   = getWorldPosFromScreen(cx, cy, graphTranslation, zoomFactor);

        // zoom factor calculations and fail safes;
        var newZoomFactor=1.0; // fail save if graph and window are squares
        // //get the smaller one
        // var a=w / g_w;
        // var b=h/ g_h;
        // if (a<b)  newZoomFactor = a;
        // else      newZoomFactor = b;
        //

        // fail saves
        if ( newZoomFactor > zoom.scaleExtent()[1] ) {
            newZoomFactor = zoom.scaleExtent()[1];
        }
        if ( newZoomFactor < zoom.scaleExtent()[0] ) {
            newZoomFactor = zoom.scaleExtent()[0];
        }

        // apply Zooming
        var sP = [cp.x, cp.y, h / zoomFactor];
        var eP = [posX, posY, h / newZoomFactor];


        var pos_intp = d3.interpolateZoom(sP, eP);
        var lenAnimation = pos_intp.duration;
        lenAnimation = 500;
        graphContainer.attr( "transform", transform(sP, cx, cy) )
            .transition()
            .duration(lenAnimation)
            .attrTween("transform", function () {
                return function (t) {
                    return transform( pos_intp(t), cx, cy );
                };
            })
            .each("end", function () {
                graphContainer.attr("transform", "translate(" + graphTranslation + ")scale(" + zoomFactor + ")");
                zoom.translate( graphTranslation );
                zoom.scale( zoomFactor );
            });
    };

    graph.addProperty=function(text,PropertyConfig){

        var propertyElement=new wapi.singleLinkConstructor(wapi);
        propertyElement.setLabelText(text);

        propertyElement.setConfigObject(PropertyConfig);
        var proNode=propertyElement.createPropertyNode(text);
        proNode.setConfigObject(PropertyConfig);
        propertyElements.push(proNode);
        linkElements.push(propertyElement);
        return propertyElement;

    };

    graph.addMLProperty=function(text,PropertyConfig){

        var propertyElement=new wapi.multiLinkConstructor(wapi);
        propertyElement.setLabelText(text);

        propertyElement.setConfigObject(PropertyConfig);
        var proNode=propertyElement.createPropertyNode(text);

        proNode.setConfigObject(PropertyConfig);

        nodeElements.push(proNode);
        linkElements.push(propertyElement);
        return propertyElement;
    };

    graph.addLoopProperty=function(text,PropertyConfig){

        var loopPropertyElement=new wapi.loopLinkConstructor(wapi);
        loopPropertyElement.setLabelText(text);
        loopPropertyElement.setConfigObject(PropertyConfig);

        var loopNode=loopPropertyElement.createPropertyNode(text);
        loopNode.setConfigObject(PropertyConfig);

        nodeElements.push(loopNode);
        linkElements.push(loopPropertyElement);


        return loopPropertyElement;
    };

    graph.addCollapsedMLProperty=function(text,PropertyConfig){

        var propertyElement=new wapi.multiLinkHandlerConstructor(wapi);
        propertyElement.setLabelText(text);
        propertyElement.setConfigObject(PropertyConfig);

        var proNode=propertyElement.createPropertyNode(text);
        proNode.defaultElementType("collapsedMultiLinkProperty");
        proNode.setConfigObject(PropertyConfig);
        propertyElements.push(proNode);
        linkElements.push(propertyElement);
        propertyElement.visible(true);
        return propertyElement;

    };


    graph.addNode=function(text,NodeConfig){
        var basicNode=new wapi.baseNodeConstructor(wapi);
        basicNode.setConfigObject(NodeConfig);
        basicNode.setPosition(100*Math.random(),100*Math.random()); // ranodom node pos init
        basicNode.setLabelText(text);

        nodeElements.push(basicNode);
        return basicNode;
    };

    graph.addSimilarityNode=function(text,NodeConfig, scaleBysimilartyFactor){
        var basicNode=new wapi.similarityNodeConstructor(wapi);
        basicNode.connectingonNodeClick(onNodeClick);
        basicNode.setConfigObject(NodeConfig);
        basicNode.setSimilarity(scaleBysimilartyFactor);
        basicNode.setPosition(100*Math.random(),100*Math.random()); // random node pos init
        basicNode.setLabelText(text);
        nodeElements.push(basicNode);

        return basicNode;
    };

    graph.addSingleLink=function(text,domain,range,config){
        // make connections;
        var singleLink= new wapi.singleLinkConstructor(wapi);
        singleLink.setConfigObject(config);
        singleLink.domain(domain);
        singleLink.range(range);
        singleLink.setLabelText(text);
        var proNode=singleLink.createPropertyNode(text);
        propertyElements.push(proNode);
        linkElements.push(singleLink);

    };

    graph.createDummyNode=function(){
        return;



        // var thingNOde=new wapi.baseNodeConstructor(wapi);
        // thingNOde.setConfigObject(wapi.elementsConfig.owlThing);
        // thingNOde.setPosition(120,51);
        // nodeElements.push(thingNOde);
        //
        // var testConnection= new wapi.baseLinkConstructor(wapi);
        // testConnection.setConfigObject(wapi.elementsConfig.plainLink);
        // testConnection.domain(thingNOde);
        // testConnection.range(dummyNode);
        // linkElements.push(testConnection);
        //
        // var testConnection2= new wapi.domainNodeRangeConstructor(wapi);
        // testConnection2.setConfigObject(wapi.elementsConfig.plainLink);
        // testConnection2.domain(dummyNode2);
        // testConnection2.range(dummyNode);
        // var propNode=testConnection2.createForceNode("A Force De Node");
        // nodeElements.push(propNode);
        // linkElements.push(testConnection2);


    };

    function remove() {
        if (graphContainer) {
            // Select the parent element because the graph container is a group (e.g. for zooming)
            d3.select(graphContainer.node().parentNode).remove();
        }
    }

    graph.setOnNodeClickFunction=function( val){
        onNodeClick=val;
    };


    graph.stopForce=function(){
        force.stop();
    };
    graph.resumeForce=function(){
        console.log("FORCE RESUMED AFTER GIZMO ANIMATION!!! "+forceAlpha);
        if (forceAlpha<=0.0001){
            forceAlpha=0.05;
        }
        force.alpha(forceAlpha);
    };

    graph.updateAllConfigObjects=function(){

        renderedNodes.each(function (node) {
            if (node.visible()){
                node.updateConfig();
                // console.log(node.getConfigObj());
                node.draw(d3.select(this));
                node.updateDrawedPosition();
            }
        });

        renderedProperties.each(function (prop) {
            if (prop.visible()) {
                prop.updateConfig();
                prop.draw(d3.select(this));
                prop.updateDrawedPosition();
            }
        });
        var makerContainer=d3.select("#"+wapi.getCanvasId()+"markerContainer");
        renderedLink.each(function (link) {
            if (link.visible()) {
                link.updateConfig();
                link.draw(d3.select(this),makerContainer);
                link.updateDrawedPosition();
            }
        });
    };






    graph.redraw=function(){
        console.log("Redrawing Graph!!!");

        var layerArray=wapi.config.canvas.getLayers();
        for (var i=0;i<layerArray.length;i++){
            d3.select("#"+wapi.getCanvasId()+layerArray[i]).remove();
        }


        addLayers();
        createForceElements();
        graph.drawElements();

        force.start();
        force.stop();
        if (!forcePaused) {
            force.resume();
        }


        console.log("Redrawing Graph!!! << DONE")
    };


    graph.redrawForView=function(){
        var layerArray=wapi.config.canvas.getLayers();
        for (var i=0;i<layerArray.length;i++){
            d3.select("#"+wapi.getCanvasId()+layerArray[i]).remove();
        }

        addLayers();
        createForceElements();
        graph.drawElements();


    };


    graph.clear=function(){
        var layerArray=wapi.config.canvas.getLayers();
        for (var i=0;i<layerArray.length;i++){
            d3.select("#"+wapi.getCanvasId()+layerArray[i]).remove();
        }
        nodeElements=[];
        propertyElements=[];
        linkElements=[];
    };


    graph.clearGraphData=function(){
        // remove();
        // console.log("Clearing the Graph DATA");
        var layerArray=wapi.config.canvas.getLayers();
        if (layerArray) {

            for (var i = 0; i < layerArray.length; i++) {

                if (d3.select("#" + wapi.getCanvasId() + layerArray[i]))
                    d3.select("#" + wapi.getCanvasId() + layerArray[i]).remove();
            }
        }


        nodeElements=[];
        propertyElements=[];
        linkElements=[];
        triplePositionInformationMap={};

        addLayers();
        createForceElements();
        graph.drawElements();


    };




    graph.drawElements=function() {

       // console.log("number of Nodes="+nodeElements.length);
        if (nodeElements.length===0) return;
        // create rendering Nodes ;
        renderedNodes = d3.select(mapNodesLayer()).selectAll(".nodeElements")
            .data(nodeElements)
            .enter()
            .append("g")
            .classed("nodeElements", true)
            .attr("id", function (d) {
                return d.id();
            })
            .call(dragBehaviour);

        // draw them;
        renderedNodes.each(function (node) {
            if (node.visible()) {
                node.draw(d3.select(this));
                node.updateDrawedPosition();
            }
        });


        renderedProperties = d3.select(mapNodesLayer()).selectAll(".propertyElements")
            .data(propertyElements)
            .enter()
            .append("g")
            .classed("propertyElements", true)
            .attr("id", function (d) {
                return d.id();
            })
            .call(dragBehaviour);


        // draw them;

        renderedProperties.each(function (prop) {

            if (prop.visible()) {
                prop.draw(d3.select(this));
                prop.updateDrawedPosition();
            }
        });


        renderedLink = d3.select(mapLinkLayer()).selectAll(".linkElements")
            .data(linkElements).enter()
            .append("g")
            .classed(".linkElements", true)
            .call(dragBehaviour);


        var makerContainer = d3.select("#" + wapi.getCanvasId() + "markerContainer");
        renderedLink.each(function (link) {
            if (link.visible()) {
                link.draw(d3.select(this), makerContainer);
                link.updateDrawedPosition();
            }
        });

    };

    // rendering shape updates
    graph.updateRenderingPrimitives=function(){

        forceAlpha=force.alpha();
        force.stop();
        if (renderedNodes===undefined || renderedNodes.length===0){
            return;
        }
        renderedNodes.each(function (node) {
            node.handleGizmoRepresentationChanges();
        });
        renderedProperties.each(function (prop) {
            prop.handleGizmoRepresentationChanges();
        });

        var i=1;
        renderedLink.each(function (link) {
            link.handleGizmoRepresentationChanges(i,renderedLink.size());
            i++;
        });
        console.log("Updating GizomRep Changes << FINISHED");
    };

    graph.updateRenderingPrimitivesWithCallBack=function(_callback,_param){



        forceAlpha=force.alpha();
        force.stop();
        renderedNodes.each(function (node) {

            node.handleGizmoRepresentationChanges();
        });
        renderedProperties.each(function (prop) {
            prop.handleGizmoRepresentationChanges();
        });

        var i=1;
        renderedLink.each(function (link) {
            link.handleGizmoRepresentationChanges(i,renderedLink.size(),_callback,_param);
            i++;
        });

    };




    graph.getClassDefinitions=function () {
        var i;

        if (nodeElements.length===0){
            console.log("ERROR: no elements to export");
            return "";
        }

        var classDefString='"class": [\n';

        // write the first element without comma;
        for ( i=0;i<nodeElements.length;i++) {
            var node=nodeElements[i];
            if (node.tNode() && !node.tNode.getRenderingPrimitive &&   node.tNode().getJsonClassDefinition) {
                classDefString+=nodeElements[i].tNode().getJsonClassDefinition()+"\n,";
            }
        }
        classDefString=classDefString.substring(0,classDefString.length-2);
        classDefString+='\n]\n';
        return classDefString;
    };

    graph.getClassAttributes=function(){
        if (nodeElements.length===0){
            console.log("ERROR: no elements to export");
            return "";
        }

        var classAttrString='"classAttribute": [\n';
        var i;
        for ( i=0;i<nodeElements.length;i++) {
            var node=nodeElements[i];
            if (node.tNode() && !node.tNode.getRenderingPrimitive &&   node.tNode().getJsonClassDescription) {
                classAttrString+=nodeElements[i].tNode().getJsonClassDescription()+"\n,";
            }
        }
        classAttrString=classAttrString.substring(0,classAttrString.length-2);
        classAttrString+='\n]\n';
        return classAttrString;

    };


    graph.getPropertyDefinitions=function(){
        if (linkElements.length===0){
            console.log("ERROR: no property elements to export");
            return "";
        }
        var propertyDefString='"property": [\n';
        var i;
        // write the first element without comma;

        for ( i=0;i<linkElements.length;i++) {
            var property=linkElements[i];
            if (property.propertyObject() && property.propertyObject().getJsonPropertyDefinition) {
                propertyDefString+=linkElements[i].propertyObject().getJsonPropertyDefinition()+"\n,";
            }
        }
        propertyDefString=propertyDefString.substring(0,propertyDefString.length-2);
        propertyDefString+='\n]\n';
        return propertyDefString;


    };
    graph.getPropertyAttributes=function(){
        if (linkElements.length===0){
            console.log("ERROR: no property elements to export");
            return "";
        }
        var propertyAttributesString='"propertyAttribute": [\n';
        var i;
        // write the first element without comma;
        for ( i=0;i<linkElements.length;i++) {
            var property=linkElements[i];
            if (property.propertyObject() && property.propertyObject().getJsonPropertyDescription) {
                propertyAttributesString+=linkElements[i].propertyObject().getJsonPropertyDescription()+"\n,";
            }
        }
        propertyAttributesString=propertyAttributesString.substring(0,propertyAttributesString.length-2);
        propertyAttributesString+='\n]\n';
        return propertyAttributesString;

    };

    graph.getJSONRepresentation=function(){
        var viewList=[];
        var i;
        for ( i=0;i<nodeElements.length;i++) {
            var node=nodeElements[i];
            if (node.tNode()) {
                viewList.push({id: node.tNode().id(), pos: [node.x.toFixed(2), node.y.toFixed(2)],visible: node.visible()});
            }
        }

    };

    graph.getGraphOptionsForView=function(){

        var t = d3.transform(graphContainer.attr("transform")),
            x = t.translate[0],
            y = t.translate[1],
            z=t.scale[0];
        console.log("x:"+x+"  y:"+y+ "  z:"+ z +" forcaAtive: "+!forcePaused);
        graphTranslation[0]=x;
        graphTranslation[1]=y;
        zoomFactor=z;
        var forceActive=!forcePaused;
        return {
            "graphZoomFactor":zoomFactor,
            "graphTranslation": graphTranslation,
            "forceActive": forceActive
        };
    };

    graph.getJSONRepresentationForView=function(){

        // we just need the id of the elements and their positions;

        var viewList=[];
        var i;
        for ( i=0;i<nodeElements.length;i++) {
            var node=nodeElements[i];
            if (node.tNode() && node.isNotExportable()===false) {
                viewList.push({id: node.tNode().id(), pos: [node.x.toFixed(2), node.y.toFixed(2)],visible: node.visible()});
            }
        }

        for (i =0; i<propertyElements.length;i++) {
            var prop=propertyElements[i];
            if ( prop.tNode() && prop.isNotExportable()===false) {
                viewList.push({id: prop.tNode().id(), pos: [prop.x.toFixed(2), prop.y.toFixed(2)],visible: prop.visible()});
            }
        }
        return viewList;
    };

    graph.appendView=function(prefix,iri, notation_iri,usesImport){

        console.log("Need to create a view for "+ prefix+ " with iri "+ iri);
        return  graph.ref_appendViewAsJsonObject(prefix,iri,notation_iri,usesImport);

    };

    graph.addViewFromAnnotations=function(viewDef){
        viewArray.push(viewDef);
        console.log("Succesfully added View");
        if (graph.viewListFunc) {graph.viewListFunc();}
    };

    graph.ref_appendViewAsJsonObject=function(prefix,iri,notation,usesImport){
        // create json viewObject;

        //1]
        var viewString=graph.getJSONRepresentationForView();
       // var gizmoDescription=graph.coreApi().getLoadedGizmoFileName();
        var viewDefinitionObject={};
        viewDefinitionObject.graphOptions=graph.getGraphOptionsForView();
     //   viewDefinitionObject.gizmoConfig=gizmoDescription;
        viewDefinitionObject.elementAttributes=viewString;
        viewDefinitionObject.viewPrefix=prefix;
        viewDefinitionObject.viewIRI=iri;

        if (notation) {
            viewDefinitionObject.viewNotation = notation;
            viewDefinitionObject.usesImport=usesImport;
        }

        console.log(viewDefinitionObject);


        var prefixOrIriExist=false;
        for (var i=0;i<viewArray.length;i++){
            var vdo=viewArray[i];
            if (vdo.viewPrefix===prefix || vdo.viewIRI===iri){
                prefixOrIriExist=true;
                return false;
            }
        }

        viewArray.push(viewDefinitionObject);
        console.log("Succesfully added View");
        if (graph.viewListFunc) {graph.viewListFunc();}
        return true;
    };


        graph.getViewAsTTL=function(index, exportPredixandOntologyDef){

            var aView=viewArray[index];
            if (aView){
                // create the views;
                var cV = aView;
                console.log("getting prefixList");
                var cVprefixList=metaInformation.prefixList();
                console.log(cVprefixList);
                console.log("Done prefixList");
                var prefIRI=aView.viewIRI;
                if (!prefIRI.endsWith("#"))
                    prefIRI+="#";
                cVprefixList[aView.viewPrefix]=prefIRI;
                cVprefixList.gizmo="http://visualdataweb.org/ontologies/gizmo-core#";
                //
                var dtMap=coreApi.getDatatypeAssertionMap();
                // write prefixes;

                var str_View="";
                if (exportPredixandOntologyDef===true) {
                    str_View += "######### PREFIX DEFINITIONS ###########\n";
                    for (var name in cVprefixList) {
                        if (cVprefixList.hasOwnProperty(name)) {
                            str_View += "@prefix " + name + ": <" + cVprefixList[name] + "> .\n";
                        }
                    }
                    str_View += "######### OntoDef ###########\n";
                    str_View +="<"+aView.viewIRI+"> rdf:type owl:Ontology .\n";

                }




                // store graph options;
                console.log(cV.graphOptions);
                var cVPref = cV.viewPrefix;
                str_View += "########### Graph Options of View ############\n\n";
                str_View += cVPref + ":viewDefinitions rdf:type owl:NamedIndividual;\n";

                    if (cV.viewNotation ){
                        str_View += "\t\t gizmo:viewUsesNotation <" +  cV.viewNotation+">;\n";
                    }
                str_View += "\t\t gizmo:annotationIndividual \"true\"^^xsd:boolean;\n";
                str_View += "\t\t gizmo:forceLayoutActive \"" + cV.graphOptions.forceActive + "\"^^xsd:boolean;\n";
                str_View += "\t\t gizmo:graphZoomFactor \"" + cV.graphOptions.graphZoomFactor.toFixed(2) + "\"^^xsd:double;\n";
                str_View += "\t\t gizmo:graphTranslation_X \"" + cV.graphOptions.graphTranslation[0].toFixed(2) + "\"^^xsd:double;\n";
                str_View += "\t\t gizmo:graphTranslation_Y \"" + cV.graphOptions.graphTranslation[1].toFixed(2) + "\"^^xsd:double.\n";
                str_View += "####################################################################\n\n";


                    // collect data?

                    // go through all properties and extract triples

                    //{nodeElement: node, subject=domain, predicate=prop, object=range }

                    var seenArray = [];


                    // for ( i=0;i<nodeElements.length;i++) {
                    //     var node=nodeElements[i];
                    //     // console.log(node.getLabelText() + " is Not Exportable? " +node.isNotExportable());
                    //     if (node.isNotExportable()===false){
                    //         specificationString+=cVPref  + ":nodeElement_"+i+" rdf:type owl:NamedIndividual;\n";
                    //
                    //         if (graph.isMultiplicationElement(node.tNode().type())){
                    //             console.log(node.getLabelText()+" << required Multiplication element handler" );
                    //             console.log(node.tNode().getAllProperties());
                    //         }
                    //     }
                    //
                    // }
                    var viewElements=aView.elementAttributes;
                    str_View += "###################### Rendering Element Values #############################\n";

                    for (var iQ=0;iQ<viewElements.length;iQ++) {
                        var item = viewElements[iQ];
                        var renderingElement="";
                        renderingElement  = cVPref + ":element_"+item.id+" rdf:type owl:NamedIndividual;\n";
                        renderingElement += "\t\t gizmo:annotationIndividual \"true\"^^xsd:boolean;\n";
                        renderingElement += "\t\t gizmo:postion_x \""+item.pos[0]+"\"^^xsd:double;\n";
                        renderingElement += "\t\t gizmo:postion_y \""+item.pos[1]+"\"^^xsd:double;\n";
                        renderingElement += "\t\t gizmo:visible \""+item.visible+"\"^^xsd:boolean .\n\n";
                        str_View+= renderingElement;
                    }

                    var elementsArray = [];
                    var i;
                    for (i = 0; i < parserdOntologyData.properties.length; i++) {
                        var prop = parserdOntologyData.properties[i];



                        var iri_domain = prop.domain().iri();
                        var iri_range = prop.range().iri();
                        var iri_property = prop.iri();

                     //   console.log(prop.iri());
                        if (prop.iri()==="http://www.w3.org/2000/01/rdf-schema#subClassOf"){
                            console.log("______________SCO");
                            console.log("____ DOMAIN "+prop.domain().iri());
                            console.log("____ RANGE "+prop.range().iri());
                            //   console.log("s:   "+ iri_domain+ " "+"p: "+ iri_property+ " o: "+ iri_range);
                        }

                        //
                        //   console.log("subject:   "+ iri_domain+ "   seen? "+seenArray.indexOf(iri_domain));
                        //   console.log("predicate: "+ iri_property+ "   seen? "+seenArray.indexOf(iri_property));
                        //   console.log("object:    "+ iri_range+ "   seen? "+seenArray.indexOf(iri_range));
                        //   console.log("s:   "+ iri_domain+ " "+"p: "+ iri_property+ " o: "+ iri_range);



                        if (seenArray.indexOf(iri_domain) === -1) seenArray.push(iri_domain);
                        if (seenArray.indexOf(iri_property) === -1) seenArray.push(iri_property);
                        if (seenArray.indexOf(iri_range) === -1) seenArray.push(iri_range);
                        var element = {};
                        element.subjectElement = iri_domain;
                        element.predicateElement = iri_property;
                        element.objectElement = iri_range;



                        //getTripleAssignment
                        var tr=triplePositionInformationMap[iri_domain+iri_property+iri_range];

                        var s_id=tr[iri_domain].id();
                        var p_id=tr[iri_property].id();
                        var o_id=tr[iri_range].id();

                        element.subjectDescription=cVPref + ":element_"+s_id;
                        element.predicateDescription=cVPref + ":element_"+p_id;
                        element.objectDescription=cVPref + ":element_"+o_id;

                        //
                        // // find the subject
                        // for (var iQ=0;iQ<viewElements.length;iQ++){
                        //     var item=viewElements[iQ];
                        //     if (item.id===s_id){
                        //         element.subjectPosition_x = item.pos[0];
                        //         element.subjectPosition_y = item.pos[1];
                        //         element.subject_visible = item.visible;
                        //     }
                        //     if (item.id===p_id){
                        //         element.predicatePosition_x = item.pos[0];
                        //         element.predicatePosition_y = item.pos[1];
                        //         element.predicate_visible = item.visible;
                        //     }
                        //
                        //     if (item.id===o_id){
                        //         element.objectPosition_x = item.pos[0];
                        //         element.objectPosition_y = item.pos[1];
                        //         element.object_visible = item.visible;
                        //     }
                        //
                        // }


                        // element.subjectPosition_x = prop.domain().renderingPrimitive().x.toFixed(2);
                        // element.subjectPosition_y = prop.domain().renderingPrimitive().y.toFixed(2);
                        // element.subject_visible = prop.domain().renderingPrimitive().visible();
                        //
                        // element.predicatePosition_x = prop.getRenderingPrimitive().getPropertyNode().x.toFixed(2);
                        // element.predicatePosition_y = prop.getRenderingPrimitive().getPropertyNode().y.toFixed(2);
                        // element.predicate_visible = prop.getRenderingPrimitive().getPropertyNode().visible();
                        //
                        // element.objectPosition_x = prop.range().renderingPrimitive().x.toFixed(2);
                        // element.objectPosition_y = prop.range().renderingPrimitive().y.toFixed(2);
                        // element.object_visible = prop.range().renderingPrimitive().visible();
                        elementsArray.push(element);
                    }
                    // collect missing single node elements;  for (i =0; i<parserdOntologyData.properties.length;i++) {
                    for (i = 0; i < parserdOntologyData.nodes.length; i++) {
                        var node = parserdOntologyData.nodes[i];
                        var iri_node = node.iri();
                        if (seenArray.indexOf(iri_node) === -1) {
                            console.log("found single Class Element " + iri_node);
                            var single_element = {};
                            single_element.targetElement = iri_node;

                            var n_id=node.id();
                            console.log(n_id)

                            for (var iN=0;iN<viewElements.length;iN++){
                                var item=viewElements[iN];
                                console.log(item.id);
                                if (item.id===n_id){
                                    console.log("Got YA");
                                    single_element.position_x = item.pos[0];
                                    single_element.position_y = item.pos[1];
                                    single_element.visible = item.visible;
                                    elementsArray.push(single_element);
                                }

                            }




                        }
                    }


                    //  console.log(elementsArray);


                    // write the elements propreties as TTL ;

                    for (i = 0; i < elementsArray.length; i++) {
                        var element_TTL_Constructor = "";
                        var el = elementsArray[i];
                        element_TTL_Constructor += "########### Triple Definition " + i + " ###########\n";
                        element_TTL_Constructor += cVPref + ":triplePositions_"+i+" rdf:type owl:NamedIndividual;\n";
                        element_TTL_Constructor += "\t\t gizmo:annotationIndividual \"true\"^^xsd:boolean ;\n";
                        for (name in el) {
                            if (el.hasOwnProperty(name)) {
                                var annoName = name;
                                var annoValue = el[name];
                                var elType = "rdfs:Literal";
                                if (dtMap[annoName]) {
                                    elType = dtMap[annoName];
                                }

                                var isIriObject = false;
                                if (annoName === "subjectElement" ||
                                    annoName === "predicateElement" ||
                                    annoName === "objectElement" ||
                                    annoName === "targetElement" ||
                                    annoName === "subjectDescription" ||
                                    annoName === "predicateDescription" ||
                                    annoName === "objectDescription"
                                ) isIriObject = true;

                                if (isIriObject === false) {
                                    element_TTL_Constructor += "\t\t gizmo:" + annoName + " \"" + annoValue + "\"^^" + elType + ";\n";
                                } else {
                                    var prefixedName = coreApi.prefixedNameForTTLExport(cVprefixList, annoValue);
                                    element_TTL_Constructor += "\t\t gizmo:" + annoName + " " + prefixedName + ";\n";
                                }
                            }
                        }
                        //  console.log(element_TTL_Constructor);
                        var u_element_TTL_Constructor = element_TTL_Constructor.slice(0, element_TTL_Constructor.length - 2);
                        u_element_TTL_Constructor += " . \n\n";
                        str_View += u_element_TTL_Constructor;
                    }


                    seenArray = [];
                    elementsArray = [];
                    return str_View;
            }




        };


        graph.getNotationPrefixList=function(index) {
            var aNotation = notationArray[index];
            if (aNotation) {
                return aNotation.header.prefixList;
            }
        };

     graph.getViewPrefixList=function(index) {
         var aView=viewArray[index];
         if (aView) {
             // create the views;
             var cV = aView;
             var cVprefixList = metaInformation.prefixList();
             console.log(cVprefixList);
             console.log("Done prefixList");
             var prefIRI = aView.viewIRI;
             if (!prefIRI.endsWith("#"))
                 prefIRI += "#";
             cVprefixList[aView.viewPrefix] = prefIRI;
             cVprefixList.gizmo = "http://visualdataweb.org/ontologies/gizmo-core#";
             return cVprefixList;
         }
    };

        graph.getNotationAsTTL=function(index, exportPrefixAndOntoDef){

        var aNotation=notationArray[index];
        if (aNotation){
                var aNpList = aNotation.header.prefixList;
                var notationIRI=aNotation.header.iri;
                var aNotationPrefix = "";

                for (var pName in aNpList) {
                    if (aNpList.hasOwnProperty(pName)) {
                        var val = aNpList[pName];
                        // todo, make more reliable
                        if (val.indexOf(notationIRI) === 0) {
                            aNotationPrefix = pName;
                            break;
                        }
                    }
                }
                // go through the annotations and create all gizmo:Inidividuals;
                var notationDescription = aNotation.gizmoAnnotations;
                //
            var dtMap=coreApi.getDatatypeAssertionMap();
                // write prefixes;

            var str_Notation="";
            if (exportPrefixAndOntoDef===true) {
                str_Notation += "######### PREFIX DEFINITIONS ###########\n";
                for (var name in aNpList) {
                    if (aNpList.hasOwnProperty(name)) {
                        str_Notation += "@prefix " + name + ": <" + aNpList[name] + "> .\n";
                    }
                }

                // add the ontology definition ;
                str_Notation += "\n######### NOTATION ONTOLOGY DEFINITION ###########\n";
                str_Notation += "<"+notationIRI+"> rdf:type owl:Ontology .\n";


            }

            for (var nD = 0; nD < notationDescription.length; nD++) {
                var dObj = notationDescription[nD];
                var targetName = dObj.annotations.targetElement;
                var notationString="";
                notationString += "########## " + targetName + " ########## \n";
                var individual = dObj.iri;
                var prefixdIndividual = "";
                if (individual.indexOf(notationIRI) !== -1) {
                    var suffix = individual.split(notationIRI)[1];
                    if (suffix.indexOf("#") === 0) {
                        suffix = suffix.slice(1);
                    }
                    prefixdIndividual = aNotationPrefix + ":" + suffix;
                }
                // parse the annotations;
                notationString += prefixdIndividual + " rdf:type owl:NamedIndividual;\n";
                var annotationConstructor = "";
                var anObj = dObj.annotations;
                for (var anno in anObj) {
                    if (anObj.hasOwnProperty(anno)) {
                        var dtType = "rdfs:Literal";
                        if (dtMap[anno]) {
                            dtType = dtMap[anno];
                        }
                        if (anno==="targetElement"){
                            annotationConstructor += '\t\tgizmo:' + anno + ' ' + anObj[anno] + ';\n';
                        }else {
                            annotationConstructor += '\t\tgizmo:' + anno + ' "' + anObj[anno] + '"^^' + dtType + ";\n"
                        }
                    }
                }
                // close statements;
                var u_annotationConstructor = annotationConstructor.slice(0, annotationConstructor.length - 2);
                u_annotationConstructor += " . \n\n";
                notationString += u_annotationConstructor;
                str_Notation+=notationString;
            }
        }

        return str_Notation;




        return "Could not find a Notation :( \n";

    };

function updatePrefixListForSpecificationExport(usedNotationsIRI,prefixList){
    for (var u=0;u<usedNotationsIRI.length;u++) {
        var currentlyExportedNotation = usedNotationsIRI[u];
        var cuNotation;
        for (var iA = 0; iA < notationArray.length; iA++) {
            var aN = notationArray[iA];
            if (aN.header && aN.header.iri) {
                var aN_iri = aN.header.iri;
                if (currentlyExportedNotation.localeCompare(aN_iri) === 0) {
                    cuNotation = aN;
                    break;
                }
            }
        }
        if (cuNotation) {
            console.log("searching for prefix of :"+currentlyExportedNotation);
            var cuNotationPrefix = "";
            var cuNpList = cuNotation.header.prefixList;
            for (var pName in cuNpList) {
                if (cuNpList.hasOwnProperty(pName)) {
                    var val = cuNpList[pName];
                    console.log(val);
                    if (currentlyExportedNotation.localeCompare(val) === 0) {
                        cuNotationPrefix = pName;
                        if (!prefixList.hasOwnProperty(pName)) {
                            prefixList[pName] = currentlyExportedNotation+"#";
                            break;
                        }
                    }

                }
            }
        }
    }
}
    graph.exportSpecification=function(prefix, iri, providedNotationsArray,importedNotationsArrayFlags){
        console.log("Exporting specification as TTL file");

        var specificationString="";

        var prefixList=metaInformation.prefixList();

        prefixList.gizmo="http://visualdataweb.org/ontologies/gizmo-core#";
        prefixList[prefix]=iri+"#";
        var usedNotations=[];
        // usedNotations.push(currentlyUsedNotation);
        var importedNotations=[];
        var i;
        for (i=0;i<providedNotationsArray.length;i++){
            if (importedNotationsArrayFlags[i]===true){
                importedNotations.push(providedNotationsArray[i])
            }
        }
        console.log("---------------------------------------");
        console.log(importedNotations);

        updatePrefixListForSpecificationExport(providedNotationsArray,prefixList);


        // update the view prefixLIst
        for (i=0;i<viewArray.length;i++){
            prefixList[viewArray[i].viewPrefix]=viewArray[i].viewIRI+"#";
        }

        var dtMap=coreApi.getDatatypeAssertionMap();
        // write down the prefix list;

        specificationString+="######### PREFIX DEFINITIONS ###########\n";
        for (var name in prefixList){
            if (prefixList.hasOwnProperty(name)){
                specificationString+="@prefix "+name+": <"+prefixList[name]+"> .\n";
            }
        }

        specificationString+="\n<"+iri+"> rdf:type owl:Ontology;\n";
        for (var iN=0;iN<importedNotations.length;iN++){
            specificationString+="\t\towl:imports <"+importedNotations[iN]+">;\n";
        }
        specificationString=specificationString.slice(0, specificationString.length - 2);
        specificationString+=" .\n\n";



        var u;
        specificationString+="############ Specification Definition Individual ###########\n";
        var specificationPrefix=prefix;

        var specDefString= specificationPrefix + ":specificationDefinition rdf:type owl:NamedIndividual;\n";
        for (u=0;u<providedNotationsArray.length;u++) {
            specDefString+= "\t\t gizmo:providesNotation <"+providedNotationsArray[u]+ ">;\n";
        }
        for (u=0;u<viewArray.length;u++) {
            specDefString+= "\t\t gizmo:providesView <"+viewArray[u].viewIRI+ ">;\n";
        }
        // close specDefString;
        var u_specDefString = specDefString.slice(0, specDefString.length - 2);
        u_specDefString += " . \n\n";
        specificationString += u_specDefString;






        specificationString+="######### Notation Array                   ###########\n";
        specificationString+="######### Number of provided Notations : "+providedNotationsArray.length+" ###########\n";
        var expImpNotation=0;

        for (u=0;u<providedNotationsArray.length;u++) {
            var currentlyExportedNotation=providedNotationsArray[u];

            if (importedNotations.indexOf(currentlyExportedNotation)!==-1){
                continue;
            }
            expImpNotation++;
            specificationString += "#Explicitly Imported Notation " + expImpNotation + ": <" + currentlyExportedNotation + "> ###########\n";
            specificationString += "#############################################################################\n";
            var cuNotatio;

            // check if notation is imported by specification;



            for (var iA = 0; iA < notationArray.length; iA++) {
                var aN = notationArray[iA];
                if (aN.header && aN.header.iri) {
                    var aN_iri = aN.header.iri;
                    if (currentlyExportedNotation.localeCompare(aN_iri) === 0) {
                        cuNotatio = aN;
                        break;
                    }
                }
            }
            if (cuNotatio) {
                var cuNotationPrefix = "";
                var cuNpList = cuNotatio.header.prefixList;
                for (var pName in cuNpList) {
                    if (cuNpList.hasOwnProperty(pName)) {
                        var val = cuNpList[pName];
                        if (currentlyExportedNotation.localeCompare(val) === 0) {
                            cuNotationPrefix = pName;
                            break;
                        }
                    }
                }
                // go through the annotations and create all gizmo:Inidividuals;
                var notationDesription = cuNotatio.gizmoAnnotations;
                //
                for (var nD = 0; nD < notationDesription.length; nD++) {
                    var dObj = notationDesription[nD];
                    var targetName = dObj.annotations.targetElement;
                    specificationString += "########## " + targetName + " ########## \n";
                    var individual = dObj.iri;
                    var prefixdIndividual = "";
                    if (individual.indexOf(currentlyExportedNotation) !== -1) {
                        var suffix = individual.split(currentlyExportedNotation)[1];
                        if (suffix.indexOf("#") === 0) {
                            suffix = suffix.slice(1);
                        }
                        prefixdIndividual = cuNotationPrefix + ":" + suffix;
                    }
                    // parse the annotations;
                    specificationString += prefixdIndividual + " rdf:type owl:NamedIndividual;\n";
                    var annotationConstructor = "";
                    var anObj = dObj.annotations;
                    for (var anno in anObj) {
                        if (anObj.hasOwnProperty(anno)) {
                            var dtType = "rdfs:Literal";
                            if (dtMap[anno]) {
                                dtType = dtMap[anno];
                            }
                            if (anno==="targetElement"){
                                annotationConstructor += '\t\tgizmo:' + anno + ' ' + anObj[anno] + ';\n';
                            }else {
                                annotationConstructor += '\t\tgizmo:' + anno + ' "' + anObj[anno] + '"^^' + dtType + ";\n"
                            }
                        }
                    }
                    // close statements;
                    var u_annotationConstructor = annotationConstructor.slice(0, annotationConstructor.length - 2);
                    u_annotationConstructor += " . \n\n";
                    specificationString += u_annotationConstructor;
                }
            }
        }


        // create the views;
        for (var v=0;v<viewArray.length;v++) {
            var cV = viewArray[v];

            specificationString += "\n\n########### View " + (v + 1) + " ############\n\n";
            // store graph options;
            console.log(cV.graphOptions);
            var cVPref = cV.viewPrefix;
            specificationString += "########### Graph Options of View " + (v + 1) + " ############\n\n";
            specificationString += cVPref + ":viewDefinitions rdf:type owl:NamedIndividual;\n";

            if (cV.viewNotation && providedNotationsArray.indexOf(cV.viewNotation)!==-1){
                specificationString += "\t\t gizmo:viewUsesNotation <" +  cV.viewNotation+">;\n";
            }

            specificationString += "\t\t gizmo:forceLayoutActive \"" + cV.graphOptions.forceActive + "\"^^xsd:boolean;\n";
            specificationString += "\t\t gizmo:graphZoomFactor \"" + cV.graphOptions.graphZoomFactor.toFixed(2) + "\"^^xsd:double;\n";
            specificationString += "\t\t gizmo:graphTranslation_X \"" + cV.graphOptions.graphTranslation[0].toFixed(2) + "\"^^xsd:double;\n";
            specificationString += "\t\t gizmo:graphTranslation_Y \"" + cV.graphOptions.graphTranslation[1].toFixed(2) + "\"^^xsd:double.\n";
            specificationString += "####################################################################\n\n";

            // main ontology element assertion
            specificationString += "###################### Main Ontology Elements#############################\n";


            // collect data?

            // go through all properties and extract triples

            //{nodeElement: node, subject=domain, predicate=prop, object=range }

            var seenArray = [];


            // for ( i=0;i<nodeElements.length;i++) {
            //     var node=nodeElements[i];
            //     // console.log(node.getLabelText() + " is Not Exportable? " +node.isNotExportable());
            //     if (node.isNotExportable()===false){
            //         specificationString+=cVPref  + ":nodeElement_"+i+" rdf:type owl:NamedIndividual;\n";
            //
            //         if (graph.isMultiplicationElement(node.tNode().type())){
            //             console.log(node.getLabelText()+" << required Multiplication element handler" );
            //             console.log(node.tNode().getAllProperties());
            //         }
            //     }
            //
            // }

            var elementsArray = [];

            for (i = 0; i < parserdOntologyData.properties.length; i++) {
                var prop = parserdOntologyData.properties[i];
                console.log(prop.iri());

                var iri_domain = prop.domain().iri();
                var iri_range = prop.range().iri();
                var iri_property = prop.iri();


                //
                //  console.log("subject:   "+ iri_domain+ "   seen? "+seenArray.indexOf(iri_domain));
                //  console.log("predicate: "+ iri_property+ "   seen? "+seenArray.indexOf(iri_property));
                //  console.log("object:    "+ iri_range+ "   seen? "+seenArray.indexOf(iri_range));
                // //


                if (seenArray.indexOf(iri_domain) === -1) seenArray.push(iri_domain);
                if (seenArray.indexOf(iri_property) === -1) seenArray.push(iri_property);
                if (seenArray.indexOf(iri_range) === -1) seenArray.push(iri_range);
                var element = {};
                element.subjectElement = iri_domain;
                element.predicateElement = iri_property;
                element.objectElement = iri_range;

                element.subjectPosition_x = prop.domain().renderingPrimitive().x.toFixed(2);
                element.subjectPosition_y = prop.domain().renderingPrimitive().y.toFixed(2);
                element.subject_visible = prop.domain().renderingPrimitive().visible();

                element.predicatePosition_x = prop.getRenderingPrimitive().getPropertyNode().x.toFixed(2);
                element.predicatePosition_y = prop.getRenderingPrimitive().getPropertyNode().y.toFixed(2);
                element.predicate_visible = prop.getRenderingPrimitive().getPropertyNode().visible();

                element.objectPosition_x = prop.range().renderingPrimitive().x.toFixed(2);
                element.objectPosition_y = prop.range().renderingPrimitive().y.toFixed(2);
                element.object_visible = prop.range().renderingPrimitive().visible();
                elementsArray.push(element);
            }
            // collect missing single node elements;  for (i =0; i<parserdOntologyData.properties.length;i++) {
            for (i = 0; i < parserdOntologyData.nodes.length; i++) {
                var node = parserdOntologyData.nodes[i];
                var iri_node = node.iri();
                if (seenArray.indexOf(iri_node) === -1) {
                    console.log("found single Class Element " + iri_node);
                    var single_element = {};
                    single_element.targetElement = iri_node;
                    single_element.targetPosition_x = node.renderingPrimitive().x.toFixed(2);
                    single_element.targetPosition_y = node.renderingPrimitive().y.toFixed(2);
                    single_element.target_visible = node.renderingPrimitive().visible();
                    elementsArray.push(single_element);
                }
            }


          //  console.log(elementsArray);


            // write the elements propreties as TTL ;

            for (i = 0; i < elementsArray.length; i++) {
                var element_TTL_Constructor = "";
                var el = elementsArray[i];
                element_TTL_Constructor += "########### Triple Definition " + i + " ###########\n";
                element_TTL_Constructor += cVPref + ":triplePositions_"+i+" rdf:type owl:NamedIndividual;\n";
                for (name in el) {
                    if (el.hasOwnProperty(name)) {
                        var annoName = name;
                        var annoValue = el[name];
                        var elType = "rdfs:Literal";
                        if (dtMap[annoName]) {
                            elType = dtMap[annoName];
                        }

                        var isIriObject = false;
                        if (annoName === "subjectElement" ||
                            annoName === "predicateElement" ||
                            annoName === "objectElement" ||
                            annoName === "targetElement"
                        ) isIriObject = true;

                        if (isIriObject === false) {
                            element_TTL_Constructor += "\t\t gizmo:" + annoName + " \"" + annoValue + "\"^^" + elType + ";\n";
                        } else {
                            var prefixedName = coreApi.prefixedNameForTTLExport(prefixList, annoValue);
                            element_TTL_Constructor += "\t\t gizmo:" + annoName + " " + prefixedName + ";\n";
                        }
                    }
                }
              //  console.log(element_TTL_Constructor);
                var u_element_TTL_Constructor = element_TTL_Constructor.slice(0, element_TTL_Constructor.length - 2);
                u_element_TTL_Constructor += " . \n\n";
                specificationString += u_element_TTL_Constructor;
            }


            seenArray = [];
            elementsArray = [];

        }
        debugTextInput.classed("hidden", false);
        debugTextInput.node().value = specificationString;
    };

    graph.isMultiplicationElement=function(str){
        var MLArray=["owl:Thing","rdfs:Literal","rdfs:subClassOf"];
        return  (MLArray.indexOf(str)!==-1);
    };

    graph.currentlyUsedNotation=function(iri){

        if (!arguments.length) {
            return  currentlyUsedNotation;
        } else {
            currentlyUsedNotation=iri;
        }

    };

    graph.currentlyUsedNotationObject=function(){
        // find iri in notationsArray and return object

        for (var i=0;i<notationArray.length;i++){
            if(notationArray[i].header.iri.localeCompare(currentlyUsedNotation)===0){
                return notationArray[i];
            }
        }

    };


    graph.getNotationArray=function(){
        return notationArray;
    };


    graph.getOntologyPrefixFromPrefixList_and_iri=function(prefList,iri){
            for (var pName in prefList) {
                if (prefList.hasOwnProperty(pName)) {
                    var val = prefList[pName];
// TODO : make this more reliabale
                    if (val.indexOf(iri) === 0) {
                        return pName;
                    }
                }
            }
    };


    graph.getMainOntology_AsTTL= function(exportPrefixDef_andOntologyDec){
        var str_MainOntology="";

        var prefixList=metaInformation.prefixList();

        if (exportPrefixDef_andOntologyDec===true) {
            str_MainOntology += "######### PREFIX DEFINITIONS ###########\n";
            for (var name in prefixList) {
                if (prefixList.hasOwnProperty(name)) {
                    str_MainOntology += "@prefix " + name + ": <" + prefixList[name] + "> .\n";
                }
            }


            str_MainOntology += "\n######### MAIN ONTOLOGY ###########\n";
            str_MainOntology += "<" + metaInformation.iri() + "> rdf:type owl:Ontology .\n";

            // TODO: add further meta information here ;


            // extract classes and properties;
        }
        else{
            str_MainOntology += "\n######### MAIN ONTOLOGY ELEMENTS ###########\n";
        }

        str_MainOntology+=getNodes_asTTL();
        str_MainOntology+=getProperties_asTTL();
        str_MainOntology+=getAxioms_asTTL();

        return str_MainOntology;


    };


    function getNodes_asTTL(){
        var classesAsTTL="";
        classesAsTTL+="\n##### CLASSES ####\n";

        var nodes=parserdOntologyData.nodes;

        console.log(nodes);

        var prefixList=metaInformation.prefixList();
        var ontoIRI=metaInformation.iri();


        for (var i=0;i<nodes.length;i++){
            var n=nodes[i];
            if (n.type()==="owl:Thing" || n.type()==="rdfs:Literal" || n.type()==="rdfs:Datatype"){
                continue; // ignoring these , a) multiple assertions b) not needed;
            }

            // extract the definition name;
            var n_iri=n.iri();
       //     console.log(n);
            var n_label=n.getLabelForCurrentLang();

            var n_base=n.baseIri();


            var foundPrefixVersion=false;
            // find the prefixVersion of n.iri();
            var n_name=n_iri.split("#")[1];
            var n_pr=n_iri.split("#")[0];

            var foundPrefix=graph.getOntologyPrefixFromPrefixList_and_iri(prefixList,n_pr);
            // console.log(n_label);
            // console.log("n_name "+n_name);
            // console.log("n_pr "+n_pr);
            // console.log("n_iri "+n_iri);
            // console.log("foundPrefix "+foundPrefix);
            // map n
            if (foundPrefix!==undefined) foundPrefixVersion=true;


            var classIri;
            if (foundPrefixVersion===true){
                classIri=foundPrefix+":"+n_name;
            }else{
                classIri="<"+n_iri+">";
            }

            // write defString;
            var classDefStr="";
            classDefStr+=classIri+ " rdf:type "+ n.type()+ ";\n";
            if (n_label){
                classDefStr+="\t\t rdfs:label \""+n_label+ "\"@en;\n";
            }
            var u_classDefStr=classDefStr.substring(0,classDefStr.length-2);
            classesAsTTL+=u_classDefStr+" .\n\n";

        }


        return classesAsTTL;
    }


    function caseSensitiveMap(input){

        var caseMap={};

        caseMap["owl:datatypeproperty"]="owl:DatatypeProperty";
        caseMap["owl:objectproperty"]="owl:ObjectProperty";
        caseMap["rdfs:subclassof"]="owl:subClassOf";


        return caseMap[input.toLowerCase()];


    }

    function getProperties_asTTL(){
        var propertiesAsTTL="";
        propertiesAsTTL+="\n##### PROPERTIES ####\n";

        var properties=parserdOntologyData.properties;

        // console.log(properties);

        var prefixList=metaInformation.prefixList();
        var ontoIRI=metaInformation.iri();


        for (var i=0;i<properties.length;i++){
            var prop=properties[i];

            if (prop.type().toLowerCase()==="rdfs:SubClassOf".toLowerCase() ){
                continue; // ignoring these , a) multiple assertions b) not needed;
            }

            // extract the definition name;
            var prop_iri=prop.iri();
            var prop_label=prop.getLabelForCurrentLang();
            var prop_base=prop.baseIri();


            var foundPrefixVersion=false;
            // find the prefixVersion of n.iri();
            var prop_name=prop_iri.split("#")[1];
            var prop_pr=prop_iri.split("#")[0];

            var foundPrefix=graph.getOntologyPrefixFromPrefixList_and_iri(prefixList,prop_pr);


            // map n
            if (foundPrefix!==undefined) foundPrefixVersion=true;


            var propIri="";
            if (foundPrefixVersion===true){
                propIri=foundPrefix+":"+prop_name;
            }
            else{
                propIri="<"+prop_iri+">";
            }


            // write defString;
            var propDefStr="";
            propDefStr+=propIri+ " rdf:type "+ caseSensitiveMap(prop.type())+ " ;\n";
            if (prop_label){
                propDefStr+="\t\t rdfs:label \""+prop_label+ "\"@en ;\n";
            }

            if (prop.domain() && prop.domain().type()!=="owl:Thing" ) {
                var domain=prop.domain();
                // get domain prefixVersion;
                var domain_iri=domain.iri();
                var domain_base=domain.baseIri();

                var domain_foundPrefixVersion=false;
                // find the prefixVersion of n.iri();
                var domain_name=domain_iri.split("#")[1];
                var domain_pr=domain_iri.split("#")[0];
                var domain_foundPrefix=graph.getOntologyPrefixFromPrefixList_and_iri(prefixList,domain_pr);
                if (domain_foundPrefix!==undefined){
                    domain_foundPrefixVersion=true;
                }

                var domainTargetString=domain_iri;
                if (domain_foundPrefixVersion===true){
                    domainTargetString=domain_foundPrefix+":"+domain_name;
                }
                else{
                    domainTargetString="<"+domainTargetString+">"
                }
                propDefStr+="\t\t rdfs:domain "+domainTargetString+ ";\n";
            }
            if (prop.range() &&  prop.range().type()!=="owl:Thing"){
                var range=prop.range();
                // get domain prefixVersion;
                var range_iri=range.iri();
                var range_base=range.baseIri();

                var range_foundPrefixVersion=false;
                // find the prefixVersion of n.iri();
                var range_name=range_iri.split("#")[1];
                var range_pr=range_iri.split("#")[0];

                var range_foundPrefix=graph.getOntologyPrefixFromPrefixList_and_iri(prefixList,range_pr);
                if (range_foundPrefix!==undefined) range_foundPrefixVersion=true;

                var rangeTargetString=range_iri;
                if (range_foundPrefixVersion===true){
                    rangeTargetString=range_foundPrefix+":"+range_name;
                }
                else{
                    rangeTargetString="<"+rangeTargetString+">"
                }
                propDefStr+="\t\t rdfs:range "+rangeTargetString+ ";\n";

            }


            var u_propDefStr=propDefStr.substring(0,propDefStr.length-2);
            propertiesAsTTL+=u_propDefStr+" .\n\n";

        }


        return propertiesAsTTL;
    }


    function getAxioms_asTTL(){
        var axiomsAsTTL="";
        axiomsAsTTL+="\n##### AXIOMS ####\n";

        var properties=parserdOntologyData.properties;
        var prefixList=metaInformation.prefixList();

        for (var i=0;i<properties.length;i++){
            var prop=properties[i];
            if (prop.type().toLowerCase()!=="rdfs:SubClassOf".toLowerCase() ){
                continue;
            }
            // write defString;
            var axiomDefStr="";
            var domainTargetString="";
            if (prop.domain() ) {
                var domain=prop.domain();
                // get domain prefixVersion;
                var domain_iri=domain.iri();
                var domain_foundPrefixVersion=false;
                // find the prefixVersion of n.iri();
                var domain_name=domain_iri.split("#")[1];
                var domain_pr=domain_iri.split("#")[0];

                var domain_foundPrefix=graph.getOntologyPrefixFromPrefixList_and_iri(prefixList,domain_pr);
                if (domain_foundPrefix!==undefined) domain_foundPrefixVersion=true;

                domainTargetString=domain_iri;
                if (domain_foundPrefixVersion===true){
                    domainTargetString=domain_foundPrefix+":"+domain_name;
                }
                else{
                    domainTargetString="<"+domainTargetString+">"
                }

            }
            var rangeTargetString="";
            if (prop.range()){
                var range=prop.range();
                var range_iri=range.iri();
                var range_foundPrefixVersion=false;
                var range_name=range_iri.split("#")[1];
                var range_pr=range_iri.split("#")[0];
                var range_foundPrefix=graph.getOntologyPrefixFromPrefixList_and_iri(prefixList,range_pr);
                if (range_foundPrefix!==undefined) range_foundPrefixVersion=true;
                if (range_foundPrefixVersion===true){
                    rangeTargetString=range_foundPrefix+":"+range_name;
                }
                else{
                    rangeTargetString="<"+range_iri+">"
                }
            }

            axiomDefStr=domainTargetString+" rdfs:subClassOf "+rangeTargetString +" .";

            axiomsAsTTL+=axiomDefStr+"\n\n";

        }


        return axiomsAsTTL;
    }


    graph.getOntologyPrefixFromPrefixList=function(annotationObj){
        if (annotationObj.header && annotationObj.header.iri){

            var ontoIri=annotationObj.header.iri;
            // search for its prefix;
            var cuNpList = annotationObj.header.prefixList;
            for (var pName in cuNpList) {
                if (cuNpList.hasOwnProperty(pName)) {
                    var val = cuNpList[pName];
                    if (val.indexOf(ontoIri)===0) {
                        return pName;
                    }
                }
            }
        }

    };

    graph.clearProvidedNotation=function(){
        notationArray=[];
    };
    graph.clearProvidedViews=function(){
        viewArray=[];
    };

    graph.addNotation=function(notationAsJSONOBJ, addSelectionInMenu){

        // extract iri of notationOBJ
        if (notationAsJSONOBJ.header) {
            var givenNotationIRI = notationAsJSONOBJ.header.iri;
            graph.currentlyUsedNotation(givenNotationIRI);
            if (addSelectionInMenu){
                wapi.addNotationToProvidedMenu(givenNotationIRI);
            }

            // console.log("givenNotationIRI " + givenNotationIRI);
            for (var i = 0; i < notationArray.length; i++) {
                var cmpIRI = notationArray[i].header.iri;
                // console.log("cmpIRI  " + cmpIRI);
                if (givenNotationIRI.localeCompare(cmpIRI) === 0){
                    // console.log("already seen this notation");
                    return;
                }
            }

            notationArray.push(notationAsJSONOBJ);
        }



    };


    graph.appendViewAsJsonObject=function(){
        // create json viewObject;

        //1]
        // ** OLD **
        var viewString=graph.getJSONRepresentationForView();
        var gizmoDescription=graph.coreApi().getLoadedGizmoFileName();
        var viewDefinitionObject={};
        viewDefinitionObject.graphOptions=graph.getGraphOptionsForView();
        viewDefinitionObject.gizmoConfig=gizmoDescription;
        viewDefinitionObject.elementAttributes=viewString;

        console.log(viewDefinitionObject);
        viewArray.push(viewDefinitionObject);
        console.log("Succesfully added View");
        if (graph.viewListFunc) {graph.viewListFunc();}

    };

    graph.getViews=function(){
        return viewArray;
    };

    graph.getCurrentViewIndex=function(){
        return currentSelectedView;
    };

    graph.getAllViewDefinitions=function(){
        // detects the viewarray and returns the string holding the information;

        if (viewArray.length===0){
            return "";
        }
        console.log("requiesting all View Defs "+ viewArray.length);
        var viewDefString='"viewDefinitions": [ \n';

        var numOfViews=viewArray.length;
        var i;
        for (i=0;i<numOfViews;i++) {
            viewDefString += JSON.stringify(viewArray[i],null," ") + "\n,";

        }
        //
        viewDefString=viewDefString.substring(0,viewDefString.length-2);
        viewDefString+='\n],\n';
        return viewDefString;
    };

    return graph;
};