var SubEntryConstructor = require("./SubEntry");

module.exports = (function () {

    var EntryElement= function (menu,parent,title,textH_Align) {
        var that=this;
        var ELEMENT_PARENT_DOM=parent;
        var ELEMENT_TITLE=title;
        var ELEMENT_ENTRY_DOM;
        var SUBENTRY_ELEMENT_DOM;
        var hasSubEntryIndicator=false;

        var subEntryArray=[];

        that.getSubEntries=function(){
            return subEntryArray;
        };

        that.setTitle=function(val){
            ELEMENT_TITLE=val;
            // update text
            ELEMENT_ENTRY_DOM.node().innerHTML=ELEMENT_TITLE;

        };
        function init(){
            // test setting;
            ELEMENT_ENTRY_DOM=ELEMENT_PARENT_DOM.append("li");

            ELEMENT_ENTRY_DOM.node().innerHTML=ELEMENT_TITLE;
            ELEMENT_PARENT_DOM.style("position", "absolute");
            // based on menu position set the position of this thing;
            // todo : add switch cases;
            var menuHeight=menu.getHeight();
            ELEMENT_PARENT_DOM.style("bottom",menuHeight+"px");
            ELEMENT_ENTRY_DOM.classed("mEntry",true);

            ELEMENT_ENTRY_DOM.on("mouseover",function(){
                ELEMENT_ENTRY_DOM.classed("mEntry_hovered",true);
                if (SUBENTRY_ELEMENT_DOM){
                    SUBENTRY_ELEMENT_DOM.classed("hidden",false);
                }
            });
            ELEMENT_ENTRY_DOM.on("mouseout",function(){
                ELEMENT_ENTRY_DOM.classed("mEntry_hovered",false);
                if (SUBENTRY_ELEMENT_DOM) {
                    SUBENTRY_ELEMENT_DOM.classed("hidden", true);
                }
            });

        } init();
        that.setMargin=function(top,right,bottom,left,unit){
            if (unit=="" || unit===undefined){
                unit="px";
            }
            var t=top+unit;
            var r=right+unit;
            var b=bottom+unit;
            var l=left+unit;
            var set=t+" "+r+" "+b+" "+l;
            ELEMENT_ENTRY_DOM.style("margin",set);
        };

        that.setPadding=function(top,right,bottom,left,unit){
            if (unit=="" || unit===undefined){
                unit="px";
            }
            var t=top+unit;
            var r=right+unit;
            var b=bottom+unit;
            var l=left+unit;
            var set=t+" "+r+" "+b+" "+l;
            ELEMENT_ENTRY_DOM.style("padding",set);
        };

        that.setWidth=function(widthAsStringWithUnit){
            // percentage will take the the parentElement // here the NAVMENU for width computation;
            if (widthAsStringWithUnit===undefined){
                ELEMENT_ENTRY_DOM.style("width",""); // dynamic?
            }else {
                ELEMENT_ENTRY_DOM.style("width", widthAsStringWithUnit); // dynamic?
            }

        };

        /**
         *
         * @param hAlign
         * Allows following: center, left, right
         * percentage will take the the parentElement
         * here the NAVMENU for width computation;
         */
        that.setTextH_Alignment=function(hAlign){
            if (hAlign==="center" || hAlign==="left" || hAlign==="right") {
                ELEMENT_ENTRY_DOM.style("text-align", hAlign);
            }
        };

        // some Boreder INITIALIZATION
        function randomBorderStuff(){
            ELEMENT_ENTRY_DOM.style("border-top-width"    , "1px"   );
            ELEMENT_ENTRY_DOM.style("border-top-style"    , "solid" );
            ELEMENT_ENTRY_DOM.style("border-left-width"   , "1px"   );
            ELEMENT_ENTRY_DOM.style("border-left-style"   , "solid" );
            ELEMENT_ENTRY_DOM.style("border-bottom-width" , "1px"   );
            ELEMENT_ENTRY_DOM.style("border-bottom-style" , "solid" );
            ELEMENT_ENTRY_DOM.style("border-right-width"  , "1px"   );
            ELEMENT_ENTRY_DOM.style("border-right-style"  , "solid" );

        }

        // KILL THE MARGIN DIRECTLY ON INITIALIZATION;
        that.setMargin(0,0,0,0);
        that.setPadding(10,0,10,0);
        that.setWidth("200px");

        that.setTextH_Alignment(textH_Align);
        randomBorderStuff();

        // remove Selector
        that.removeTextSelectionOnMenuEntry=function(){
            ELEMENT_ENTRY_DOM.classed("noselect",true);
        }; that.removeTextSelectionOnMenuEntry(); // direct call on initialization


        that.appendAttribute=function(name,val){
            ELEMENT_ENTRY_DOM.attr(name,val);
        };
        that.getAttribute=function(name){
            return ELEMENT_ENTRY_DOM.attr(name);
        };

        that.connectOnClick=function( _func ){
            ELEMENT_ENTRY_DOM.on("click",_func);
        };


        that.addSubEntry=function(title){
            if (hasSubEntryIndicator===false) {
                that.addSubEntryIndicator();
            }
            console.log("Wannt to add SubEntry "+ title);
            var nSubEntry=new SubEntryConstructor(title,SUBENTRY_ELEMENT_DOM);


        };

        that.addSubEntryIndicator=function(){
            var span=ELEMENT_ENTRY_DOM.append('span');
            span.text(">");
            span.style("float", "right");
            hasSubEntryIndicator=true;
            SUBENTRY_ELEMENT_DOM=span.append("ul");
            SUBENTRY_ELEMENT_DOM.classed("hidden",true);

        };

    };
    EntryElement.prototype = Object.create(EntryElement.prototype);
    EntryElement.prototype.constructor = EntryElement;
    return EntryElement;

}());
