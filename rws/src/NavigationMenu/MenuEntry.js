var EntryElementConstructor = require("./EntryElement");


module.exports = (function () {

    var MenuEntry= function (menuContainer,parent,title,textH_Align) {
        var that=this;
        var ME_PARENT_DOM=parent;
        var ME_MENUCONTAINER_DOM=menuContainer;
        var ME_TITLE=title;
        var ME_ENTRY_DOM;
        var ME_ENTRY_CONTAINER;
        var entryElementArray=[];

        // styles;
        var style="";
        var hStyle="";


        function init(){

            // create ul entry;
            ME_ENTRY_DOM=ME_PARENT_DOM.append("div");
            ME_ENTRY_CONTAINER=ME_MENUCONTAINER_DOM.append("div").append("ul");
            ME_ENTRY_CONTAINER.style("list-style-type","none");
            ME_ENTRY_CONTAINER.classed("nav_menu_entryContainer",true);
            // test setting;
            ME_ENTRY_DOM.node().innerHTML=ME_TITLE;


            // add hover Show function;
            ME_ENTRY_DOM.on("mouseover",function(){
                d3.selectAll(".nav_menu_entryContainer").style("display","none"); // hiding all menus
                that.updateMenuElementPosition();
                ME_ENTRY_CONTAINER.style("display","block");
                ME_ENTRY_DOM.classed(hStyle,true);
            });
            ME_ENTRY_DOM.on("mouseout",function(){
                ME_ENTRY_DOM.classed(hStyle,false);
            });
            ME_ENTRY_DOM.classed(style,true);


            // add hidde, show on click
            ME_ENTRY_DOM.on("click",function () {
                // using shorthand if here ! if style is block -> hide , else show..
                ME_ENTRY_CONTAINER.style("display")==="block"?
                ME_ENTRY_CONTAINER.style("display","none"):
                ME_ENTRY_CONTAINER.style("display","block");
            });

        } init();
        that.getMenuEntryDOM=function(){
            return ME_ENTRY_DOM;
        };
        that.setMargin=function(top,right,bottom,left,unit){
            if (unit=="" || unit===undefined){
                unit="px";
            }
            var t=top+unit;
            var r=right+unit;
            var b=bottom+unit;
            var l=left+unit;
            var set=t+" "+r+" "+b+" "+l;
            ME_ENTRY_DOM.style("margin",set);
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
            ME_ENTRY_DOM.style("padding",set);
        };
        that.setContainerMargin=function(top,right,bottom,left,unit){
            if (unit=="" || unit===undefined){
                unit="px";
            }
            var t=top+unit;
            var r=right+unit;
            var b=bottom+unit;
            var l=left+unit;
            var set=t+" "+r+" "+b+" "+l;
            ME_ENTRY_CONTAINER.style("margin",set);
        };

        that.setContainerPadding=function(top,right,bottom,left,unit){
            if (unit=="" || unit===undefined){
                unit="px";
            }
            var t=top+unit;
            var r=right+unit;
            var b=bottom+unit;
            var l=left+unit;
            var set=t+" "+r+" "+b+" "+l;
            ME_ENTRY_CONTAINER.style("padding",set);
        };

        // this also sets the minWidth of that ELEMENT
        that.setWidth=function(widthAsStringWithUnit){
            // percentage will take the the parentElement // here the NAVMENU for width computation;
            if (widthAsStringWithUnit===undefined){
                ME_ENTRY_DOM.style("width",""); // dynamic?
            }else {

                ME_ENTRY_DOM.style("min-width", widthAsStringWithUnit);
                ME_ENTRY_DOM.style("width", widthAsStringWithUnit); // dynamic?
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
                ME_ENTRY_DOM.style("text-align", hAlign);
            }
        };

        // some Boreder INITIALIZATION
        function randomBorderStuff(){
            ME_ENTRY_DOM.style("border-top-width"    , "1px"   );
            ME_ENTRY_DOM.style("border-top-style"    , "solid" );
            ME_ENTRY_DOM.style("border-left-width"   , "1px"   );
            ME_ENTRY_DOM.style("border-left-style"   , "solid" );
            ME_ENTRY_DOM.style("border-bottom-width" , "1px"   );
            ME_ENTRY_DOM.style("border-bottom-style" , "solid" );
            ME_ENTRY_DOM.style("border-right-width"  , "1px"   );
            ME_ENTRY_DOM.style("border-right-style"  , "solid" );

        }

        // KILL THE MARGIN DIRECTLY ON INITIALIZATION;
        that.setMargin(0,0,0,0);
        that.setContainerMargin(0,0,0,0);
        that.setContainerPadding(0,0,0,0);
        that.setPadding(10,0,10,0);
        that.setWidth("150px");

        that.setTextH_Alignment(textH_Align);
       // randomBorderStuff();

        // remove Selector
        that.removeTextSelectionOnMenuEntry=function(){
            ME_ENTRY_DOM.classed("noselect",true);
        }; that.removeTextSelectionOnMenuEntry(); // direct call on initialization



        that.addEntryElement=function(EntryName){
            var EE=new EntryElementConstructor(that,ME_ENTRY_CONTAINER,EntryName,"left");
            entryElementArray.push(EE);
            return EE;
        };

        that.getHeight=function(){
            return ME_ENTRY_DOM.node().getBoundingClientRect().height;
        };

        that.updateMenuElementPosition=function(){
            var leftOffset = ME_ENTRY_DOM.node().offsetLeft;
            ME_ENTRY_CONTAINER.style("left", leftOffset + "px");
        };



        that.setStyle=function(stl){
            style=stl;
            ME_ENTRY_DOM.classed(style,true);
            return that;
        };

        that.classed=function(stl,val){
            ME_ENTRY_DOM.classed(stl,val);
            return that;
        };

        that.setHoverStyle=function(stl){
            hStyle=stl;
            return that;
        };

        that.addSvgIconInFront=function(icon){
            var title=ME_ENTRY_DOM.node().innerHTML;
            ME_ENTRY_DOM.node().innerHTML="<div style='display:flex;'><i>"+
            "<svg style='width:25px; height:20px; margin-top:-4px;margin-right:4px;'>"+
            "<g><path style='fill : #fff; stroke-width:0;'"+
            "d='M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z'"+
            ">"+
            "</path></g>"+
            "</svg>"+
            "</i>"+"<div>"+title+"</div></div>";
        };
        that.setTitle=function(val){
            ME_TITLE=val;
            // update text
            ME_ENTRY_DOM.node().innerHTML=ME_TITLE;
        };


        that.clearEntries=function(){
            // console.log("removing all child entries form menu");
            var htmlContainer=ME_ENTRY_CONTAINER.node().children;
            var numChildren=htmlContainer.length;

            for (var i=0;i<numChildren;i++){
                htmlContainer[0].remove();
            }

            // clear memory;
            entryElementArray=[]; // hope for that garbage collection oO;

            }

    };
    MenuEntry.prototype = Object.create(MenuEntry.prototype);
    MenuEntry.prototype.constructor = MenuEntry;
    return MenuEntry;

}());
