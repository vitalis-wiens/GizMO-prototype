var g_elementId=0;
module.exports = (function () {

    var Base = function (wapi) {
        var that=this,
            wapi_ptr=wapi,
            id=wapi.getCanvasId()+"_"+g_elementId++,
            label,
            type,
            locked,
            frozen,
            configurationObject,
            defaultElementType;


        this.locked = function (p) {
            if (!arguments.length) return locked;
            locked = p;
            return that; // could be used by d3 , dont know yet;
        };

        this.frozen = function (p) {
            if (!arguments.length) return frozen;
            frozen = p;
            return that; // could be used by d3 , dont know yet;
        };

        this.ignoreForce=function(val){
            that.locked(val);
            that.frozen(val);
        };

        this.id=function(val){
            if (!arguments.length) return id;
            id=val;
        };
        this.label=function(val){
            if (!arguments.length) return label;
            label=val;
        };
        this.type=function(val){
            if (!arguments.length) return type;
            type=val;
        };
        this.configuration=function(val){
            if (!arguments.length) return configurationObject;
            configurationObject=val;
        };
        this.wapi=function(){
            return wapi_ptr;
        };

        this.defaultElementType=function(val){
            if (!arguments.length) return defaultElementType;
            else defaultElementType=val;

        }



    };
    Base.prototype.constructor = Base;

    Base.prototype.equals = function (other) {
        return other instanceof Base && this.id() === other.id();
    };
    return Base;
}());
