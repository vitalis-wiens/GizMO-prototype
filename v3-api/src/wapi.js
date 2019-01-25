module.exports = (function () {

    var WebVOWL_API = function () {

        // definitions of the elements;
        var nodes=["defaultNodeElement",
            // "ExternalClass",
            "owl:Thing",
            "owl:Class",
            // "owl:complementOf",
            // "owl:DeprecatedClass",
            // "owl:disjointUnionOf",
            "owl:equivalentClass",
            // "owl:intersectionOf",
            // "owl:Nothing",
            // "owl:unionOf",
            // "rdfs:Class",
            "rdfs:Resource"
        ];
        var properties=["defaultPropertyElement",
            // "owl:allValuesFrom",
            "owl:DatatypeProperty",
            // "owl:DeprecatedProperty",
            // "owl:disjointWith",
            // "owl:equivalentProperty",
            // "owl:FunctionalProperty",
            // "owl:InverseFunctionalProperty",
            "owl:ObjectProperty",
            // "owl:someValuesFrom",
            // "owl:SymmetricProperty",
            // "owl:TransitiveProperty",
            // "rdf:Property",
            "rdfs:subClassOf",
            "setOperatorProperty"
        ];
        var datatypes=["defaultDatatypeElement","rdfs:Datatype","rdfs:Literal"];
        var map_nodes=[];
        var map_properties=[];
        var map_datatypes=[];
        var dialogBox;

        var loadedGizmoConfig="";
        var loadedFileName="";
        var hiddenExporterButton;
        var renderingElementMap={};
        var multiLinkrenderingElementMap=[];


        function createHiddenButton(){
            hiddenExporterButton=canvasAreaNode.append("a");
            hiddenExporterButton.node().innerHTML="hiddenExporter";
            hiddenExporterButton.style("position", "absolute");
            hiddenExporterButton.style("top", "70");
            hiddenExporterButton.style("left", "10px");
            hiddenExporterButton.style("display","none");

        }


        function createmappings() {
            var i,nameInConfig;

            for ( i=0;i<nodes.length;i++){
                nameInConfig=nodes[i];
                if (nameInConfig.indexOf(":")!==-1){
                    nameInConfig=nameInConfig.replace(":","");
                }
                map_nodes.push(nameInConfig);
            }
            for ( i=0;i<properties.length;i++){
                nameInConfig=properties[i];
                if (nameInConfig.indexOf(":")!==-1){
                    nameInConfig=nameInConfig.replace(":","");
                }
                map_properties.push(nameInConfig);
            }
            for ( i=0;i<datatypes.length;i++){
                nameInConfig=datatypes[i];
                if (nameInConfig.indexOf(":")!==-1){
                    nameInConfig=nameInConfig.replace(":","");
                }
                map_datatypes.push(nameInConfig);
            }
        }
        createmappings();
        var that=this;
        that.widget_type="wapi_centralWidget";
        that.debugger=require("./debug")();

        that.baseNodeConstructor         = require("./elements/nodes/baseNode");
        that.baseLinkConstructor         = require("./elements/properties/baseLink");
        that.domainNodeRangeConstructor  = require("./elements/properties/dNrLink");
        that.singleLinkConstructor       = require("./elements/properties/singlePropertyLink");
        that.multiLinkConstructor        = require("./elements/properties/multiPropertyLink");
        that.multiLinkHandlerConstructor = require("./elements/properties/multiLinkHandler");
        that.loopLinkConstructor         = require("./elements/properties/loopPropertyLink");

        that.dialogBoxConstrucor        = require("./dialogBox/dialogBox");

        that.zipModule= require("jszip");
        that.FileSaver = require('file-saver');

        var drawTools                   = require("./elements/drawTools")();

        that.ontologyLoader=require("./ontologyLoader/genericLoader");
        that.ontologyLoader.setAPIcore(that);
        that.parser=require("./ontologyLoader/parser");
        var canvasId="";

        var canasWidth,canvasHeight;

        this.getDrawTools=function(){
            return drawTools;
        };

        this.getSize=function(){
            var w=canasWidth.split("px")[0];
            var h=canvasHeight.split("px")[0];
            return [parseInt(w),parseInt(h)];
        };

        that.widgetType=function () {
            return that.widget_type;
        };

        that.log=function(lvl,msg){
            that.debugger.log(lvl,msg);
        };
        that.getCanvasAreaNode=function(){
            return canvasAreaNode;
        };
        that.getCanvasSvgRoot=function(){
            return svgGraphRoot;
        };
        that.getCanvasGraphRoot=function(){
            return graphRootGroup;
        };


        that.config=require("./config/configuration")(that);
        that.graph=require("./graph")(that);
        that.graph.coreApi(that);


        that.graphBGColor=function(val){

            if (!arguments.length){
                return that.config.canvas.bgColor();
            }
            else{

                that.setCanvasBgColor(val);
            }

        };
// some helper
        var elementsConfigContent=[]; // because javascript always uses the value , but i want the object here

        var canvasAreaNode,
            elementsConfigFileName,
            svgGraphRoot,
            graphRootGroup;


            var debugElement;
// set the debug level;



        that.initialize=function(canvasAreaID,_continueCallBack){
            canvasId=canvasAreaID;
        //    that.log(100,"Hello WAPI");
          //  that.log(100,"recieved Id for CanvasArea "+ canvasAreaID);
            canvasAreaNode=d3.select("#"+canvasAreaID);
            creataCanvasArea(canvasAreaNode);
            createHiddenButton();
            // createDummyNodes();
            // read elements;


            elementsConfigFileName="elements.cfg.json";
            loadConfigJSON(elementsConfigContent,elementsConfigFileName,initializeAfterConfigLoad,_continueCallBack);

        };

        function initializeAfterConfigLoad(_continueCallBack){
            // testing removal of layers;

            // process the loaded configs


            var elJSON=JSON.parse(elementsConfigContent);
            that.elementsConfig=elJSON;
            // kill that object
             elementsConfigContent=[];
            if (_continueCallBack) {
                _continueCallBack();
            }

             that.graph.initializeRendering();
            // // console.log("Rendering initialized"+that.getCanvasAreaNode());
            // that.graph.createDummyNode();
            // that.graph.drawElements();
            // that.graph.createFroceDirectedLayout();

        }

        that.updateCanvasAreaSize=function(width,height){
            if (!arguments.length) {
                var bb = canvasAreaNode.node().getBoundingClientRect();
                canvasAreaNode.style("width",bb.width);
                canvasAreaNode.style("height",bb.height);
                svgGraphRoot.attr("width", bb.width)
                    .attr("height", bb.height);
            }
            else{
                // console.log(typeof width);
                var setWidth=width;
                var setHeight=height;
                if (typeof width === "number" ){
                    setWidth=width+"px";
                }
                if (typeof height === "number" ){
                    setHeight=height+"px";
                }

                canvasAreaNode.style("width",setWidth);
                canvasAreaNode.style("height",setHeight);

                svgGraphRoot.attr("width", setWidth)
                    .attr("height", setHeight);

                canasWidth=svgGraphRoot.attr("width");
                canvasHeight=svgGraphRoot.attr("height");
            }
        };
        that.updateCanvasAreaSize=function(width,height,o_width,o_height){
            if (!arguments.length) {
                var bb = canvasAreaNode.node().getBoundingClientRect();
                canvasAreaNode.style("width",bb.width);
                canvasAreaNode.style("height",bb.height);
                svgGraphRoot.attr("width", bb.width)
                    .attr("height", bb.height);
            }
            else{
                var setWidth=width;
                var setHeight=height;
                if (typeof width === "number" && typeof o_width === "number" ){
                    setWidth=width+o_width+"px";
                }
                if (typeof height === "number" && typeof o_height=== "number" ){
                    setHeight=height+o_height+"px";
                }
                // compute width of parent;
                var pNode=canvasAreaNode.node().parentNode;
                if (width.indexOf("%")!==-1){

                    var pWidth= width.split("%")[0]/100;
                    if (pNode.nodeName==="MAIN"){
                        if (o_width.indexOf("%")!==-1) {
                            var poWidth= o_width.split("%")[0]/100;
                            setWidth = window.innerWidth*pWidth + (window.innerWidth * poWidth);
                        }else{
                            setWidth = window.innerWidth*pWidth + parseInt(o_width.split("px")[0]);
                        }
                    }
                }

                if (height.indexOf("%")!==-1){
                    var pHeight= height.split("%")[0]/100;
                    if (pNode.nodeName==="MAIN"){
                        if (o_height.indexOf("%")!==-1) {
                            var poHeight= o_height.split("%")[0]/100;
                            setHeight = window.innerHeight*pWidth + (window.innerHeight * poHeight);
                        }else{
                            setHeight= window.innerHeight*pHeight + parseInt(o_height.split("px")[0]);
                        }
                    }
                }
                if (typeof setWidth === "number"){
                        setWidth+="px"
                }

                if (typeof setHeight === "number"){
                        setHeight+="px"
                }
                canvasAreaNode.style("width",setWidth);
                canvasAreaNode.style("height",setHeight);

                svgGraphRoot.attr("width", setWidth)
                            .attr("height", setHeight);
            }
            canasWidth=svgGraphRoot.attr("width");
            canvasHeight=svgGraphRoot.attr("height");

        };

// some getter and setter functions;
        that.setCanvasBgColor=function(val){
            that.config.canvas.bgColor(val);
            canvasAreaNode.style("background-color",that.config.canvas.bgColor());
        };


        function creataCanvasArea(d3AreaNode){

            // initialize the size of that thing;

            var canvas=that.config.canvas;

            d3AreaNode.style("width",canvas.width());
            d3AreaNode.style("height",canvas.height());
            d3AreaNode.style("background-color",canvas.bgColor());

            svgGraphRoot=d3AreaNode.append("svg");
            // give it a proper identifier;
            svgGraphRoot.node().id="canvasSVG";

            graphRootGroup=svgGraphRoot.append('g');
            graphRootGroup.node().id="graphRootGroup";


            // add layers;
            var layerArray=canvas.getLayers();
            for (var i=0;i<layerArray.length;i++){
                var layer=graphRootGroup.append('g');
                layer.node().id=canvasId+layerArray[i];
            }
            that.updateCanvasAreaSize();

        }


        that.getCanvasId=function(){
            return canvasId;
        };

//
// // testFunction
//         function createDummyNodes(){
//
//             // initialize the classLayer;
//             that.config.owlClass.renderingLayer(d3.select("#nodes"));
//
//             that.log(100,"Trying to create a class");
//             var dummyNode=new that.classConstructor(that);
//
//             console.log(dummyNode);
//
//             dummyNode.draw();
//
//         }


        function loadConfigJSON(result, fileName,callBackFunction,_continueCallBack){
            loadedGizmoConfig="defaultGizmoConfig.json";
            d3.xhr(fileName, "application/json", function (error, request) {
                if (error !== null && error.status === 500) {
                    console.log(error);
                    console.log("HAS AN ERROR AND A STATUS WHILE LOADING " + fileName);
                    return;
                }
                loadedFileName=fileName;
                result.push(request.responseText); // FORCING javascript call by reference
                if (callBackFunction) { callBackFunction(_continueCallBack); }
            });
        }

        that.getLoadedGizmoFileName=function(){
            return loadedGizmoConfig;
        };

        that.showFpsAndElementStatistic=function(val){
            //console.log("requesting Fps and Node statistics"+ val);

            if (val && debugElement===undefined){
                // add a div for rendering ;
                debugElement=canvasAreaNode.append("div");
                debugElement.style("position","absolute");
                debugElement.style("top","10px");
                debugElement.style("left","10px");
                debugElement.node().innerHTML="Hello Debuger!";
                that.graph.setDebugContainer(debugElement);
                that.graph.showFPSAndElementStatistic(true);
            }


            // add a div for rendering ;
            var text_debugElement=canvasAreaNode.append("div");
            text_debugElement.style("position","absolute");
            text_debugElement.style("top","100px");
            text_debugElement.style("left","0px");

            var tI=text_debugElement.append("textarea");
            tI.node().rows="4";
            tI.node().cols="50";
            tI.classed("hidden",true);
            that.graph.setDebugTextInput(tI);






        };

        that.addMLRenderingElementToMap=function(element){
            multiLinkrenderingElementMap.push(element);
            console.log("added Element")
        };
        that.getMLRenderingMap=function(){
            return multiLinkrenderingElementMap;
        };

        that.updateMLRenderingPositions=function(){
          for (var i=0;i<multiLinkrenderingElementMap.length;i++){
              multiLinkrenderingElementMap[i].interpolateML_Position();
          }

        };

        that.addRenderingElementToIdMap=function(element,ID){
           renderingElementMap[ID]=element;
        };

        that.getRenderingElementForId=function(id){
            return renderingElementMap[id];
        };


        // ontology loading tgests;
        that.testOntologyLoader=function(){
           // console.log("This is V3-Api Test for loader");
            that.ontologyLoader.helloLoader();
        };


        function parseJsonContent(fileName, responseText){
                // console.log("Loaded " + fileName);
                // console.log("responseText " + responseText);
                // // try {
                // clear the view info
                // console.log("loading "+ fileName);
                loadedFileName=fileName;
                var jsonObj = JSON.parse(responseText);
              //  console.log(jsonObj);
                var datastructure=that.parser.parseOWL2VOWL(jsonObj);


                that.graph.setMetaInformation(datastructure.ontologyInformation);
                that.graph.setViewInformation(datastructure.viewerInformation);
                that.graph.setParseOntologyData(datastructure);
                // create node rendering primitivesl
                var nodes=datastructure.nodes;
                var props=datastructure.properties;

                var i;
                for (i=0;i<nodes.length;i++){
                    that.graph.createNodeFromtNode(nodes[i]);
                }
                for (i=0;i<props.length;i++){
                    that.graph.createPropertyFromtProperty(props[i]);
                }

                var linkMap=datastructure.linkMap;
                for (var tLink in linkMap){
                    if (linkMap.hasOwnProperty(tLink)) {
                        that.graph.createMultiLinkStructures(linkMap[tLink]);
                    }

                }

                // that.graph.updateRenderingPrimitives();
                that.graph.redraw();

                // console.log("------------REDRAW FINISHED------------")

                if (datastructure.annotationMap && datastructure.annotationTypes) {
                    // console.log("MAP THE THINGS TO NOTATIONS AND VIEWS");
                    // console.log(datastructure.annotationMap);
                    // console.log(datastructure.annotationTypes);
                    that.clearProvidedNotation();
                    that.graph.clearProvidedNotation();
                    that.graph.clearProvidedViews();
                    that.graph.viewListFunc();
                    var mainOntologyPrefix=datastructure.ontologyInformation.prefixList();

                    var annoObjName;
                    var aObj;
                    for (annoObjName in datastructure.annotationMap) {
                        if (datastructure.annotationMap.hasOwnProperty(annoObjName)) {

                            aObj = datastructure.annotationMap[annoObjName];

                            if (datastructure.annotationTypes[annoObjName] === "notation") {
                                // fake gizmo notation object
                                var gizMoNotationOBJ={};
                                gizMoNotationOBJ.header={};
                                gizMoNotationOBJ.header.iri=annoObjName;
                                gizMoNotationOBJ.header.prefixList={owl : "http://www.w3.org/2002/07/owl#",
                                    rdf : "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                                    gizmo : "http://visualdataweb.org/ontologies/gizmo-core#",
                                    xsd : "http://www.w3.org/2001/XMLSchema#",
                                    xml : "http://www.w3.org/XML/1998/namespace",
                                    rdfs : "http://www.w3.org/2000/01/rdf-schema#"
                                };

                                // identify the prefix form main ontology;

                                var thisNotationPrefix="";
                                for (var name in mainOntologyPrefix){
                                    if (mainOntologyPrefix.hasOwnProperty(name)){
                                        var val=mainOntologyPrefix[name];
                                        if (val.indexOf(annoObjName)===0){
                                            thisNotationPrefix=name;
                                        }
                                    }
                                }
                                gizMoNotationOBJ.header.prefixList[thisNotationPrefix]=annoObjName+"#";

                                gizMoNotationOBJ.gizmoAnnotations=aObj;
                                // console.log("Found Notation !");
                                // console.log(gizMoNotationOBJ);
                                that.graph.addNotation(gizMoNotationOBJ);
                                that.addProvidedNotations(annoObjName,thisNotationPrefix);

                            }
                            if (datastructure.annotationTypes[annoObjName] === "view") {

                                // console.log("Found a VIEW");
                                // we need view prefix, iri; and then the tripple information;

                                var viewPrefix="";
                                var viewIri=annoObjName;
                                var viewUsesNotation;
                                for (var name in mainOntologyPrefix){
                                    if (mainOntologyPrefix.hasOwnProperty(name)){
                                        var val=mainOntologyPrefix[name];
                                        if (val.indexOf(annoObjName)===0){
                                            viewPrefix=name;
                                        }
                                    }
                                }

                                var viewportConfiguration={
                                    "graphZoomFactor":1.0,
                                    "graphTranslation": [0,0],
                                    "forceActive": true
                                };

                                var elementsAssignment=[];
                                var seenIds=[];
                                var tripleInfoMap=that.graph.getTriplePositionInformationMap();
                                aObj=datastructure.annotationMap[annoObjName];
                                // console.log("UPDATED OBJECT");
                                // console.log(aObj);
                                // console.log("--------------------------------------");

                                for (i=0;i<aObj.length;i++){
                                    // console.log(aObj[i].iri);
                                    if (aObj[i].annotations.viewUsesNotation   ||
                                        aObj[i].annotations.graphZoomFactor    ||
                                        aObj[i].annotations.graphTranslation_X ||
                                        aObj[i].annotations.graphTranslation_Y ||
                                        aObj[i].annotations.forceLayoutActive
                                    ) { // view definition individual
                                        // console.log("Parsing ViewDefinition Element");
                                        if (aObj[i].annotations.viewUsesNotation) {
                                            viewUsesNotation = aObj[i].annotations.viewUsesNotation;
                                            // console.log(aObj[i].iri+ " View USES NOTATION "+viewUsesNotation )
                                        }
                                        if (aObj[i].annotations.graphZoomFactor) {
                                            var ZoomAsDouble = parseFloat(aObj[i].annotations.graphZoomFactor);
                                            viewportConfiguration.graphZoomFactor = ZoomAsDouble;
                                        }


                                        if (aObj[i].annotations.graphTranslation_X) {
                                            var tXAsDouble = parseFloat(aObj[i].annotations.graphTranslation_X);
                                            viewportConfiguration.graphTranslation[0] = tXAsDouble;
                                        }
                                        if (aObj[i].annotations.graphTranslation_Y) {
                                            var tYAsDouble = parseFloat(aObj[i].annotations.graphTranslation_Y);
                                            viewportConfiguration.graphTranslation[1] = tYAsDouble;
                                        }
                                        if (aObj[i].annotations.forceLayoutActive) {
                                            var forceAsString = (aObj[i].annotations.forceLayoutActive);
                                            if (forceAsString === "true")
                                                viewportConfiguration.forceActive = true;
                                            else
                                                viewportConfiguration.forceActive = false;
                                        }
                                    }else{
                                        // elements position individual ;
                                        //  elementsAssignment.push({id: node.tNode().id(), pos: [node.x.toFixed(2), node.y.toFixed(2)],visible: node.visible()});

                                        if (aObj[i].annotations.subjectElement) {
                                            // using triple info;
                                            // console.log("AccessTRIPLE! " + aObj[i].iri);
                                            var cta = aObj[i].annotations; // current triple annotation
                                            var sIRI = cta.subjectElement;
                                            var pIRI = cta.predicateElement;
                                            var oIRI = cta.objectElement;

                                            var sIdOfAnnotation = cta.subjectDescription;
                                            var pIdOfAnnotation = cta.predicateDescription;
                                            var oIdOfAnnotation = cta.objectDescription;

                                            //findthem
                                            // console.log("s Description Object " + sIdOfAnnotation);
                                            // console.log("p Description Object " + pIdOfAnnotation);
                                            // console.log("o Description Object " + oIdOfAnnotation);

                                            var sAn = {};
                                            var pAn = {};
                                            var oAn = {};
                                            for (var qr = 0; qr < aObj.length; qr++) {
                                                if (aObj[qr].iri === sIdOfAnnotation) {
                                                    sAn = aObj[qr];
                                                }
                                                if (aObj[qr].iri === pIdOfAnnotation) {
                                                    pAn = aObj[qr];
                                                }

                                                if (aObj[qr].iri === oIdOfAnnotation) {
                                                    oAn = aObj[qr];
                                                }

                                            }
                                            // console.log( sAn);
                                            // console.log( pAn);
                                            // console.log( oAn);

                                            // all are strings for now;
                                            var s_x=sAn.annotations.postion_x;
                                            var s_y=sAn.annotations.postion_y;

                                            var p_x=pAn.annotations.postion_x;
                                            var p_y=sAn.annotations.postion_y;

                                            var o_x=oAn.annotations.postion_x;
                                            var o_y=oAn.annotations.postion_y;

                                            var s_visible=sAn.annotations.visible;
                                            var p_visible=pAn.annotations.visible;
                                            var o_visible=oAn.annotations.visible;


                                            //make them bool
                                            if ( s_visible==="true")
                                                s_visible=true;
                                            else s_visible=false;
                                            if ( p_visible==="true")
                                                p_visible=true;
                                            else p_visible=false;
                                            if ( o_visible==="true")
                                                o_visible=true;
                                            else o_visible=false;

                                            // map that in nodes and ids;

                                            var s_element={};
                                            var p_element={};
                                            var o_element={};

                                            // find the element in data;

                                            var identifier=sIRI+pIRI+oIRI;

                                            // console.log("That Identifier is ");
                                            //  console.log(identifier);


                                            if (tripleInfoMap.hasOwnProperty(identifier)){
                                                // console.log("Found the tripple!");
                                                var tI=tripleInfoMap[identifier];
                                                //   console.log(sIRI+ " ->  "+pIRI+" ->" +oIRI);

                                                // subject
                                                var s_id=tI[sIRI].id();
                                                if (seenIds.indexOf(s_id)===-1) {
                                                    s_element.id = s_id;
                                                    s_element.pos = [parseFloat(s_x), parseFloat(s_y)];
                                                    s_element.visible = s_visible;
                                                    elementsAssignment.push(s_element);
                                                    seenIds.push(s_id);
                                                }
                                                // predicate
                                                var p_id = tI[pIRI].id();
                                                if (seenIds.indexOf(p_id)===-1) {
                                                    p_element.id = p_id;
                                                    p_element.pos = [parseFloat(p_x), parseFloat(p_y)];
                                                    p_element.visible = p_visible;
                                                    elementsAssignment.push(p_element);
                                                    seenIds.push(p_id);
                                                }
                                                //object
                                                var o_id=tI[oIRI].id();
                                                if (seenIds.indexOf(o_id)===-1) {
                                                    o_element.id=o_id;
                                                    o_element.pos=[parseFloat(o_x),parseFloat(o_y)];
                                                    o_element.visible=o_visible;
                                                    elementsAssignment.push(o_element);
                                                    seenIds.push(o_id);
                                                }

                                                // console.log(s_id+ " ->  "+p_id+" ->" +o_id);
                                                // push the elements
                                                //  elementsAssignment.push({id: node.tNode().id(),
                                                // pos: [node.x.toFixed(2), node.y.toFixed(2)],
                                                // visible: node.visible()});
                                            }
                                        }
                                        if (aObj[i].annotations.targetElement){
                                            // single element

                                            // find its id ;
                                            // console.log("Access Single Element ! "+aObj[i].iri);
                                            var cta=aObj[i].annotations; // current triple annotation
                                            var tIRI=cta.targetElement;
                                            var t_visible=cta.target_visible;
                                            if (t_visible==="true") t_visible=true;
                                            else t_visible=false;
                                            var t_x=cta.targetPosition_x;
                                            var t_y=cta.targetPosition_y;

                                            for (var iN=0;iN<nodes.length;iN++){
                                                if (nodes[iN].iri().localeCompare(tIRI)===0){
                                                    var t_id=nodes[iN].id();
                                                    if (seenIds.indexOf(t_id)===-1){
                                                        var tObj={};
                                                        tObj.id=t_id;
                                                        tObj.pos=[parseFloat(t_x),parseFloat(t_y)];
                                                        tObj.visible=t_visible;
                                                        elementsAssignment.push(tObj);
                                                        console.log(tObj);
                                                        seenIds.push(t_id);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                // console.log("View -------------------------");
                                // console.log(viewPrefix);
                                // console.log(viewIri);
                                // console.log(viewUsesNotation);
                                // console.log("------------------------------");


                                var viewDefinitionObject={};
                                viewDefinitionObject.viewPrefix=viewPrefix;
                                viewDefinitionObject.viewIRI=viewIri;
                                if (viewUsesNotation)
                                    viewDefinitionObject.viewNotation = viewUsesNotation;

                                viewDefinitionObject.graphOptions=viewportConfiguration;
                                viewDefinitionObject.elementAttributes=elementsAssignment;
                                // console.log(viewDefinitionObject);

                                that.graph.addViewFromAnnotations(viewDefinitionObject);
                                // create the mapping



                                // var viewString=graph.getJSONRepresentationForView();
                                // // var gizmoDescription=graph.coreApi().getLoadedGizmoFileName();
                                //
                                //
                                // // viewDefinitionObject.gizmoConfig=gizmoDescription;
                                // viewDefinitionObject.elementAttributes=viewString;


                            }
                            // console.log("--------------------------------------");
                            // console.log("--------------------------------------");
                            // console.log("--------------------------------------");
                        }

                    }



                }

                that.graph.applyViewByIndex(0);
            //    console.log("Done");
                // }
                // catch (e){
                //     console.log("failed to read the json File")
                // }
            }


        that.loadOntologyFromLocalJSON=function(filename){

            // clear the maps;
            multiLinkrenderingElementMap=[];
            renderingElementMap={};
            that.graph.clearGraphData();
            that.loadGizmoConfig("gizmoNotations/default.json");
            that.ontologyLoader.loadFromLocalJSON(filename,parseJsonContent);
        };


        that.addNotationToProvidedMenu=function(iri){


        };

        that.loadOntologyFromFile=function(){
            function _callback(fileName,response){
                // console.log("Need To handle the response for fileName"+fileName+"\n"+response);

                console.log("######################");
                loadedGizmoConfig=fileName;

                parseJsonContent(fileName,response);
                console.log("FINISHED");
            }
            that.loadGizmoConfig("gizmoNotations/default.json");
            that.ontologyLoader.loadOntologyFromFile(_callback);
        };

        /** Refactoring **/
        that.loadNotationFromJSONFile=function() {
            console.log("Loading Custom notation! from file");
            function _callback(fileName,response){
                // console.log("Need To handle the response for fileName"+fileName+"\n"+response);
                console.log("######################");
                loadedGizmoConfig=fileName;
                that.elementsConfig={};
                parseGizmoNotation(response);
                console.log("FINISHED");
            }

            that.ontologyLoader.loadNotationFromJSONFile(_callback);
        };

        that.loadGizmoConfig=function(filename){
                loadedGizmoConfig="defaultGizmoConfig.json";
                d3.xhr(filename, "application/json", function (error, request) {

                    if (error !== null && error.status === 500) {
                        console.log(error);
                        console.log("HAS AN ERROR AND A STATUS WHILE LOADING " + filename);
                        return;
                    }
                    loadedGizmoConfig=filename;
                    console.log("Loading GIZMO "+loadedGizmoConfig);
                    that.elementsConfig={};
                    parseGizmoNotation(request.responseText);
                    console.log("Done");
                });

            };

        that.loadGizmoConfigWithCallBack=function(filename,_callback,param){
            loadedGizmoConfig="defaultGizmoConfig.json";
            d3.xhr(filename, "application/json", function (error, request) {

                if (error !== null && error.status === 500) {
                    console.log(error);
                    console.log("HAS AN ERROR AND A STATUS WHILE LOADING " + filename);
                    return;
                }
                loadedGizmoConfig=filename;
                that.elementsConfig={};
                parseGizmoConfigWithCallBack(request.responseText,_callback,param);

            });

        };

        that.setFunctionOnViewLoad=function(func){
            that.graph.viewListFunc=func;
        };


        that.setFunctionClearProvidedNotations=function(func){
            that.clearProvidedNotation=func;
        };
        that.setFunctionAddProvidedNotations=function(func){
            that.addProvidedNotations=func;
        };

        that.setFunctionReEvalPauseButton=function(func){
            that.reEvaluatePauseButton=func;
        };



        function parseGizmoConfigWithCallBack(text,_callback,_param){
            refactoredGizmoConfigPareser(text);
            that.graph.updateRenderingPrimitivesWithCallBack(_callback,_param);
        }

        function parseGizmoConfig(text){
            genericGizmoConfigParser(text);
            that.graph.updateRenderingPrimitives();
        }

        function parseGizmoNotation(text){
            refactoredGizmoConfigPareser(text);
            that.graph.updateRenderingPrimitives();
            // console.log(">>>>>>>>>>>>>>..NOTATION SHOULD HAVE UPDATED THE GRAPH!");
        }

        that.applyProvidedNotation=function(notationIRI){
            that.elementsConfig={};
            that.graph.currentlyUsedNotation(notationIRI);
            var jObj=that.graph.currentlyUsedNotationObject();
            // console.log("wannt to apply provided Notation");
            // console.log(notationIRI);
            // console.log(jObj);

            var classes=jObj.gizmoAnnotations;
            for (var i=0;i<classes.length;i++){
                var iri=classes[i].iri;
                // console.log(iri);
                var hashId=iri.lastIndexOf("#");
                var classId;
                if (hashId>0)
                    classId= iri.substr(hashId+1);
                refactoredAssignAnnotations(classId,classes[i].annotations);
            }
            that.graph.updateRenderingPrimitives();
        };




        function refactoredGizmoConfigPareser(text){
            // console.log("refactored Gizmo parser");
            var jObj=JSON.parse(text);

            that.graph.addNotation(jObj);

            var classes=jObj.gizmoAnnotations;
            for (var i=0;i<classes.length;i++){
                var iri=classes[i].iri;
                // console.log(iri);
                var hashId=iri.lastIndexOf("#");
                var classId;
                if (hashId>0)
                    classId= iri.substr(hashId+1);
                refactoredAssignAnnotations(classId,classes[i].annotations);
            }
        }

        function genericGizmoConfigParser(text){
            console.log("Generic Config Parser");


            var jObj=JSON.parse(text);
            var classes=jObj.classAttribute;
            var useGizmoType=false;
            var urlToPrefix={};
            if (classes===undefined){
                // try to use "o2v gizmo annotations"
                classes=jObj.gizmoAnnotations;

                if (classes===undefined){
                    console.log("Could not find anything that relates to GIZMO");
                    return;
                }else{
                    useGizmoType=true;
                    // create urlToPrefixMap
                    var prefixMap=jObj.header.prefixList;
                    for (var name in prefixMap){
                        if (prefixMap.hasOwnProperty(name)){
                            var url=prefixMap[name];
                            urlToPrefix[url]=name;
                        }
                    }
                }
            }
            for (var i=0;i<classes.length;i++){
                var iri=classes[i].iri;
                var hashId=iri.lastIndexOf("#");
                var classId;
                if (hashId>0)
                    classId= iri.substr(hashId+1);

                if (useGizmoType){
                    var iriId= iri.substr(0,hashId+1);
                    var prefixName=urlToPrefix[iriId];
                    classId=prefixName+""+classId;

                }
                // console.log("classId "+classId);
                assignAnnotations(classId,classes[i].annotations);
            }

        }
        function prefixedName(longName) {
            var prefixList={
                rdf:'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                rdfs:'http://www.w3.org/2000/01/rdf-schema#',
                owl:'http://www.w3.org/2002/07/owl#',
                xsd:'http://www.w3.org/2001/XMLSchema#',
                dc:'http://purl.org/dc/elements/1.1/#',
                xml:'http://www.w3.org/XML/1998/namespace'
            };

          

            for (var name in prefixList){
                if (prefixList.hasOwnProperty(name)){
                    if (longName.indexOf(prefixList[name])===0){
                        var prefix=name;
                        var suffix=longName.split(prefixList[name])[1];
                        return prefix+":"+suffix;
                    }
                }
            }



            if (longName.indexOf("http")===-1 && longName.indexOf(":")!==-1){
                var prefix=longName.split(":")[0];
                var suffix=longName.split(":")[1];
                if (prefixList.hasOwnProperty(prefix)){
                    return prefix+suffix
                }
                return suffix;
            }
            return longName;

        }

        that.prefixedNameForTTLExport=function (prefixList,longName) {

            if (longName.indexOf("http://")===-1 && longName.indexOf("https://")===-1 &&  longName.indexOf(":")!==-1){
                return longName;
            }

            for (var name in prefixList){
                if (prefixList.hasOwnProperty(name)){
                    if (longName.indexOf(prefixList[name])===0){
                        var prefix=name;
                        var suffix=longName.split(prefixList[name])[1];
                        return prefix+":"+suffix;
                    }
                }
            }

            return "<"+longName+">"; // just in case we return the full url

        };


        function refactoredAssignAnnotations(element,annotations){
            // console.log("target Name ? "+element);
            var target=annotations.targetElement;
            var prefixedObj=prefixedName(target);


            if (prefixedObj===target){
                var tokens=target.split("#");
                prefixedObj=tokens[1];
            }
            prefixedObj=prefixedName(prefixedObj);
            element=prefixedObj;
           // console.log("The element is : " +element);


            var cfgObj=that.elementsConfig[element];
            if (cfgObj===undefined){
                // console.log("We need to add this thing to our elements");
                // backwards mapping
                // try to find the element name in nodes, properties, or datatypes
                if (map_nodes.indexOf(element)!==-1 && that.elementsConfig[map_nodes[0]]!==undefined) {
                    that.elementsConfig[element]=JSON.parse(JSON.stringify(that.elementsConfig[map_nodes[0]]));
                }
                if (map_properties.indexOf(element)!==-1 && that.elementsConfig[map_properties[0]]!==undefined) {
                    that.elementsConfig[element]=JSON.parse(JSON.stringify(that.elementsConfig[map_properties[0]]));
                }
                if (map_datatypes.indexOf(element)!==-1 && that.elementsConfig[map_datatypes[0]]!==undefined) {
                    that.elementsConfig[element]=JSON.parse(JSON.stringify(that.elementsConfig[map_datatypes[0]]));
                }
                cfgObj=that.elementsConfig[element]; // re-assign value;
                if (cfgObj===undefined){
                    that.elementsConfig[element]={};
                    cfgObj=that.elementsConfig[element]; // re-assign value;
                }
            }



            for (var cfgElement in annotations){
                // if (annotations.hasOwnProperty(cfgElement) && cfgObj.hasOwnProperty(cfgElement)){
                if (annotations.hasOwnProperty(cfgElement)){ // allow to add Values
                    // extract the name
                    var newValue;
                    if (typeof annotations[cfgElement]=== "string"){
                        newValue=annotations[cfgElement];
                        if (cfgElement==="roundedCorner"){
                            // this is an array acctually;
                            var newValArray=newValue.split(",");
                            newValue=[];
                            newValue.push(newValArray[0]);
                            newValue.push(newValArray[1]);
                        }

                    }
                    else{ // this is old parser
                        newValue=annotations[cfgElement][0].value;
                    }
                    var oldValue=cfgObj[cfgElement];
                    if (newValue!==oldValue) {
                        that.elementsConfig[element][cfgElement] = newValue;

                      //  console.log("  "+cfgElement+ "  "+newValue);

                    }
                }

            }
        // console.log(that.elementsConfig);

        }

        function assignAnnotations(element,annotations) {
            // getConfigObject;



            var cfgObj=that.elementsConfig[element];
            if (cfgObj===undefined){
                // console.log("We need to add this thing to our elements");
                // backwards mapping
                // try to find the element name in nodes, properties, or datatypes
                if (map_nodes.indexOf(element)!==-1 && that.elementsConfig[map_nodes[0]]!==undefined) {
                    that.elementsConfig[element]=JSON.parse(JSON.stringify(that.elementsConfig[map_nodes[0]]));
                }
                if (map_properties.indexOf(element)!==-1 && that.elementsConfig[map_properties[0]]!==undefined) {
                    that.elementsConfig[element]=JSON.parse(JSON.stringify(that.elementsConfig[map_properties[0]]));
                }
                if (map_datatypes.indexOf(element)!==-1 && that.elementsConfig[map_datatypes[0]]!==undefined) {
                    that.elementsConfig[element]=JSON.parse(JSON.stringify(that.elementsConfig[map_datatypes[0]]));
                }
                // console.log("new config Object:");
                // console.log(that.elementsConfig[element]);
            }
            cfgObj=that.elementsConfig[element]; // re-assign value;
            if (cfgObj===undefined){
                that.elementsConfig[element]={};
                cfgObj=that.elementsConfig[element]; // re-assign value;
            }
            for (var cfgElement in annotations){
                // if (annotations.hasOwnProperty(cfgElement) && cfgObj.hasOwnProperty(cfgElement)){
                    if (annotations.hasOwnProperty(cfgElement)){ // allow to add Values
                    // extract the name
                        var newValue;
                        if (typeof annotations[cfgElement]=== "string"){
                            newValue=annotations[cfgElement];
                            if (cfgElement==="roundedCorner"){
                                // this is an array acctually;
                                var newValArray=newValue.split(",");
                                newValue=[];
                                newValue.push(newValArray[0]);
                                newValue.push(newValArray[1]);
                                
                            }

                        }
                        else{ // this is old parser
                            newValue=annotations[cfgElement][0].value;
                        }
                    var oldValue=cfgObj[cfgElement];
                    if (newValue!==oldValue) {
                        // console.log("Changing " + element + "   "+cfgElement+"  : " + cfgObj[cfgElement] + "-> " + newValue);
                        that.elementsConfig[element][cfgElement] = newValue;
                    }
                }
            }
        }


        function computeNormalizedOffsetDirection(source,target){

            var x=target.x-source.x;
            var y=target.y-source.y;

            var len=Math.sqrt(x*x+y*y);
            return {x: x/len, y: y/len};
        }

        function shapeBasedIntersectionDomain(IntPoint,domcfg,domain,offsetDirection,distOffset){

            if (domcfg.renderingType==="circle"){
                var dom_distanceToBorder=parseInt(domain.getRadius())+distOffset;
                IntPoint.x1=domain.x + (dom_distanceToBorder*offsetDirection.x);
                IntPoint.y1=domain.y + (dom_distanceToBorder*offsetDirection.y);
                return;
            }

            var domDistX,domDistY,dom_distanceToBorderX,dom_distanceToBorderY;
            if (domcfg.renderingType==="ellipse" ){
                // dom_distanceToBorder=parseInt(domain.getRadius())+distOffset;
                domDistX=domain.getRenderingShape().attr("width");
                domDistY=domain.getRenderingShape().attr("height");

                dom_distanceToBorderX=0.5*parseFloat(domDistX);
                dom_distanceToBorderY=0.5*parseFloat(domDistY);

                IntPoint.x1=domain.x + (dom_distanceToBorderX*offsetDirection.x);
                IntPoint.y1=domain.y + (dom_distanceToBorderY*offsetDirection.y);
            }

            if (domcfg.renderingType==="rect"){
                var shapeobj=domain.getExpectedShapeSize();
                domDistX=shapeobj.w;
                domDistY=shapeobj.h;
                if (domain.isUmlCustomshape()){

                    domDistX=domain.getRenderingShape().attr("width");
                    domDistY=domain.getRenderingShape().attr("height");


                }


                dom_distanceToBorderX=0.5*parseFloat(domDistX);
                dom_distanceToBorderY=0.5*parseFloat(domDistY);
                var scale=1.0;
                if (Math.abs(offsetDirection.x)>=Math.abs(offsetDirection.y))
                    scale=1.0/Math.abs(offsetDirection.x);
                else
                    scale=1.0/Math.abs(offsetDirection.y);
                IntPoint.x1=domain.x + (scale*dom_distanceToBorderX*offsetDirection.x);
                IntPoint.y1=domain.y + (scale*dom_distanceToBorderY*offsetDirection.y);

            }
        }


        function shapeBasedIntersectionRange(IntPoint,ran_cfgObj,range,offsetDirection,distOffset){

            if (ran_cfgObj.renderingType==="circle"){
                var ran_distanceToBorder=parseInt(range.getRadius())+distOffset;
                IntPoint.x2=range.x + (ran_distanceToBorder*offsetDirection.x);
                IntPoint.y2=range.y + (ran_distanceToBorder*offsetDirection.y);
                return;
            }
            var ranDistX, ranDistY,ran_distanceToBorderX,ran_distanceToBorderY;
            if (ran_cfgObj.renderingType==="ellipse" ){
                // dom_distanceToBorder=parseInt(domain.getRadius())+distOffset;
                ranDistX=range.getRenderingShape().attr("width");
                ranDistY=range.getRenderingShape().attr("height");

                ran_distanceToBorderX=0.5*parseFloat(ranDistX);
                ran_distanceToBorderY=0.5*parseFloat(ranDistY);
                IntPoint.x2=range.x + (ran_distanceToBorderX*offsetDirection.x);
                IntPoint.y2=range.y + (ran_distanceToBorderY*offsetDirection.y);
            }
            if (ran_cfgObj.renderingType==="rect"){
                var shapeobj=range.getExpectedShapeSize();
                ranDistX=shapeobj.w;
                ranDistY=shapeobj.h;
                if (range.isUmlCustomshape()){

                    ranDistX=range.getRenderingShape().attr("width");
                    ranDistY=range.getRenderingShape().attr("height");


                }
                ran_distanceToBorderX=0.5*parseFloat(ranDistX);
                ran_distanceToBorderY=0.5*parseFloat(ranDistY);
                var scale=1.0;
                if (Math.abs(offsetDirection.x)>=Math.abs(offsetDirection.y))
                    scale=1.0/Math.abs(offsetDirection.x);
                else
                    scale=1.0/Math.abs(offsetDirection.y);
                IntPoint.x2=range.x + (scale*ran_distanceToBorderX*offsetDirection.x);
                IntPoint.y2=range.y+ (scale*ran_distanceToBorderY*offsetDirection.y);

            }

        }

        this.appendViewDialog=function(){
            dialogBox=new that.dialogBoxConstrucor(that);
            dialogBox.initialize("appendView");
            dialogBox.setTitle("View Options");

        };


        this.saveSpecificationAsTTL=function(){
          // add a dialog box;
          dialogBox=new that.dialogBoxConstrucor(that);
          dialogBox.initialize("specification");
            dialogBox.setTitle("Specification Options");

            // that.graph.appendView("ex","example.org/view_0");
            // that.graph.exportSpecification("sp","example.org/spec");
        };

        this.saveContainerAsTTL=function(){
            dialogBox=new that.dialogBoxConstrucor(that);
            dialogBox.initialize("container");
            dialogBox.setTitle("Container Options");
        };



        this.removeDialogBox=function(){

            dialogBox.cleanUp();
            dialogBox=undefined;
        };

        this.computeIntersectionPoints=function(domain,range,offset){

            // get the shape parameter for domain;
            var distOffset=0;
            if (offset) {distOffset=offset;}
            var iP={x1:domain.x,y1:domain.y,x2:range.x,y2:range.y};
            var dom_cfgObj=domain.getConfigObj();
            var ran_cfgObj=range.getConfigObj();
            var offsetDirection=computeNormalizedOffsetDirection(domain,range);
            shapeBasedIntersectionDomain(iP,dom_cfgObj,domain,offsetDirection,distOffset);
            offsetDirection=computeNormalizedOffsetDirection(range,domain);
            shapeBasedIntersectionRange(iP,ran_cfgObj,range,offsetDirection,distOffset);
            return iP;
        };
        this.computeExpected_IntersectionPoints=function(domain,range,offset){
            // get the shape parameter for domain;

            var distOffset=0;
            if (offset) {distOffset=offset;}
            var iP={x1:domain.x,y1:domain.y,x2:range.x,y2:range.y};

            var dom_cfgObj=domain.getConfigObjExpected();
            var ran_cfgObj=range.getConfigObjExpected();
            var offsetDirection=computeNormalizedOffsetDirection(domain,range);
            shapeBasedIntersectionDomain(iP,dom_cfgObj,domain,offsetDirection,distOffset);
            offsetDirection=computeNormalizedOffsetDirection(range,domain);
            shapeBasedIntersectionRange(iP,ran_cfgObj,range,offsetDirection,distOffset);

            return iP;
        };
        this.computeExpected_IntersectionPointsForMLP=function(domain,property,range,offset){
            // get the shape parameter for domain;

            var distOffset=0;
            if (offset) {distOffset=offset;}
            var iP={x1:domain.x,y1:domain.y,x2:range.x,y2:range.y};
            var dom_cfgObj=domain.getConfigObjExpected();
            var ran_cfgObj=range.getConfigObjExpected();
            var offsetDirection=computeNormalizedOffsetDirection(domain,property);
            shapeBasedIntersectionDomain(iP,dom_cfgObj,domain,offsetDirection,distOffset);
            offsetDirection=computeNormalizedOffsetDirection(range,property);
            shapeBasedIntersectionRange(iP,ran_cfgObj,range,offsetDirection,distOffset);


            return iP;
        };
        this.computeIntersectionPointsForMLP=function(domain,property,range,offset){

            // get the shape parameter for domain;
            var distOffset=0;
            if (offset) {distOffset=offset;}
            var iP={x1:domain.x,y1:domain.y,x2:range.x,y2:range.y};
            var dom_cfgObj=domain.getConfigObj();
            var ran_cfgObj=range.getConfigObj();
            var offsetDirection=computeNormalizedOffsetDirection(domain,property);
            shapeBasedIntersectionDomain(iP,dom_cfgObj,domain,offsetDirection,distOffset);
            offsetDirection=computeNormalizedOffsetDirection(range,property);
            shapeBasedIntersectionRange(iP,ran_cfgObj,range,offsetDirection,distOffset);


            return iP;
        };


        this.askForFileNameDialog=function(filename){
          //  console.log(filename);
            var suggestionFileName="suggestionFileName.view";
            if (filename.indexOf(".json")){
                suggestionFileName=filename.slice(0,filename.length-5);
            }
            // create dialog
            // var msg=canvasAreaNode.append("div");
            // msg.node().innerHTML="TODO: Layout and Buttons HELLO NAME MSG:" +suggestionFileName;
            // msg.style("position","absolute");
            // msg.style("top","10px");
            // msg.style("text-align","center");
            //
            // var cx= that.getSize()[0];
            // msg.style("left",0.5*cx+"px");


            // collect information form graph
            var jsonRep=that.graph.getJSONRepresentationForView();
            jsonRep.push({gizmoConfigFile:loadedGizmoConfig});
         //   console.log(jsonRep);
            // save file

            var strToWrite=JSON.stringify(jsonRep);
           // console.log(strToWrite);
        };

        this.saveOntologyAsJSON=function(){
            var suggestionName=loadedFileName;
            if (suggestionName.length===0){
                suggestionName="ontology.json"
            }
            if (suggestionName.indexOf(".json")===-1){suggestionName+=".json"}

        //    console.log("requesting save file operation "+suggestionName);
            //a loaded JSON can have
            // views,
            // gizmoConfig
            // and the actual data
           that.ontologyLoader.saveOntologyAsJSON(suggestionName);

        };

        this.saveViewAsFile=function(){
            var fileNameToSave=this.askForFileNameDialog(loadedFileName)
        };


        this.appendViewAsJson=function(){
            that.graph.appendViewAsJsonObject();
        };


        var aDtMap={};
        function createDatatypeValueMap(pName,dtAssertion){
            if (dtAssertion===undefined) return;
            aDtMap[pName]=prefixedName(dtAssertion.annotations.assertionDatatypeValue);
        }

        function parseDatatypeAssertion(text){
            var jObj=JSON.parse(text);
            var classes=jObj.gizmoAnnotations;
            for (var i=0;i<classes.length;i++){
                var iri=classes[i].iri;
                var hashId=iri.lastIndexOf("#");
                var assertionPropertyId;
                if (hashId>0)
                    assertionPropertyId= iri.substr(hashId+1);
                if (classes[i].annotations)
                    createDatatypeValueMap(assertionPropertyId,classes[i]);

            }

        }

        this.readDatatypeAssertionFile=function (fname){
            d3.xhr(fname, "application/json", function (error, request) {
                if (error !== null && error.status === 500) {
                    console.log(error);
                    console.log("HAS AN ERROR AND A STATUS WHILE LOADING " + fname);
                    return;
                }
                parseDatatypeAssertion(request.responseText);
            });
        };

        this.getDatatypeAssertionMap=function(){
            return aDtMap;
        };

        // load default config
        this.getHiddenExporterButton=function(){
            return hiddenExporterButton;
        }


    };
    WebVOWL_API.prototype.constructor = WebVOWL_API;


    return WebVOWL_API;
}());



