
!function(){
    var w2=wapi.createAPI();
    var w=wapi.createAPI();
    function start(){
        console.log("Hello");

        w.initialize("wapi_canvasArea1");
        w.updateCanvasAreaSize(400,400);

        w.graph.charge(25);
        w.graph.gravity(0.02);
        w.graph.colide(true);
       // w.graph.createFroceDirectedLayout();
        w.graph.setOnNodeClickFunction(connectionClickFunction);


        w2.initialize("wapi_canvasArea2");
        w2.setCanvasBgColor("#c4c4c4");
        w2.updateCanvasAreaSize(400,400);

        d3.select("#clearData").on("click", clearData);
        d3.select("#addData").on("click", addData);

    }

    function connectionClickFunction(){
        w2.graph.clearGraphData();
        // create random nodes for w2;
        var d3Node=d3.select(this);
        var text=d3Node.attr("labelText");
        console.log(text);

         var m=w2.graph.addNode(text,w2.elementsConfig.owlClass);
        var randN=Math.floor(Math.random()*5)+1;
        for (var i=0;i<randN;i++){
            var dt=w2.graph.addNode("datatypeNode"+i,w2.elementsConfig.dataType);
            // connect them ;
            w2.graph.addSingleLink("dtProperty"+i,m,dt,w2.elementsConfig.plainLink);
            }
         w2.graph.redraw();

    }


    function createW1Nodes(){
        var n01=w.graph.addSimilarityNode("Test",w.elementsConfig.owlClass,0.90);
        var n02=w.graph.addSimilarityNode("b",w.elementsConfig.owlClass,0.80);
        var n03=w.graph.addSimilarityNode("c",w.elementsConfig.owlClass,0.70);
        var n04=w.graph.addSimilarityNode("d",w.elementsConfig.owlClass,0.60);
        var n05=w.graph.addSimilarityNode("e",w.elementsConfig.owlClass,0.50);
        var n06=w.graph.addSimilarityNode("f",w.elementsConfig.owlClass,0.40);
        var n07=w.graph.addSimilarityNode("g",w.elementsConfig.owlClass,0.30);
        var n08=w.graph.addSimilarityNode("h",w.elementsConfig.owlClass,0.20);
        var n09=w.graph.addSimilarityNode("i",w.elementsConfig.owlClass,0.20);
        var n10=w.graph.addSimilarityNode("j",w.elementsConfig.owlClass,0.20);
        w.graph.redraw();
    }


    function clearData(){
        w.graph.clearGraphData();
    }

    function addData(){
        createW1Nodes();
    }


start();
}();