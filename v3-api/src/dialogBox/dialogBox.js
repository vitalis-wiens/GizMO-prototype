var g_dialogboxId=0;
module.exports = (function () {
    var DialogBox= function (wapi) {
        var that=this,
            wapi_ptr=wapi,
            id="dialogBox_"+g_dialogboxId++;

        var titleElement;
        var box,dialog;

        this.setTitle=function(val){
            titleElement.node().innerHTML=val;
        };

        this.cleanUp=function(){
            box.remove();
            dialog.remove();
        };




        this.initialize=function(type){

            if (type==="specification")
                initializeSpecificationDialogBox();

            if (type==="appendView")
                initializeAppendViewDialogBox();

            if (type==="container")
                initializeContainerDialogBox();




        };

        function verifyNotationURL(iri, loadSpan, textNode,cbx_node){

            // TODO : server side script to ping if URL exists;

            // otherwise CORS -.-

            loadSpan.classed("hidden",true);
            textNode.style("color","red");
            textNode.node().title="Could not find Notation under URL , using EXPLICIT notation import";

            // d3.xhr(iri, "application/text", function (error, request) {
            //
            //     console.log(error);
            //     console.log(request);
            //
            // });


        }

        function initializeAppendViewDialogBox(){
            var parentDiv=wapi.getCanvasId();
            var d3Node=d3.select("#"+parentDiv);

            box=d3Node.append('div');
            box.style("position","absolute");
            box.style("width","100%");
            box.style("height","100%");
            box.style("top","0");
            box.style("opacity","0.5");
            box.style("background","black");


            dialog=d3Node.append("div");
            dialog.style("position","absolute");
            dialog.style("top","0");
            dialog.style("left","25%");
            dialog.style("width","50%");
            dialog.style("height","50%");
            dialog.style("background","#18202A");
            dialog.style("color","white");

            titleElement=dialog.append('h2');
            titleElement.style("text-align","center");

            titleElement.node().innerHTML="test";

            var views=wapi.graph.getViews();
            console.log("found "+ views.length+ " views");

            var viewIndex=views.length;

            /** specification iri **/

            var viewTitle=dialog.append('h3');
            viewTitle.node().innerHTML="View Prefix and IRI";
            viewTitle.style("margin",0);
            dialog.append('br');
            var view_iriLabel=dialog.append("label");
            view_iriLabel.node().innerHTML="IRI: ";

            var view_iriInput=dialog.append("input");
            view_iriInput.node().value="http://example.org/view_"+viewIndex;
            view_iriInput.node().id="input_iri_view";
            dialog.append('br');
            var view_prefixLabel=dialog.append("label");
            view_prefixLabel.node().innerHTML="Prefix: ";
            var view_prefixInput=dialog.append("input");
            view_prefixInput.node().value="view_"+viewIndex;
            view_prefixInput.node().id="input_prefix_view";



            var nIri;
            var notTitle=dialog.append('h3');
            notTitle.node().innerHTML="Currently Used Notation ";
            notTitle.style("margin",0);
            dialog.append('br');
            var notationUsed=wapi.graph.currentlyUsedNotation();
            var notations=wapi.graph.getNotationArray();
            if (notations.length===0){
                var warning=dialog.append("label");
                warning.style("color","red");
                warning.node().innerHTML="warning no notations found";
            }

            for (var i=0;i<notations.length;i++) {
                if (notationUsed.localeCompare(notations[i].header.iri)!==0) continue;
                var n_iDiv=dialog.append('div');
                var cbx_useNotation=n_iDiv.append('input');
                cbx_useNotation.node().type="checkbox";
                cbx_useNotation.node().id="cbx_viewUsesNotation";
                var tx=n_iDiv.append('span');
                cbx_useNotation.node().checked=true;
                nIri=notations[i].header.iri;
                var nPrefix=wapi.graph.getOntologyPrefixFromPrefixList(notations[i]);

                tx.node().innerHTML="View shall use Notation : " +nPrefix+"  -> "+nIri ;
                // verify if notation is public available;

                var v_div=dialog.append("div");
                var temp=v_div.append('span');
                temp.node().innerHTML=" ->   ";
                v_div.node().id="view_verificationNotationDiv";
                var cbx_implicit=v_div.append('input');
                cbx_implicit.node().type="checkbox";
                cbx_implicit.node().id="cbx_useImportOfNotation";

                var tx_imp=v_div.append('span');
                tx_imp.node().innerHTML="Import notation using owl:imports";
                tx_imp.style("color","yellow");
                // cbx_implicit.node().disabled=true;

                var loadSpan=v_div.append('h3');
                loadSpan.node().innerHTML="&#8635";
                loadSpan.node().id="verifyingNotation";
                loadSpan.classed("spin",true);

                verifyNotationURL(nIri,loadSpan,tx_imp,cbx_implicit);
                cbx_useNotation.on("click",function(){
                    d3.select("#view_verificationNotationDiv").classed("hidden",!this.checked);
                })


            }
          //  veryfyNotationsURL(notations);




            // buttons
            var exportButton, cancelButton;
            var finishButtonsDiv=dialog.append('div');
            finishButtonsDiv.style("position","absolute");
            finishButtonsDiv.style("right","0");
            finishButtonsDiv.style("padding","10px");

            exportButton=finishButtonsDiv.append('button');
            exportButton.node().type="button";
            exportButton.node().innerHTML="Append";

            cancelButton=finishButtonsDiv.append('button');
            cancelButton.node().type="button";
            cancelButton.node().innerHTML="Cancel";

            // connect
            cancelButton.on("click",function(){
                // close this one;
                wapi.removeDialogBox();
            });

            exportButton.on("click",function () {
                var viewPrefix = d3.select("#input_prefix_view").node().value;
                var viewURL = d3.select("#input_iri_view").node().value;
                var viewNotation=undefined;
                var usesImportedNotation=false;
                if (d3.select("#cbx_viewUsesNotation").node().checked===true) {
                    viewNotation = nIri;
                }
                usesImportedNotation= d3.select("#cbx_useImportOfNotation").node().checked;

                if (wapi.graph.appendView(viewPrefix, viewURL,viewNotation,usesImportedNotation) === true){
                    wapi.removeDialogBox();
                }
            });

        }


        function initializeContainerDialogBox(){
            var parentDiv=wapi.getCanvasId();
            var d3Node=d3.select("#"+parentDiv);
            var i;
            box=d3Node.append('div');
            box.style("position","absolute");
            box.style("width","100%");
            box.style("height","100%");
            box.style("top","0");
            box.style("opacity","0.5");
            box.style("background","black");

            var cbx_array_notations=[];
            var cbx_array_views=[];
            var showHideElements=[];
            dialog=d3Node.append("div");
            dialog.style("position","absolute");
            dialog.style("top","0");
            dialog.style("left","25%");
            dialog.style("width","50%");
            dialog.style("height","50%");
            dialog.style("background","#18202A");
            dialog.style("color","white");
            dialog.style("overflow","auto");

            titleElement=dialog.append('h2');
            titleElement.style("text-align","center");

            titleElement.node().innerHTML="test";

            /** specification iri **/

            var specTitle=dialog.append('h3');
            specTitle.node().innerHTML="Set export type";
            specTitle.style("margin",0);
            dialog.append('br');

            var n_iDiv=dialog.append('div');
            var cbx_explicit=n_iDiv.append('input');
            cbx_explicit.node().type="checkbox";
            cbx_explicit.node().id="multiFileContainer_cbx";
            cbx_explicit.node().checked=true;
            // cbx_explicit.node().disabled=true;
            var label_cbx=n_iDiv.append('span');
            label_cbx.node().innerHTML="Separated Files";


            // connect the cbx_explicit button;

            cbx_explicit.on("click",function(){
                for (var i=0;i<showHideElements.length;i++){
                    showHideElements[i].classed("hidden",!this.checked);
                }
                d3.selectAll(".showContentButton").classed("hidden",!this.checked);
            });


            var ontologyIri=wapi.graph.getMetaInformation().iri();


            var main_Div=dialog.append('div');
            var cbx_main=main_Div.append('input');
            cbx_main.node().type="checkbox";
            cbx_main.node().id="mainOntology_cbx";
            cbx_main.node().checked=true;
            cbx_main.node().disabled=true;
            var label_main_cbx=main_Div.append('span');
            label_main_cbx.node().innerHTML="Main Ontology -> "+ontologyIri;

            // get ontology information;
            main_Div.append('br');
            // get suggestedFileName;
            var prList=wapi.graph.getMetaInformation().prefixList();
            var suggested_fileName=wapi.graph.getOntologyPrefixFromPrefixList_and_iri(prList,ontologyIri);

            // create FileName Input

            var main_fileNameLabel=main_Div.append("label");
            main_fileNameLabel.node().innerHTML="Filename: ";
            var main_fileNameInput=main_Div.append("input");
            main_fileNameInput.node().value=suggested_fileName+".ttl";
            main_fileNameInput.node().id="main_fileNameInput";
            var show_main_content=main_Div.append('button');
            show_main_content.node().type="button";
            show_main_content.node().innerHTML="Show Content";
            // connect
            showHideElements.push(main_fileNameLabel);
            showHideElements.push(main_fileNameInput);
            showHideElements.push(show_main_content);

            main_Div.append('br');


            show_main_content.on("click",function(){
                console.log("want to show the content of the main File ! ");
                var text_debugElement=main_Div.append("div");

                var tI=text_debugElement.append("textarea");
                tI.node().rows="4";
                tI.node().cols="50";
                var close_main_content=text_debugElement.append('button');
                close_main_content.node().type="button";
                close_main_content.node().innerHTML="Close";
                close_main_content.on("click",function() {
                    console.log("removing text area");
                    text_debugElement.remove();
                });
                var ontoTTL=wapi.graph.getMainOntology_AsTTL();
                tI.node().value=ontoTTL;
            });




            // // create specification :
            //
             var q_spec_Div=dialog.append('div');
            // var spec_Title=q_spec_Div.append('h3');
            // spec_Title.node().innerHTML="Specification Options";
            // spec_Title.style("margin",0);
            // q_spec_Div.append('br');
            //
            // var spec_iriLabel=q_spec_Div.append("label");
            // spec_iriLabel.node().innerHTML="IRI: ";
            //
            // var spec_iriInput=q_spec_Div.append("input");
            // spec_iriInput.node().value="http://example.org/"+suggested_fileName+"_specification_0#";
            // spec_iriInput.node().id="input_iri_specification";
            // q_spec_Div.append('br');
            // var spec_prefixLabel=q_spec_Div.append("label");
            // spec_prefixLabel.node().innerHTML="Prefix: ";
            // var spec_prefixInput= q_spec_Div.append("input");
            // spec_prefixInput.node().value=suggested_fileName+"_specification_0";
            // spec_prefixInput.node().id="input_prefix_specification";
            // q_spec_Div.append('br');
            // var showSpecDiv=q_spec_Div.append('div');
            // var show_spec_content=showSpecDiv.append('button');
            //
            // show_spec_content.node().type="button";
            // show_spec_content.node().innerHTML="Show Content";
            // // connect
            // showHideElements.push(show_spec_content);
            //
            //
            //
            //
            // show_spec_content.on("click",function(){
            //     console.log("want to show the content of the Spec File ! ");
            //     var text_debugElement=showSpecDiv.append("div");
            //
            //     var tI=text_debugElement.append("textarea");
            //     tI.node().rows="4";
            //     tI.node().cols="50";
            //     var close_spec_content=text_debugElement.append('button');
            //     close_spec_content.node().type="button";
            //     close_spec_content.node().innerHTML="Close";
            //     close_spec_content.on("click",function() {
            //         console.log("removing text area");
            //         text_debugElement.remove();
            //     });
            //
            //     tI.node().value="wannt to show spec file";
            //
            //     // needs to create own prefixList;
            //
            //
            //     tI.node().value=getSpecificationContent(cbx_array_notations,cbx_array_views);
            //
            //
            // });


            var notations=wapi.graph.getNotationArray();
            var views=wapi.graph.getViews();

            console.log("Found "+notations.length +"notations");
            console.log("Found "+views.length +"views");

            var notations_Title=q_spec_Div.append('h4');
            notations_Title.node().innerHTML="Provided Notations : (#"+notations.length+")";
            notations_Title.style("margin",0);
            q_spec_Div.append('br');

            for ( i=0;i<notations.length;i++) {
                var notation_iDiv=q_spec_Div.append('div');
                notation_iDiv.node().id="notation_iDiv"+i;
                var cbx_useNotation=notation_iDiv.append('input');
                cbx_useNotation.node().type="checkbox";
                cbx_useNotation.node().index=i;

                cbx_useNotation.node().id="providedNotation"+i;
                cbx_array_notations.push(cbx_useNotation);







                var tx=notation_iDiv.append('span');

                var nIri=notations[i].header.iri;
                var nPrefix=wapi.graph.getOntologyPrefixFromPrefixList(notations[i]);
                cbx_useNotation.node().notation=nIri;
                tx.node().innerHTML="Notation : " +nPrefix+"  -> "+nIri ;



                 cbx_useNotation.on("click",function(){

                     if (this.checked===false) {
                         // remove
                           var od=d3.select("#notation_iDiv"+this.index+"_other");
                           od.remove();
                     }else {
                         if (d3.select("#multiFileContainer_cbx").node().checked === true) {


                             var elementDiv = d3.select("#notation_iDiv" + this.index);
                             var otherDiv = elementDiv.append("div");
                             otherDiv.node().id = "notation_iDiv" + this.index + "_other";
                             var show_notation_content = otherDiv.append('button');
                             show_notation_content.node().type = "button";
                             show_notation_content.node().innerHTML = "Show Content";
                             // connect
                             show_notation_content.node().index = this.index;
                             show_notation_content.classed("showContentButton",true);

                             otherDiv.append('br');


                             show_notation_content.on("click", function () {
                                 console.log("want to show the content of the Notation File ! ");
                                 var elementDiv = d3.select("#notation_iDiv" + this.index);
                                 var text_debugElement = elementDiv.append("div");

                                 var tI = text_debugElement.append("textarea");
                                 tI.node().rows = "4";
                                 tI.node().cols = "50";
                                 var close_notation_content = text_debugElement.append('button');
                                 close_notation_content.node().type = "button";
                                 close_notation_content.node().innerHTML = "Close";
                                 close_notation_content.on("click", function () {
                                     console.log("removing text area");
                                     text_debugElement.remove();
                                 });
                                 var notationTTL = wapi.graph.getNotationAsTTL(this.index);
                                 tI.node().value = notationTTL;
                             });
                         }
                     }
                });

                //

            }

            var view_Title=q_spec_Div.append('h4');
            view_Title.node().innerHTML="Provided Views: (#"+views.length+")";
            view_Title.style("margin",0);
            q_spec_Div.append('br');

            for (i=0;i<views.length;i++) {
                var v_iDiv=q_spec_Div.append('div');
                var cbx_useView=v_iDiv.append('input');
                v_iDiv.node().id="view_iDiv"+i;
                cbx_useView.node().type="checkbox";
                cbx_useView.node().index=i;

                cbx_useView.node().id="providedView"+i;
                cbx_array_views.push(cbx_useView);
                var txv=v_iDiv.append('span');




                var vIri=views[i].viewIRI;
                var vPrefix=views[i].viewPrefix;
                var usedNotation=views[i].viewNotation;

                cbx_useView.node().notation=vIri;
                txv.node().innerHTML="View: " +vPrefix+"  -> "+vIri +"<br>" +
                    " -> -> View uses Notation : "+ usedNotation ;


                cbx_useView.on("click",function(){

                    if (this.checked===false) {
                        // remove
                        var od=d3.select("#view_iDiv"+this.index+"_other");
                        od.remove();
                    }else{
                        if (d3.select("#multiFileContainer_cbx").node().checked===true) {
                            var elementDiv = d3.select("#view_iDiv" + this.index);
                            var otherDiv = elementDiv.append("div");
                            otherDiv.node().id = "view_iDiv" + this.index + "_other";
                            var show_view_content = otherDiv.append('button');
                            show_view_content.node().type = "button";
                            show_view_content.node().innerHTML = "Show Content";
                            show_view_content.classed("showContentButton",true);
                            // connect
                            show_view_content.node().index = this.index;

                            otherDiv.append('br');


                            show_view_content.on("click", function () {
                                console.log("want to show the content of the View File ! ");
                                var elementDiv = d3.select("#view_iDiv" + this.index);
                                var text_debugElement = elementDiv.append("div");

                                var tI = text_debugElement.append("textarea");
                                tI.node().rows = "4";
                                tI.node().cols = "50";
                                var close_notation_content = text_debugElement.append('button');
                                close_notation_content.node().type = "button";
                                close_notation_content.node().innerHTML = "Close";
                                close_notation_content.on("click", function () {
                                    console.log("removing text area");
                                    text_debugElement.remove();
                                });
                                var viewTTL = wapi.graph.getViewAsTTL(this.index);
                                tI.node().value = viewTTL;
                            });
                        }
                    }
                });
            }



            // Container Options;

            // create specification :

            var container_Div=dialog.append('div');
            var container_Title=container_Div.append('h3');
            container_Title.node().innerHTML="Container Options";
            container_Title.style("margin",0);
            container_Div.append('br');

            var container_iriLabel=container_Div.append("label");
            container_iriLabel.node().innerHTML="IRI: ";

            var container_iriInput=container_Div.append("input");
            container_iriInput.node().value="http://example.org/"+suggested_fileName+"_container_0#";
            container_iriInput.node().id="input_iri_container";
            container_Div.append('br');
            var container_prefixLabel=container_Div.append("label");
            container_prefixLabel.node().innerHTML="Prefix: ";
            var container_prefixInput= container_Div.append("input");
            container_prefixInput.node().value=suggested_fileName+"_container_0";
            container_prefixInput.node().id="input_prefix_container";
            container_Div.append('br');
            var showcontainerDiv=container_Div.append('div');
            var show_container_content=showcontainerDiv.append('button');

            show_container_content.node().type="button";
            show_container_content.node().innerHTML="Show Content";
            showHideElements.push(show_container_content);

            show_container_content.on("click",function(){
                console.log("want to show the content of the Container File ! ");
                var text_debugElement=showcontainerDiv.append("div");

                var tI=text_debugElement.append("textarea");
                tI.node().rows="4";
                tI.node().cols="50";
                var close_spec_content=text_debugElement.append('button');
                close_spec_content.node().type="button";
                close_spec_content.node().innerHTML="Close";
                close_spec_content.on("click",function() {
                    console.log("removing text area");
                    text_debugElement.remove();
                });

                tI.node().value="wannt to show Container file";

                // needs to create own prefixList;
                var containerString=getContainerContent(ontologyIri,cbx_array_notations,cbx_array_views);
                tI.node().value=containerString;


            });






            // buttons
            var exportButton, cancelButton;
            var finishButtonsDiv=dialog.append('div');
            finishButtonsDiv.style("position","absolute");
            finishButtonsDiv.style("right","0");
            finishButtonsDiv.style("padding","10px");

            exportButton=finishButtonsDiv.append('button');
            exportButton.node().type="button";
            exportButton.node().innerHTML="Export";

            cancelButton=finishButtonsDiv.append('button');
            cancelButton.node().type="button";
            cancelButton.node().innerHTML="Cancel";

            // connect
            cancelButton.on("click",function(){
                // close this one;
                wapi.removeDialogBox();
            });


            // connect the export button;

            exportButton.on("click",function(){
                var i;
                if (d3.select("#multiFileContainer_cbx").node().checked===true) {
                    // #main ontology;
                    var mainFile = d3.select("#main_fileNameInput").node().value;
                    var mainFileContent = wapi.graph.getMainOntology_AsTTL(true);

                    var containerFileName = "gizmoContaier.ttl";
                    var containerContent = getContainerContent(ontologyIri, cbx_array_notations, cbx_array_views,true);


                    // var specificationFileName = "gizmoSpecification.ttl";
                    // var specificationContent = getSpecificationContent(cbx_array_notations, cbx_array_views,true);



                    var notationFileNameArray = [];
                    var notationContentArray = [];
                    var viewFileNameArray = [];
                    var viewContentArray = [];
                    for (i = 0; i < cbx_array_notations.length; i++) {
                        if (cbx_array_notations[i].node().checked === true) {
                            notationFileNameArray.push("notation_" + i + ".ttl");
                            notationContentArray.push(wapi.graph.getNotationAsTTL(i,true));

                        }
                    }
                    for (i = 0; i < cbx_array_views.length; i++) {
                        if (cbx_array_views[i].node().checked === true) {
                            viewFileNameArray.push("view_" + i + ".ttl");
                            viewContentArray.push(wapi.graph.getViewAsTTL(i,true));
                        }
                    }


                    // jsZip
                    var zip = new wapi.zipModule();
                    zip.file(mainFile, mainFileContent);
                    zip.file(containerFileName, containerContent);
              //      zip.file(specificationFileName, specificationContent);

                    for (i = 0; i < notationFileNameArray.length; i++) {
                        zip.file(notationFileNameArray[i], notationContentArray[i]);

                    }
                    for (i = 0; i < viewFileNameArray.length; i++) {
                        zip.file(viewFileNameArray[i], viewContentArray[i]);

                    }

                    //
                    // zip.generateAsync({type:"base64"}).then(function (base64) {
                    //     location.href="data:application/zip;base64," + base64;
                    // });


                    zip.generateAsync({type: "blob"})
                        .then(function (blob) {
                            wapi.FileSaver.saveAs(blob, "hello.zip");
                        });
                }
                else{

                    // create combined prefix definitions;

                    //1] main prefixList;
                    var main_pl=wapi.graph.getMetaInformation().prefixList();
                    var spec_pl={};
                    spec_pl.gizmo="http://visualdataweb.org/ontologies/gizmo-core#";

                    // var specPrefix=d3.select("#input_prefix_specification").node().value;
                    // var specPrefix_IRI=d3.select("#input_iri_specification").node().value;
                    // spec_pl[specPrefix]=specPrefix_IRI;

                    var totalPrefixList={};
                    var name;
                    for ( name in main_pl ){
                        if (main_pl.hasOwnProperty(name)){
                            totalPrefixList[name]=main_pl[name];
                        }
                    }
                    for ( name in spec_pl){
                        if (spec_pl.hasOwnProperty(name)){
                            totalPrefixList[name]=spec_pl[name];
                        }
                    }
                    // notations;
                    for ( i=0;i<cbx_array_notations.length;i++){
                        if (cbx_array_notations[i].node().checked===true){
                            var notation_pl=wapi.graph.getNotationPrefixList(i);
                            for ( name in notation_pl){
                                if (notation_pl.hasOwnProperty(name)){
                                    totalPrefixList[name]=notation_pl[name];
                                }
                            }
                        }
                    }
                    // views;
                    for ( i=0;i<cbx_array_views.length;i++){
                        if (cbx_array_views[i].node().checked===true){
                            var view_pl=wapi.graph.getViewPrefixList(i);
                            for ( name in view_pl){
                                if (view_pl.hasOwnProperty(name)){
                                    totalPrefixList[name]=view_pl[name];
                                }
                            }
                        }
                    }


                    // add ContainerPrefix

                    var containerPrefix=d3.select("#input_prefix_container").node().value;
                    var containerPrefix_IRI=d3.select("#input_iri_container").node().value;
                    totalPrefixList[containerPrefix]=containerPrefix_IRI;
                    var container_IRI=d3.select("#input_iri_container").node().value;

                    if (container_IRI.endsWith("#")){
                        container_IRI=container_IRI.substring(0,container_IRI.length-1);
                    }

                    var singleFileContainerString="";
                    // Write all prefixes;

                    singleFileContainerString += "######### PREFIX DEFINITIONS ###########\n";
                    for (var name in totalPrefixList) {
                        if (totalPrefixList.hasOwnProperty(name)) {
                            singleFileContainerString += "@prefix " + name + ": <" + totalPrefixList[name] + "> .\n";
                        }
                    }

                    // define the container Ontology;
                    singleFileContainerString+="\n############# GIZMO CONTAINER DEFINITION  #############\n";
                    singleFileContainerString+="<"+container_IRI+"> rdf:type owl:Ontology .";

                    // create main ontology;
                    singleFileContainerString+= wapi.graph.getMainOntology_AsTTL(false);

                    singleFileContainerString+= getSpecificationContent(cbx_array_notations, cbx_array_views,false);


                    // notations;
                    var nI=1;
                    for ( i=0;i<cbx_array_notations.length;i++){
                        if (cbx_array_notations[i].node().checked===true){
                            singleFileContainerString+="\n############# Notation "+nI+" #############\n\n";
                            singleFileContainerString+=wapi.graph.getNotationAsTTL(i,false);
                            nI++;
                        }
                    }
                    // views;
                    nI=1;
                    for ( i=0;i<cbx_array_views.length;i++){
                        if (cbx_array_views[i].node().checked===true){
                            singleFileContainerString+="\n############# View "+nI+" #############\n\n";
                            singleFileContainerString+=wapi.graph.getViewAsTTL(i,false);
                            nI++;
                        }
                    }

                    console.log(singleFileContainerString);
                    var blob = new Blob([singleFileContainerString], {type: 'text'});
                    wapi.FileSaver.saveAs(blob, "SingleFileContainer.ttl");

                }
            });





        }


        function getSpecificationContent(cbx_array_notations,cbx_array_views,exportPrefixDef_andOntologyDec){
            //  var specificationString="";
            // var prefixList=wapi.graph.getMetaInformation().prefixList();
            // prefixList.gizmo="http://visualdataweb.org/ontologies/gizmo-core#";
            //
            // var specPrefix=d3.select("#input_prefix_specification").node().value;
            // var specPrefix_IRI=d3.select("#input_iri_specification").node().value;
            // var spec_IRI=d3.select("#input_iri_specification").node().value;
            //
            // if (spec_IRI.endsWith("#")){
            //     spec_IRI=spec_IRI.substring(0,spec_IRI.length-1);
            // }
            //
            // if (exportPrefixDef_andOntologyDec===true) {
            //     prefixList[specPrefix] = specPrefix_IRI;
            //
            //     specificationString += "######### PREFIX DEFINITIONS ###########\n";
            //     for (var name in prefixList) {
            //         if (prefixList.hasOwnProperty(name)) {
            //             specificationString += "@prefix " + name + ": <" + prefixList[name] + "> .\n";
            //         }
            //     }
            //
            //     specificationString += "\n<" + spec_IRI + "> rdf:type owl:Ontology .\n";
            // }
            //
            // // el special indivudal ;
            // var individual="############ Specification Definition Individual ###########";
            // individual+="\n"+specPrefix+":specIndividual rdf:type owl:NamedIndividual;\n";
            // var i;
            // for (i=0;i<cbx_array_notations.length;i++){
            //     var cb=cbx_array_notations[i];
            //     if (cb.node().checked===true){
            //         // append
            //         console.log(cb.node().notation);
            //         individual+="\t\t gizmo:providesNotation <"+cb.node().notation+">;\n";
            //     }
            // }
            //
            //
            // for (i=0;i<cbx_array_views.length;i++){
            //     var cb=cbx_array_views[i];
            //     if (cb.node().checked===true){
            //         // append
            //         console.log(cb.node().notation);
            //         individual+="\t\t gizmo:providesView <"+cb.node().notation+">;\n";
            //     }
            // }
            // individual=individual.substring(0,individual.length-2);
            // specificationString+=individual+" .\n";
            // return specificationString
            return "";
        }

        function getContainerContent(mainOntologyIri,cbx_array_notations,cbx_array_views,exportPrefixDef_andOntologyDec){

            var containerString="";
            var prefixList=wapi.graph.getMetaInformation().prefixList();
            var containerPrefix=d3.select("#input_prefix_container").node().value;
            var containerPrefix_IRI=d3.select("#input_iri_container").node().value;
            var container_IRI=d3.select("#input_iri_container").node().value;

            if (container_IRI.endsWith("#")){
                container_IRI=container_IRI.substring(0,container_IRI.length-1);
            }

            prefixList[containerPrefix]=containerPrefix_IRI;

            if (exportPrefixDef_andOntologyDec===true) {
                containerString += "######### PREFIX DEFINITIONS ###########\n";
                for (var name in prefixList) {
                    if (prefixList.hasOwnProperty(name)) {
                        containerString += "@prefix " + name + ": <" + prefixList[name] + "> .\n";
                    }
                }

                containerString += "\n<" + container_IRI + "> rdf:type owl:Ontology ;\n";
                containerString += "\t\t owl:imports <" + mainOntologyIri + ">;\n";

                var i;
                for (i = 0; i < cbx_array_notations.length; i++) {
                    var cb = cbx_array_notations[i];
                    if (cb.node().checked === true) {
                        // append
                        console.log(cb.node().notation);
                        containerString += "\t\t owl:imports <" + cb.node().notation + ">;\n";
                    }
                }


                for (i = 0; i < cbx_array_views.length; i++) {
                    var cb = cbx_array_views[i];
                    if (cb.node().checked === true) {
                        // append
                        console.log(cb.node().notation);
                        containerString += "\t\t owl:imports <" + cb.node().notation + ">;\n";
                    }
                }
                containerString = containerString.substring(0, containerString.length - 2);
                containerString += " .\n";
            }
            else{
                containerString += "\n<" + container_IRI + "> rdf:type owl:Ontology ;\n";

            }

            return containerString;

        }

        function initializeSpecificationDialogBox(){
            var parentDiv=wapi.getCanvasId();
            var d3Node=d3.select("#"+parentDiv);

            box=d3Node.append('div');
            box.style("position","absolute");
            box.style("width","100%");
            box.style("height","100%");
            box.style("top","0");
            box.style("opacity","0.5");
            box.style("background","black");


            dialog=d3Node.append("div");
            dialog.style("position","absolute");
            dialog.style("top","0");
            dialog.style("left","25%");
            dialog.style("width","50%");
            dialog.style("height","50%");
            dialog.style("background","#18202A");
            dialog.style("color","white");
            dialog.style("overflow","auto");

            titleElement=dialog.append('h2');
            titleElement.style("text-align","center");

            titleElement.node().innerHTML="test";



            /** specification iri **/

            var specTitle=dialog.append('h3');
            specTitle.node().innerHTML="specification Prefix and IRI";
            specTitle.style("margin",0);
            dialog.append('br');
            var spec_iriLabel=dialog.append("label");
            spec_iriLabel.node().innerHTML="IRI: ";

            var spec_iriInput=dialog.append("input");
            spec_iriInput.node().value="http://example.org/specification_0";
            spec_iriInput.node().id="input_iri_specification";
            dialog.append('br');
            var spec_prefixLabel=dialog.append("label");
            spec_prefixLabel.node().innerHTML="Prefix: ";
            var spec_prefixInput=dialog.append("input");
            spec_prefixInput.node().value="specification_0";
            spec_prefixInput.node().id="input_prefix_specification";

            var notTitle=dialog.append('h3');
            notTitle.node().innerHTML="Export Used Notation ";
            notTitle.style("margin",0);
            dialog.append('br');

            var notations=wapi.graph.getNotationArray();
            if (notations.length===0){
                var warning=dialog.append("label");
                warning.style("color","red");
                warning.node().innerHTML="warning no notations found";
            }

            var cbx_array=[];
            for (var i=0;i<notations.length;i++) {
                var n_iDiv=dialog.append('div');
                var cbx_useNotation=n_iDiv.append('input');
                cbx_useNotation.node().type="checkbox";
                cbx_useNotation.node().index=i;

                cbx_useNotation.node().id="providedNotation"+i;
                cbx_array.push(cbx_useNotation);
                var tx=n_iDiv.append('span');

                var nIri=notations[i].header.iri;
                var nPrefix=wapi.graph.getOntologyPrefixFromPrefixList(notations[i]);
                cbx_useNotation.node().notation=nIri;
                tx.node().innerHTML="Notation : " +nPrefix+"  -> "+nIri ;
                var v_div=dialog.append("div");
                var temp=v_div.append('span');
                temp.node().innerHTML=" ->   ";
                v_div.node().id="view_verificationNotationDiv_"+i;
                var cbx_implicit=v_div.append('input');
                cbx_implicit.node().type="checkbox";
                cbx_implicit.node().id="cbx_useImportOfNotation_"+i;

                var tx_imp=v_div.append('span');
                tx_imp.node().innerHTML="Import notation using owl:imports";
                tx_imp.style("color","yellow");
                // cbx_implicit.node().disabled=true;

                var loadSpan=v_div.append('h3');
                loadSpan.node().innerHTML="&#8635";
                loadSpan.node().id="verifyingNotation";
                loadSpan.classed("spin",true);

                verifyNotationURL(nIri,loadSpan,tx_imp,cbx_implicit);
                cbx_useNotation.on("click",function(){
                    var index=this.index;
                    d3.select("#view_verificationNotationDiv_"+index).classed("hidden",!this.checked);
                })

            }


            // some options;
            var views=wapi.graph.getViews();
            console.log("found "+ views.length+ " views");

            if (views.length===0){
                var emptyViews=dialog.append('div');
                var evTitle=emptyViews.append('h3');
                evTitle.node().innerHTML="No views found, append current visualization as view?";

                var appendView=emptyViews.append('input');
                appendView.node().type="checkbox";

                appendView.node().type="checkbox";
                var tx=emptyViews.append('span');

                tx.node().innerHTML="OKAY";

                var defViewPrefIRI=emptyViews.append("div");
                defViewPrefIRI.node().id="defView_prefixIriDiv";
                defViewPrefIRI.classed("hidden",true);

                var iriLabel=defViewPrefIRI.append("label");
                iriLabel.node().innerHTML="IRI: ";

                var iriInput=defViewPrefIRI.append("input");
                iriInput.node().value="http://example.org/view_0";
                iriInput.node().id="input_iri_view0";
                defViewPrefIRI.append('br');
                var prefixLabel=defViewPrefIRI.append("label");
                prefixLabel.node().innerHTML="Prefix: ";
                var prefixInput=defViewPrefIRI.append("input");
                prefixInput.node().value="view_0";
                prefixInput.node().id="input_prefix_view0";




                    var n_iDiv=defViewPrefIRI.append('div');
                    var cbx_useNotation=n_iDiv.append('input');
                    cbx_useNotation.node().type="checkbox";
                    cbx_useNotation.node().id="cbx_viewUsesNotation";
                    var tx=n_iDiv.append('span');
                    cbx_useNotation.node().checked=true;
                    nIri=wapi.graph.currentlyUsedNotation();
                    var notationObject=wapi.graph.currentlyUsedNotationObject();
                    var nPrefix=wapi.graph.getOntologyPrefixFromPrefixList(notationObject);

                    tx.node().innerHTML="View shall use Notation : " +nPrefix+"  -> "+nIri ;
                    // verify if notation is public available;

                    var v_div=n_iDiv.append("div");
                    var temp=v_div.append('span');
                    temp.node().innerHTML=" ->   ";
                    v_div.node().id="view_verificationNotationDiv";
                    var cbx_implicit=v_div.append('input');
                    cbx_implicit.node().type="checkbox";
                    cbx_implicit.node().id="cbx_useImportOfNotation";

                    var tx_imp=v_div.append('span');
                    tx_imp.node().innerHTML="Import notation using owl:imports";
                    tx_imp.style("color","yellow");
                    // cbx_implicit.node().disabled=true;

                    var loadSpan=v_div.append('h3');
                    loadSpan.node().innerHTML="&#8635";
                    loadSpan.node().id="verifyingNotation";
                    loadSpan.classed("spin",true);

                    verifyNotationURL(nIri,loadSpan,tx_imp,cbx_implicit);
                    cbx_useNotation.on("click",function(){
                        d3.select("#view_verificationNotationDiv").classed("hidden",!this.checked);
                    });

                var singleViewAppend=false;

                appendView.on("change",function(){
                    console.log("append view has changed");
                    console.log(this.checked);
                    if (this.checked===true) {
                        singleViewAppend=true;
                        defViewPrefIRI.classed("hidden", false);
                    }else{
                        singleViewAppend=false;
                        defViewPrefIRI.classed("hidden", true);
                    }
                });

            }


            // buttons
            var exportButton, cancelButton;
            var finishButtonsDiv=dialog.append('div');
            finishButtonsDiv.style("position","absolute");
            finishButtonsDiv.style("right","0");
            finishButtonsDiv.style("padding","10px");

            exportButton=finishButtonsDiv.append('button');
            exportButton.node().type="button";
            exportButton.node().innerHTML="Export";

            cancelButton=finishButtonsDiv.append('button');
            cancelButton.node().type="button";
            cancelButton.node().innerHTML="Cancel";

            // connect
            cancelButton.on("click",function(){
                // close this one;
                wapi.removeDialogBox();
            });

            exportButton.on("click",function () {
                // var specPrefix=d3.select("#input_prefix_specification").node().value;
                // var specURL=d3.select("#input_iri_specification").node().value;


                var views=wapi.graph.getViews();
                console.log("found "+ views.length+ " views");

                if (singleViewAppend===true && views.length===0){
                    console.log("WAPI : NEED TO APPEND THE VIEW ");
                    var viewPrefix=d3.select("#input_prefix_view0").node().value;
                    var viewIRI=d3.select("#input_iri_view0").node().value;
                    var viewNotation=undefined;
                    var usesImportedNotation=false;
                    if (d3.select("#cbx_viewUsesNotation").node().checked===true) {
                        viewNotation = nIri;
                    }
                    usesImportedNotation= d3.select("#cbx_useImportOfNotation").node().checked;
                    wapi.graph.appendView(viewPrefix,viewIRI,viewNotation,usesImportedNotation);


                }

                var providedNotations=[];
                var importedNotations=[];


                for (var i=0;i<cbx_array.length;i++){
                    var cbxNode=cbx_array[i];
                    if (cbxNode.node().checked===true){
                        providedNotations.push(cbxNode.node().notation);
                        var index=cbxNode.node().index;
                        importedNotations.push(d3.select("#cbx_useImportOfNotation_"+index).node().checked);
                    }
                }
                console.log("#@#######################");
                console.log(providedNotations);
                console.log(importedNotations);
                console.log("-----------------------------------");

                // wapi.exportSpecification();
                // wapi.graph.exportSpecification(specPrefix,specURL,providedNotations,importedNotations);
                wapi.removeDialogBox();
            });


        }



    };

    DialogBox.prototype.constructor = DialogBox;


    return DialogBox;
}());