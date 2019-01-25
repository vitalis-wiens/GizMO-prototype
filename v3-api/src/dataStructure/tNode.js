module.exports = (function () {
    var TypeNode= function () {
        var that=this;
        that.node_id      = undefined;
        that.node_label   = undefined;
        that.node_type    = undefined;
        that.node_iri     = "";
        that.node_baseIri = "";
        that.node_instance=0;


        that.node_initPosition=undefined;

        // // Additional attributes
        // that.node_annotations;
        // that.node_attributes = [];
        // that.node_backgroundColor;
        // that.node_comment;
        // that.node_description;
        // that.node_equivalentBase;
        // that.node_indications = [];



        var loopProperties=[];
        var datatypeProperties=[];
        var objectProperties=[]; // stores the direct object properties in the vacinity

        that.addLoopProperty=function(tProp){
            if (loopProperties.indexOf(tProp)==-1){
                loopProperties.push(tProp);

            }
        };
        that.addObjectProperty=function(tProp){
            if (objectProperties.indexOf(tProp)==-1){
                objectProperties.push(tProp);
            }
        };
        that.addDatatypeProperty=function(tProp){
            if (datatypeProperties.indexOf(tProp)==-1){
                datatypeProperties.push(tProp);
            }
        };

        // TODO : preparations for smart expanding
        that.getObjectProperties   = function(){return objectProperties   ; };
        that.getLoopProperties     = function(){return loopProperties     ; };
        that.getDatatypeProperties = function(){return datatypeProperties ; };

        that.getAllProperties=function(){
            return [].concat(objectProperties).concat(loopProperties).concat(datatypeProperties);
        };

        that.showDatatype=function(val,forceRedraw){
            var i;
            for (i=0;i<datatypeProperties.length;i++){
                datatypeProperties[i].range().renderingPrimitive().visible(val);
                datatypeProperties[i].range().renderingPrimitive().smartExpanding(val);
                datatypeProperties[i].getRenderingPrimitive().visible(val);
            }
            if (forceRedraw===true) {
                that.renderingPrimitive().forceGraphRedraw();
            }

        };

        that.showLoops=function(val, forceRedraw){
            var i;
            for (i=0;i<loopProperties.length;i++){
                // datatypeProperties[i].range().renderingPrimitive().visible(val);
                loopProperties[i].getRenderingPrimitive().visible(val);
            }
            if (forceRedraw===true) {
                console.log("calling that redraw func");
                that.renderingPrimitive().forceGraphRedraw();
            }
        };

        that.showLoopsAndDatatype=function(val){
            // this one is forcing to redraw;
            console.log("Type node show datatype and loops")
            that.showDatatype(val,false);
            that.showLoops(val,true);

            console.log("Type node show datatype and loops << DONE")

        };

        that.node_renderingPrimitive= undefined;

        that.renderingPrimitive=function(val){
            if (!arguments.length){
                return that.node_renderingPrimitive;
            }  else {
                that.node_renderingPrimitive=val;
                val.tNode(that);
            }
            return that;
        };

        that.initialPosition=function(val){
            if (!arguments.length){
                return that.node_initPosition;
            }  else {
                that.node_initPosition=val;
            }
            return that;
        };

        that.getLabelForCurrentLang=function(){
            if (typeof that.node_label==="string"){
                return that.node_label;
            }
            else{
                // TODO
                var prefLang="en";
                return textInLanguage(that.node_label, prefLang);
            }

        };
            function textInLanguage(label,lang){
                var LANG_IRIBASED = "IRI-based";
                var LANG_UNDEFINED = "undefined";
                if (typeof label === "undefined") {
                    return undefined;
                }

                if (typeof label === "string") {
                    return label;
                }

                if (lang && label.hasOwnProperty(lang)) {
                    return label[lang];
                }

                var textForLanguage = searchLanguage(label, "en");
                if (textForLanguage) {
                    return textForLanguage;
                }
                textForLanguage = searchLanguage(label, LANG_UNDEFINED);
                if (textForLanguage) {
                    return textForLanguage;
                }

                return label[LANG_IRIBASED];
            }

        function searchLanguage(textObject, preferredLanguage) {
            for (var language in textObject) {
                if (language === preferredLanguage && textObject.hasOwnProperty(language)) {
                    return textObject[language];
                }
            }
        }

        that.id=function(val){
          if (!arguments.length){
              return that.node_id;
          }  else {
              that.node_id=val;
          }
          return that;
        };

        that.annotations=function(val){
            if (!arguments.length){
                return that.node_annotations;
            }  else {
                that.node_annotations=val;
            }
            return that;
        };

        that.iri=function(val){
            if (!arguments.length){
                return that.node_iri;
            }  else {
                that.node_iri=val;
            }
            return that;
        };
        that.baseIri=function(val){
            if (!arguments.length){
                return that.node_baseIri;
            }  else {
                that.node_baseIri=val;
            }
            return that;
        };


        that.label=function(val){
            if (!arguments.length){
                return that.node_label;
            }  else {
                that.node_label=val;
            }
            return that;
        };
        that.type=function(val){
            if (!arguments.length){
                return that.node_type;
            }  else {
                that.node_type=val;
            }
            return that;
        };


        that.exportAsJson=function(){
            // returns the json object representation as string;

        };

        that.getJsonClassDefinition=function(){
            return '{ "id":"'+that.id()+'" , "type":"'+that.type()+'"}';
        };
        that.getJsonClassDescription=function(){
            return '{ "id":'+ JSON.stringify(that.id(),null," ")+' \n,' +
                '"iri":'+JSON.stringify(that.iri(),null," ")+' \n,'+
                '"baseIri":'+JSON.stringify(that.baseIri(),null," ")+' \n,'+
                '"label":'+JSON.stringify(that.label(),null," ")

                +'\n}';
        };


        that.exportAsTTL=function(){
            // returns the TTL object representation as string;


        };



    };
    TypeNode.prototype.constructor = TypeNode;



    return TypeNode;
}());
