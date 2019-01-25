module.exports = (function () {
    var TypeProperty= function () {
        var that=this;

        var id=-1;
        var binderId=-1;
        var prop_label   = undefined;
        var prop_type    = undefined;
        var prop_iri     = "";
        var prop_baseIri = "";
        var linkStructure=undefined;
        var domain, range;
        var renderingPrimitive=undefined;
        var isLoop;
        var parentdomainObject=undefined;

        // that.setParentNodeFromDomain=function(obj){
        //     parentdomainObject=obj;
        // };
        // that.getParentDomainNode=function(){
        //     return parentdomainObject;
        //     // used as poiter to cluster or expand datatypeProperties by views;
        // };

        that.getRenderingPrimitive=function(){
            return renderingPrimitive;
        };

        that.setRenderingPrimitive=function (pr) {
            renderingPrimitive=pr;
        };


        that.getLinkStructure=function(){
            return linkStructure;
        };

        that.isMultiLink=function(){
          return linkStructure.isMultiLink();
        };

        that.isLoop=function(val){
            if (!arguments.length){ return isLoop;}
            else {isLoop=val;}
        };

        that.domain=function(dom){
            if (!arguments.length){ return domain;}
            else {domain=dom;}
        };

        that.range=function(ran){
            if (!arguments.length){ return range;}
            else {range=ran;}
        };

        that.setLinkStructure=function(lnkStr){
            // used for lookup;
            linkStructure=lnkStr;
        };
        that.id=function(val){
            if (!arguments.length){return id;}
            else {id=val;}
            return that;
        };


        that.getDomRanId=function(n1,n2){
            if (binderId===-1) {
                binderId = (n1 < n2) ? n1 + "_" + n2 : n2 + "_" + n1;
            }
            return binderId;
        };


        that.getLabelForCurrentLang=function(){
            if (typeof prop_label==="string"){
                return prop_label;
            }
            else{
                // TODO
                var prefLang="en";
                return textInLanguage(prop_label, prefLang);
            }

        };

        that.iri=function(val){
            if (!arguments.length){
                return prop_iri;
            }  else {
                prop_iri=val;
            }
            return that;
        };
        that.baseIri=function(val){
            if (!arguments.length){
                return prop_baseIri;
            }  else {
                prop_baseIri=val;
            }
            return that;
        };


        that.label=function(val){
            if (!arguments.length){
                return prop_label;
            }  else {
                prop_label=val;
            }
            return that;
        };
        that.type=function(val){
            if (!arguments.length){
                return prop_type;
            }  else {
                prop_type=val;
            }
            return that;
        };












        /** some language stuff **/
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


        // exporter functions;
        that.getJsonPropertyDefinition=function(){
            return '{ "id":"'+that.id()+'" , "type":"'+that.type()+'"}';
        };
        that.getJsonPropertyDescription=function(){
            return '{ "id":'+ JSON.stringify(that.id(),null," ")+' \n,' +
                '"iri":'+JSON.stringify(that.iri(),null," ")+' \n,'+
                '"baseIri":'+JSON.stringify(that.baseIri(),null," ")+' \n,'+
                '"domain":'+JSON.stringify(that.domain().id(),null," ")+' \n,'+
                '"range":'+JSON.stringify(that.range().id(),null," ")+' \n,'+
                '"label":'+JSON.stringify(that.label(),null," ")

                +'\n}';
        };

    };

    TypeProperty.prototype.constructor = TypeProperty;

    return TypeProperty;
}());
