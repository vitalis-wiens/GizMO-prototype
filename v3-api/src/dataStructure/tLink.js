module.exports = (function () {
    var TypeLink= function () {
        var that=this;
        var binderId=undefined;
        var propertyMap=[];
        var pCounter=0;
        var isLoop=false;
        var domain,range;
        var renderingPrimitive=undefined;
        var isDatatype=false;

        that.isDatatype=function(val){
            if(!arguments.length){
                return isDatatype;
            }
            isDatatype=val;
        };

        that.getParentDomainNode=function(){
            return domain;
        };
        that.getRenderingPrimitive=function(){
            return renderingPrimitive;
        };

        that.setRenderingPrimitive=function(val){
            renderingPrimitive=val
        };


        // undirected link for hidden link;
        that.domain=function(dom){
            if (!arguments.length) {return domain;}
            else {domain=dom;}
        };
        that.range=function(ran){
            if (!arguments.length) {return range;}
            else {range=ran;}
        };


        that.binderId=function(val){
            if (!arguments.length){return binderId;}
            else {binderId=val;}
        };

        that.addProperty=function(propertyObj){
            if (propertyMap.indexOf(propertyObj)===-1) {
                propertyMap.push(propertyObj);
                pCounter++;
            }
        };

        that.isMultiLink=function(){
            return (pCounter>=2);
        };
        that.isLoop=function(val){
          if (!arguments.length) return isLoop;
          else isLoop=val;

        };

        that.getNumberOfLinks=function(){
            return pCounter;
        };

        that.getPropertyMap=function(){
            return propertyMap;
        }


    };

    TypeLink.prototype.constructor = TypeLink;
    TypeLink.prototype.toString = function () {
        var retStr="TypeLink: \n"+
                   "   id = "+this.binderId()+"\n"+
                   "   isMultiLink? "+this.isMultiLink()+"\n";
        var props=this.getPropertyMap();
        retStr+="   Stored Properties: \n";

        for (var i=0;i<props.length;i++){
            retStr+="           "+props[i].id()+ "    "+ props[i].getLabelForCurrentLang() +"  "+ props[i].type()+"\n";
        }

        return retStr
    };
    return TypeLink;
}());
