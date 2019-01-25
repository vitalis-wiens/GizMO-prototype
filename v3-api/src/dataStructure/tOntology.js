module.exports = (function () {
    var TypeOntology= function () {
        var that = this;

        var languages = [];
        var base_iris = [];
        var title = {};
        var iri = "";
        var version = "";

        var author = [];
        var description = {};
        var labels = {};
        var prefixes={};


        var otherInformation = {};

        that.languages = function (val) {
            if (!arguments.length) return languages;
            // add element to array if val is not there;
            if (typeof val ==="string") {
                if (languages.indexOf(val) === -1) {
                    languages.push(val);
                }
            }else{
                for (var i=0;i<val.length;i++){
                    languages.push(val[i]);
                }
            }
        };

        that.baseIrirs = function (val) {
            if (!arguments.length) return base_iris;
            // add element to array if val is not there;
            if (typeof val ==="string") {
                if (base_iris.indexOf(val) === -1) {
                    base_iris.push(val);
                }
            }
            else{
                for (var i=0;i<val.length;i++){
                    base_iris.push(val[i]);

                }
            }


        };

        that.title = function (lang, text) {
            if (arguments.length === 0) {
                return title;
            }

            if (typeof lang==="string"){
                if (arguments.length === 1) {
                    // return title for a specific language;
                    if (title.hasOwnProperty(lang)) {
                        return title[lang];
                    }
                }
            }else{
                // its a setter object
                title=lang; // argument 1
            }



            if (arguments.length === 2) {
                // add / overwrite a title lang;
                title[lang] = text;
            }
        };

        that.prefixList = function (prefix, iri) {
            if (arguments.length === 0) {
                // deepCopy
                return Object.assign({}, prefixes);
            }

            if (typeof prefix==="string"){
                if (arguments.length === 1) {
                    // return title for a specific language;
                    if (prefixes.hasOwnProperty(prefix)) {
                        return prefixes[iri];
                    }
                }
            }else{
                // its a setter object
                prefixes=prefix; // argument 1
            }



            if (arguments.length === 2) {
                // add / overwrite a title lang;
                prefixes[prefix] = iri;
            }
        };


        that.iri=function(val){
            if (!arguments.length) return iri;
            iri=val;
        };
        that.version=function(val){
            if (!arguments.length) return version;
            version=val;
        };


        that.author = function (val) {
            if (!arguments.length) return author;
            // add element to array if val is not there;
            if (typeof val ==="string") {
                if (author.indexOf(val) === -1) {
                    author.push(val);
                }
            }else{
                for (var i=0;i<val.length;i++){
                    author.push(val[i]);
                }
            }
        };

        that.description = function (lang, text) {
            if (arguments.length === 0) {
                return description;
            }

            if (typeof lang==="string"){
                if (arguments.length === 1) {
                    // return title for a specific language;
                    if (title.hasOwnProperty(lang)) {
                        return description[lang];
                    }
                }
            }else{
                // its a setter object
                description=lang; // argument 1
            }



            if (arguments.length === 2) {
                // add / overwrite a title lang;
                description[lang] = text;
            }
        };
        that.labels = function (lang, text) {
            if (arguments.length === 0) {
                return labels;
            }

            if (typeof lang==="string"){
                if (arguments.length === 1 && title.hasOwnProperty(lang)) { return labels[lang]; }
            }else{
                // its a setter object
                labels=lang; // argument 1
            }
            if (arguments.length === 2) {
                // add / overwrite a title lang;
                labels[lang] = text;
            }
        };

        that.otherInformation=function(val){
            if (!arguments.length) return otherInformation;
            otherInformation=val;
        };
        that.add_otherInformationElement=function(name,object){
            otherInformation[name]=object;
        };
        // to string function for debuging;
        that.showInformation=function(){

            console.log(languages);
            console.log(base_iris);
            console.log(prefixes);
            console.log(title);
            console.log(iri);
            console.log(version);

            console.log(author);
            console.log(description);
            console.log(labels);
            console.log(otherInformation);

        };

        that.exportAsJson=function(){
            // returns the header for the json file;
            var headerStr='"header":{\n';
            headerStr+='"languages": '+JSON.stringify(languages, null, ' ');
            headerStr+='\n,"baseIris": '+JSON.stringify(base_iris, null, ' ');
            headerStr+='\n,"prefixList": '+JSON.stringify(prefixes, null, ' ');
            headerStr+='\n,"title": '+JSON.stringify(title, null, ' ');
            headerStr+='\n,"iri": '+JSON.stringify(iri, null, ' ');
            headerStr+='\n,"version": '+JSON.stringify(version, null, ' ');
            headerStr+='\n,"author": '+JSON.stringify(author, null, ' ');
            headerStr+='\n,"description": '+JSON.stringify(description, null, ' ');
            headerStr+='\n,"labels": '+JSON.stringify(labels, null, ' ');
            headerStr+='\n,"other": '+JSON.stringify(otherInformation, null, ' ');
            headerStr+="\n}";
            return headerStr;
        }

    };
    TypeOntology.prototype.constructor = TypeOntology;



    return TypeOntology;
}());
