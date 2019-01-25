// The Generic loader provides loading functionallities like triggering o2v and simply loading json files
// that are in vowl.


// this then triggers the parser which creates the nodes and properties, and their connections..


// use singelton loader
var genericLoader={};

genericLoader.Instance=undefined;


genericLoader.createLoader=function(){
    // singleton!
    if (genericLoader.Instance)
        return genericLoader.Instance;
    else {
        genericLoader.Instance={};
        genericLoader.Instance.apiCore=undefined;
        return genericLoader.Instance;
    }
};
var instance=genericLoader.createLoader();

instance.setAPIcore=function(core){
  instance.apiCore=core;
};

instance.loadFromLocalJSON=function(filename,_callback){

    d3.xhr(filename, "application/json", function (error, request) {
        if (error !== null && error.status === 500) {
            console.log(error);
            console.log("HAS AN ERROR AND A STATUS WHILE LOADING " + filename);
            return;
        }
        // console.log("Loading THAT File ! "+filename);
        _callback(filename,request.responseText);
    });
};
instance.loadOntologyFromFile=function(_callback){
    var hidden_FileInput=document.createElement('input');
    hidden_FileInput.id="HIDDEN_FILE_JSON_INPUT";
    hidden_FileInput.type="file";
    hidden_FileInput.accept = ".ttl";
    //hidden_solutionInput.style.display="none";
    hidden_FileInput.autocomplete="off";
    hidden_FileInput.placeholder="load a ttl File";

    var loaderSolutionPathNode=d3.select(hidden_FileInput);
    var fileElement;
    var fileName;
    var readText;
    // simulate click event;
    hidden_FileInput.click();
    // tell what to do when clicked
    // chrome fix -.-
    loaderSolutionPathNode.on("change",function (){
        var files= loaderSolutionPathNode.property("files");
        if (files.length>0){
            console.log("file?"+files[0].name);
            fileElement=files[0];
            fileName=fileElement.name;

            // read this file;

            var formData = new FormData();
            formData.append("ontology" , fileElement);

            var xhr = new XMLHttpRequest();


            xhr.open("POST", "gizMOInput", true);

            var ontologyContent="";

            xhr.onload = function () {


                if (xhr.status === 200) {
                    ontologyContent=xhr.responseText;
                    // the the communication module about this
                     console.log("have read Converted Ontology text");

                    _callback(fileName,ontologyContent);
                }
            };

            // check what this thing is doing;

            xhr.send(formData);
            console.log("Sent Request");
            loaderSolutionPathNode.remove();

        }
    });
};
instance.loadNotationFromJSONFile=function(_callback){

    var hidden_FileInput=document.createElement('input');
    hidden_FileInput.id="HIDDEN_FILE_JSON_INPUT";
    hidden_FileInput.type="file";
    hidden_FileInput.accept = ".json , .ttl";
    //hidden_solutionInput.style.display="none";
    hidden_FileInput.autocomplete="off";
    hidden_FileInput.placeholder="load a json File";

    var loaderSolutionPathNode=d3.select(hidden_FileInput);
    var fileElement;
    var fileName;
    var readText;
    // simulate click event;
    hidden_FileInput.click();
    // tell what to do when clicked
    // chrome fix -.-
    loaderSolutionPathNode.on("change",function (){
        //  console.log("a change oO ");
        var files= loaderSolutionPathNode.property("files");
        if (files.length>0){
            // console.log("file?"+files[0].name);
            fileElement=files[0];
            fileName=fileElement.name;
            // read this file;
            if (fileElement.name.endsWith(".json")) {
                console.log("Loading Notation as JSON FILE");
                var reader = new FileReader();
                reader.readAsText(fileElement);
                reader.onload = function () {
                    readText = reader.result;
                    // the the communication module about this
                    //  console.log("have read the text");
                    //  console.log(readText);
                    _callback(fileName, readText)
                };
            }
            else{

                var formData = new FormData();
                formData.append("ontology" , fileElement);

                var xhr = new XMLHttpRequest();


                xhr.open("POST", "gizMOInput", true);

                var ontologyContent="";

                xhr.onload = function () {
                    if (xhr.status === 200) {
                        ontologyContent=xhr.responseText;
                        // the the communication module about this
                        console.log("have read Converted Ontology text");
                        _callback(fileName,ontologyContent);
                    }
                };
                xhr.send(formData);
            }
        }
    });




};

instance.saveOntologyAsJSON=function(filename){

    console.log("want to save the ontology" + filename);

    // string the ontology it self;

    var ontologyStr='{\n';
    ontologyStr+='"_comment":"Exported with WebVOWL Api (v3.version 0.0.1 )", \n';
    // add ontology meta inforamtion in for of the header;
    console.log("Getting Views");
    ontologyStr+=instance.apiCore.graph.getAllViewDefinitions();
    console.log("Getting MetaInformation");
    ontologyStr+=instance.apiCore.graph.getMetaInformation().exportAsJson();
    console.log("getting Class Definitions");

    ontologyStr+=",\n"+instance.apiCore.graph.getClassDefinitions();
    console.log("getting Class Attributes");
    ontologyStr+=",\n"+instance.apiCore.graph.getClassAttributes();
    console.log("getting Poperty descriptions");
    ontologyStr+=",\n"+instance.apiCore.graph.getPropertyDefinitions();
    console.log("getting Property attributes");
    ontologyStr+=",\n"+instance.apiCore.graph.getPropertyAttributes();
    ontologyStr+="\n}"; // close the object

    console.log("Done");



    // write that thing
    var dataURI = "data:text/json;charset=utf-8," + encodeURIComponent(ontologyStr);

    // get the hidden exporter button
    var exporterButton=instance.apiCore.getHiddenExporterButton();
    exporterButton.attr("href", dataURI)
        .attr("download", filename );
exporterButton.node().click();







};





module.exports = genericLoader.Instance;