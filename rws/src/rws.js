var navConstructor=require("./NavigationMenu/NavMenu.js");
var sideMenuConstructor=require("./SideMenu/SideMenu.js");
module.exports = (function () {

    var RWS = function () {
        var that = this;
        that.NAV_POSITION_TOP="NAV_TOP";
        that.NAV_POSITION_BOTTOM="NAV_BOTTOM";
        that.NAV_POSITION_LEFT="NAV_LEFT";
        that.NAV_POSITION_RIGHT="NAV_RIGHT";
        that.NAV_ELEMENT_LEFT="NAV_ELEMENT_STARTING_FROM_LEFT";
        that.NAV_ELEMENT_RIGHT="NAV_ELEMENT_STARTING_FROM_RIGHT";



        that.SIDE_MENU_LEFT="SIDE_MENU_LEFT";
        that.SIDE_MENU_RIGHT="SIDE_MENU_RIGHT";
        that.SIDE_MENU_COLLAPSIBLE=false;



        that.sayHalloFormRWS=function(){
            console.log("Narf Zort Hello");
        };

        that.addNavigationMenu=function(parent,alignment,orientation){
            return new navConstructor(that,parent,alignment,orientation);
        };


        that.addSideMenu=function(title,alignment,collapsible){
            return new sideMenuConstructor(that,title,alignment,collapsible);
        };



        /** STYLE RELATED THINGS **/
        that.setBodyMargin=function(top,right,bottom,left,unit){
            if (unit=="" || unit===undefined){
                unit="px";
            }
            var t=top+unit;
            var r=right+unit;
            var b=bottom+unit;
            var l=left+unit;
            var set=t+" "+r+" "+b+" "+l;
            d3.select(document.getElementsByTagName("BODY")[0]).style("margin",set);
        };

        that.setBodyPadding=function(top,right,bottom,left,unit){
            if (unit=="" || unit===undefined){
                unit="px";
            }
            var t=top+unit;
            var r=right+unit;
            var b=bottom+unit;
            var l=left+unit;
            var set=t+" "+r+" "+b+" "+l;
            d3.select(document.getElementsByTagName("BODY")[0]).style("padding",set);
        };
        // KILL THE MARGIN DIRECTLY ON INITIALIZATION;
         that.setBodyMargin(0,0,0,0);
        // that.setBodyPading(0,0,0,0);


        that.createCSSSelector=function(name, rules) {
                var style = document.createElement('style');
                style.type = 'text/css';
                document.getElementsByTagName('head')[0].appendChild(style);
                if(!(style.sheet||{}).insertRule)
                    (style.styleSheet || style.sheet).addRule(name, rules);
                else
                    style.sheet.insertRule(name+"{"+rules+"}",0);
            };
        // add the noSelect Class

        that.createCSSSelector('.noselect',"-webkit-touch-callout: none; /* iOS Safari */" +
            "-webkit-user-select: none; /* Safari */" +
            "-khtml-user-select: none; /* Konqueror HTML */" +
            "-moz-user-select: none; /* Firefox */" +
            "-ms-user-select: none; /* Internet Explorer/Edge */" +
            "user-select: none; /* Non-prefixed version, currently" +
            "supported by Chrome and Opera */");




        that.setCentralWidget=function(widget,id){
            if (widget.widgetType()==="wapi_centralWidget" && id){
                // create a div for rendering;
                var mainObj=document.getElementsByTagName("MAIN")[0];
                var wapiRenderingDIv=d3.select(mainObj).append("div");
                wapiRenderingDIv.node().id=id;
            }
        };

    };
    RWS.prototype = Object.create(RWS.prototype);
    RWS.prototype.constructor = RWS;
    return RWS;
}());



