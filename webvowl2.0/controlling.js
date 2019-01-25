
!function(){


    //using this as webvowl2 example
    // create some styles

    // why is the order important here? does not make any sense to me -,-
    rws.createCSSSelector(".menu_element_class", "background-color: #18202a;" +
        "cursor: pointer;" +
        "color: #fff;"
    );

    rws.createCSSSelector(".menu_element_class2", "background-color: #0f0;" +
        "cursor: pointer;" +
        "color: #fff;"
    );

    rws.createCSSSelector(".me_hovered","background-color: #18202a;" +
        "color: #aaa;");



    rws.createCSSSelector(".mEntry", "background-color: #fff;" +
        "cursor: pointer;"
    );
    rws.createCSSSelector(".mEntry_hovered","background-color: #f0f;");
    // This is where we create the gui  and its handler;
    rws.createCSSSelector(".hidden","display: none");




    var m1=rws.addNavigationMenu("",rws.NAV_POSITION_BOTTOM,"horizontal");
    m1.setBackgroundColor("#18202a");

    var webvowlGraphRenderer= wapi.createAPI();
    rws.setCentralWidget(webvowlGraphRenderer,"webvowlGraphRenderer");
    webvowlGraphRenderer.initialize("webvowlGraphRenderer");

    webvowlGraphRenderer.readDatatypeAssertionFile("core/gizmo_core.json");

    webvowlGraphRenderer.updateCanvasAreaSize("100%","100%","0px","-40px");
    webvowlGraphRenderer.showFpsAndElementStatistic(true);

    // webvowlGraphRenderer.graph.charge(25);
    // webvowlGraphRenderer.graph.gravity(0.02);
    // webvowlGraphRenderer.graph.colide(true);


    /**  ONTOLOGY LOADER ELEMENTS **/

    var ontologyLoader= m1.addMenuEntry("Ontology","center");
    ontologyLoader.setStyle("menu_element_class").setHoverStyle("me_hovered");
    // add buttons and connect them
    var bt0=ontologyLoader.addEntryElement("Single Container JSON");
    var bt1=ontologyLoader.addEntryElement("Example Ontology");
    var bt2=ontologyLoader.addEntryElement("smallTest");
    var bt3=ontologyLoader.addEntryElement("muto");
    var bt4=ontologyLoader.addEntryElement("base");
    var ontoLoader= ontologyLoader.addEntryElement("Load Ontology as File");


    ontoLoader.connectOnClick(function(){
        webvowlGraphRenderer.graph.clearGraphData();
        webvowlGraphRenderer.loadGizmoConfig("gizmoNotations/default.json");
        webvowlGraphRenderer.loadOntologyFromFile();
    });

    bt1.connectOnClick(function(){
        webvowlGraphRenderer.graph.clearGraphData();
        // TODO
         loadLocalJson("exampleOntology.json");
    });

    bt0.connectOnClick(function(){
        webvowlGraphRenderer.graph.clearGraphData();
        // TODO
        loadLocalJson("SingleFileContainer.json");
    });

    bt4.connectOnClick(function(){
        webvowlGraphRenderer.graph.clearGraphData();
        // TODO
        loadLocalJson("base.json");
    });

    bt2.connectOnClick(function(){
        webvowlGraphRenderer.graph.clearGraphData();
        webvowlGraphRenderer.loadGizmoConfig("gizmoNotations/default.json");
        loadLocalJson("smallTest.json");
    });
    // bt4.connectOnClick(function(){
    //     webvowlGraphRenderer.graph.clearGraphData();
    //     loadLocalJson("firstTest2.json");
    // });
    bt3.connectOnClick(function(){
        webvowlGraphRenderer.graph.clearGraphData();
        webvowlGraphRenderer.loadGizmoConfig("gizmoNotations/default.json");
        loadLocalJson("testData.json");
    });



    ontologyLoader.addSvgIconInFront();



    /**  NOTATION LOADER ELEMENTS **/

    var notationOpts= m1.addMenuEntry("Notations","center");
    notationOpts.setStyle("menu_element_class").setHoverStyle("me_hovered");

    var notationLoader  = notationOpts.addEntryElement("Load Custom Notation");
    var notation1       = notationOpts.addEntryElement("VOWL");
    var notation2       = notationOpts.addEntryElement("UML");
    var notation3       = notationOpts.addEntryElement("Default");
    var notation4       = notationOpts.addEntryElement("Example");


    notation1.connectOnClick(function(){
        webvowlGraphRenderer.loadGizmoConfig("gizmoNotations/vowl.json");
    });

    notation2.connectOnClick(function(){
        webvowlGraphRenderer.loadGizmoConfig("gizmoNotations/uml.json");
    });
    notation3.connectOnClick(function(){
        webvowlGraphRenderer.loadGizmoConfig("gizmoNotations/default.json");
    });
    notation4.connectOnClick(function(){
        webvowlGraphRenderer.loadGizmoConfig("gizmoNotations/example2.json");
    });


    notationLoader.connectOnClick(function () {
        // TODO MAKE IT LOAD TTL FILES
        webvowlGraphRenderer.loadNotationFromJSONFile();
    });



    var viewOpts= m1.addMenuEntry("Create View","center");
    viewOpts.setWidth("220px");
    viewOpts.setStyle("menu_element_class").setHoverStyle("me_hovered");
    // var bt_saveNewView=viewOpts.addEntryElement("Save specification");
    //
    // bt_saveNewView.connectOnClick(function(){
    //     webvowlGraphRenderer.saveSpecificationAsTTL();
    // });
  //  bt_saveNewView.classed("hidden",true);
    var bt_appendNewView=viewOpts.addEntryElement("Append view");
     bt_appendNewView.connectOnClick(function(){
         webvowlGraphRenderer.appendViewDialog();
    });
    var viewsContainer= m1.addMenuEntry("Views","center");
    viewsContainer.setStyle("menu_element_class").setHoverStyle("me_hovered");
    viewsContainer.classed("hidden",true);


    var notationContainer= m1.addMenuEntry("Provided Notations","center");
    notationContainer.setStyle("menu_element_class").setHoverStyle("me_hovered");
    notationContainer.setWidth("220px");
    notationContainer.classed("hidden",true);



    var menuExport= m1.addMenuEntry("Export","center");
    menuExport.setStyle("menu_element_class").setHoverStyle("me_hovered");
    // var bt_exportSpec      = menuExport.addEntryElement("Specification");
    var bt_exportContainer = menuExport.addEntryElement("Container");
    // bt_exportSpec.connectOnClick(webvowlGraphRenderer.saveSpecificationAsTTL);
    bt_exportContainer.connectOnClick(webvowlGraphRenderer.saveContainerAsTTL);
    // var bt_overWriteView=viewOpts.addEntryElement("Overwrite View");




    webvowlGraphRenderer.setFunctionOnViewLoad(_viewLoadCallback);
    webvowlGraphRenderer.setFunctionClearProvidedNotations(_clearProvidedNotationContainer);
    webvowlGraphRenderer.setFunctionAddProvidedNotations(_notationAddEntry);
    webvowlGraphRenderer.setFunctionReEvalPauseButton(_reEvalPauseButton);


    var pauseButton= m1.addMenuEntry("Pause","center");
    pauseButton.setStyle("menu_element_class").setHoverStyle("me_hovered");
    // overwrite onClick event;
    pauseButton.getMenuEntryDOM().on("click",function(){
        console.log(this);
        var val=webvowlGraphRenderer.graph.forcePlayPause();
        console.log("Force Paused: "+val);
        if (val){
            this.innerHTML="Play";
        } else {
            this.innerHTML="Pause";
        }

    });

    function _reEvalPauseButton(){
        var val=webvowlGraphRenderer.graph.isForcePaused();
        console.log("Force Paused: "+val);
        if (val){
            pauseButton.getMenuEntryDOM().innerHTML="Play";
        } else {
            pauseButton.getMenuEntryDOM().innerHTML="Pause";
        }

    }

    var numOfNotations=0;
    function _clearProvidedNotationContainer(){
        notationContainer.clearEntries();
        notationContainer.classed("hidden", true);
        numOfNotations=0;

    }

    function _notationAddEntry(iri,prefix){

        notationContainer.classed("hidden",false);

        var bt=notationContainer.addEntryElement(prefix);
        bt.appendAttribute("NotationIndex",numOfNotations);
        bt.appendAttribute("iri",iri);
        numOfNotations++;
        notationContainer.setTitle("Provided Notations (" + numOfNotations + ")");
        bt.connectOnClick(function(){
            console.log(this);
            var id=this.getAttribute("iri");
            console.log("telling the graph to load notation by IRI " + id);

            webvowlGraphRenderer.applyProvidedNotation(id);
            console.log("redraw the graph with new notation");


        });




    }


    function _viewLoadCallback() {
        // no parameters are given but we take here the vars and stuffl

        // console.log("The Controlling Function now adds views ");
        var views= webvowlGraphRenderer.graph.getViews();
        var numViews=views.length;
        if (numViews>0) {
            viewsContainer.clearEntries();
            viewsContainer.setTitle("Select Views (" + numViews + ")");
            viewsContainer.classed("hidden", false);
        }else{
            viewsContainer.clearEntries();
            viewsContainer.classed("hidden", true);
        }

        for (var i=0;i<numViews;i++){
            var ind=i+1;
            var bt=viewsContainer.addEntryElement("View "+ind);
            bt.appendAttribute("viewIndex",i);
            bt.connectOnClick(function(){
                var id=parseInt(this.getAttribute("viewIndex"));
                // console.log("telling the graph to load view by index " + id);
                webvowlGraphRenderer.graph.applyViewByIndex(id);


            });


        }



    }




    m1.hideAllMenus();
    // initialized datatypes






    d3.select(window).on("resize", adjustSize);

    function adjustSize(){
        webvowlGraphRenderer.updateCanvasAreaSize("100%","100%","0px","-40px");
        m1.updateScrollButtonVisibility();
    }
    adjustSize();




    function loadLocalJson(filename){
        webvowlGraphRenderer.loadOntologyFromLocalJSON(filename);
    }
    //loadLocalJson("testData.json");
    // loadLocalJson("smallTest.json");

     loadLocalJson("exampleOntology.json");
     // webvowlGraphRenderer.loadGizmoConfig("gizmoNotations/default.json");

     console.log("Loading Done!");

    // webvowlGraphRenderer.loadGizmoConfig("defaultSpecification-byGE.json");

}();