// The Generic loader provides loading functionallities like triggering o2v and simply loading json files
// that are in vowl.


// this then triggers the parser which creates the nodes and properties, and their connections..





var genericParser={};

genericParser.Instance=undefined;


genericParser.createParser=function(){
    // singleton!
    if (genericParser.Instance)
        return genericParser.Instance;
    else {
        genericParser.Instance={};
        return genericParser.Instance;
    }
};
var instance=genericParser.createParser();

var TypeNodeConstructor =require("../dataStructure/tNode");
var TypePropertyConstructor =require("../dataStructure/tProperty");
var LinkConstructor =require("../dataStructure/tLink");
var OntolgyInfoConstructor =require("../dataStructure/tOntology");

instance.parseOWL2VOWL=function(jsonOBJ){


    // clear the old instanceData
    instance.Data={};
    instance.Data.nodes=[];
    instance.Data.properties=[];
    instance.Data.ontologyInformation=undefined;
    instance.Data.viewerInformation=undefined;

    if (jsonOBJ.header){
        //create an info obj;
        var head=jsonOBJ.header;
        var oi=new OntolgyInfoConstructor();
        if (head.languages){ oi.languages(head.languages); }
        if (head.baseIris){ oi.baseIrirs(head.baseIris); }
        if (head.title){ oi.title(head.title); }
        if (head.iri){ oi.iri(head.iri); }
        if (head.version){ oi.version(head.version); }
        if (head.author){ oi.author(head.author); }
        if (head.description){ oi.description(head.description); }
        if (head.labels){ oi.labels(head.labels); }
        if (head.other){ oi.otherInformation(head.other); }
        if (head.prefixList){ oi.prefixList(head.prefixList); }

        // assign data to instance
        instance.Data.ontologyInformation=oi;
    }

    // if (jsonOBJ.viewDefinitions){
    //     //create an info obj;
    //     // var viewDefs='{ "viewDefinitions" :'+JSON.stringify(jsonOBJ.viewDefinitions)+'}';
    //     // console.log(viewDefs);
    //     // var viewDefsAsJsonObj=JSON.parse(viewDefs);
    //     // assign data to instance
    //     instance.Data.viewerInformation=jsonOBJ.viewDefinitions;
    // }

    //
    // instance.Data.ontologyInformation.showInformation();
    // var headerStr=instance.Data.ontologyInformation.exportAsJson();
    // console.log(headerStr);


    // parse some nodes ;
    var classDefinitions=jsonOBJ.class;
    var classAttributes=jsonOBJ.classAttribute;

    var propertyDefinitions=jsonOBJ.property;
    var propertyAttributes=jsonOBJ.propertyAttribute;

    // create typeMap
    var class_typeMap=[];
    var class_idMap=[];
    var property_typeMap=[];

    var i;
    var numElements=classDefinitions.length;
    console.log("found "+numElements+" classes");
    for (i=0;i<numElements;i++){
        class_typeMap[classDefinitions[i].id]=classDefinitions[i].type;
    }
    numElements=propertyDefinitions.length;
    console.log("found "+numElements+" properties");
    for (i=0;i<numElements;i++){
        property_typeMap[propertyDefinitions[i].id]=propertyDefinitions[i].type;
    }

    // console.log("Class Map");
    // console.log(class_typeMap);
    //
    //
     console.log("Property Map");
     console.log(property_typeMap);

    numElements=classAttributes.length;
    var element;
    for (i=0;i<numElements;i++){
        var nodeStructure=new TypeNodeConstructor();
        element=classAttributes[i];
        nodeStructure.id(element.id)
            .label(element.label)
            .iri(element.iri)
            .baseIri(element.baseIri)
            .type(class_typeMap[element.id]);

        instance.Data.nodes.push(nodeStructure);
        class_idMap[nodeStructure.id()]=nodeStructure; // used for property linking
    }

    numElements=propertyAttributes.length;
    var linkMap={};
    for (i=0;i<numElements;i++){
        var propertyStructure=new TypePropertyConstructor();
        element=propertyAttributes[i];
        propertyStructure.id(element.id);
        propertyStructure.label(element.label);
        if (element.iri===undefined){
            // try to find it via type
            var t=property_typeMap[element.id];
            if (t.toLowerCase()==="rdfs:subclassof"){
                element.iri="http://www.w3.org/2000/01/rdf-schema#subClassOf";
            }
        }
        propertyStructure.iri(element.iri);
     //   console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"+element.iri+" >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        propertyStructure.baseIri(element.baseIri);
        propertyStructure.type(property_typeMap[element.id]);

        // extract domain and range;
        var domId=element.domain;
        var rangeId=element.range;

        var domObj=class_idMap[domId];
        var ranObj=class_idMap[rangeId];
        propertyStructure.domain(domObj);
        propertyStructure.range(ranObj);

        if (domObj===ranObj){
            propertyStructure.isLoop(true);
            domObj.addLoopProperty(propertyStructure);
        }

        var isDt=false;
        if (property_typeMap[element.id].toLowerCase()==="owl:dataTypeProperty".toLowerCase()){
            domObj.addDatatypeProperty(propertyStructure);
            isDt=true;
        }

        if (isDt===false && domObj!==ranObj){
            // stores for smart expanding the direct friends
            domObj.addObjectProperty(propertyStructure);
            ranObj.addObjectProperty(propertyStructure)
        }

        var dmRange=propertyStructure.getDomRanId(domId,rangeId);
        if (linkMap[dmRange]===undefined) {
            var linkStructure = new LinkConstructor();
            if (domObj===ranObj){
                linkStructure.isLoop(true);
            }
            linkStructure.isDatatype(isDt);


            linkStructure.binderId(dmRange);
            linkStructure.addProperty(propertyStructure);
            linkStructure.domain(propertyStructure.domain());
            linkStructure.range(propertyStructure.range());
            propertyStructure.setLinkStructure(linkStructure);
            linkMap[dmRange]=linkStructure;
        }else {
            linkMap[dmRange].addProperty(propertyStructure);
            propertyStructure.setLinkStructure(linkMap[dmRange]);
        }
        console.log(propertyStructure.type());
        instance.Data.properties.push(propertyStructure);
    }
    //
    // console.log("LINK DEFINITIONS ********************************");
    // for (var tLink in linkMap){
    //     if (linkMap.hasOwnProperty(tLink)) {
    //         console.log(linkMap[tLink].toString());
    //     }
    // }
    // console.log("LINK DEFINITIONS ^^^^^^^");
    instance.Data.linkMap=linkMap;

    // // show current state;
    // for (i=0;i<instance.Data.nodes.length;i++){
    //     console.log("Node has ID:"     +instance.Data.nodes[i].id());
    //     console.log("Node has IRI:"    +instance.Data.nodes[i].iri());
    //     console.log("Node has Label "  +instance.Data.nodes[i].label());
    //     console.log("Node has Type "   +instance.Data.nodes[i].type());
    //     console.log("Node has BaseIRI" +instance.Data.nodes[i].baseIri());
    // }




    if (jsonOBJ.gizmoAnnotations){
        //TODO : read a gizmo instance when provided in ontology
        var gizmo=jsonOBJ.gizmoAnnotations;
        console.log("Found GizMO Annotations");
        console.log("Gizmo Ontology: "+ gizmo);


        // lets create a map

        // group elements by their iri;
        var annotationMap={};
        var annotationTypes={};
        for (var g=0;g<gizmo.length;g++){

            var aO=gizmo[g];
            var aO_iri=aO.iri;

            // extract base;
            var base=aO_iri.split("#")[0];
            if (!annotationMap.hasOwnProperty(base)){
                annotationMap[base]=[];

                annotationTypes[base]="unknown";
            }
            annotationMap[base].push(aO);

        }

        // identify type of annotations;
        var annoObjName;
        var aObj;
        for (annoObjName in annotationMap){
            if (annotationMap.hasOwnProperty(annoObjName)){

                 aObj=annotationMap[annoObjName];

                // identify its type;

                for (var q=0;q<aObj.length;q++) {
                    var itsAnnotations = aObj[q].annotations;
                    // 1 Views;
                    if (itsAnnotations.objectElement ||
                        itsAnnotations.predicateElement||
                        itsAnnotations.subjectElement
                         ) {
                        annotationTypes[annoObjName] = "view";
                    }
                    // 2 Specifications;
                    if (itsAnnotations.providesNotation || itsAnnotations.providesView  ){
                        annotationTypes[annoObjName] = "specification";
                    }
                    // 2 Specifications;
                    if (itsAnnotations.renderingType ){
                        annotationTypes[annoObjName] = "notation";
                    }
                }
            }
        }


        // parse Specific Annotations;
        instance.Data.annotationMap=annotationMap;
        instance.Data.annotationTypes=annotationTypes;


    }





    return instance.Data;

};



module.exports = genericParser.Instance;