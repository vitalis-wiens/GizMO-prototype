


module.exports = (function () {

    var SubEntry= function (title, parent) {
        var that=this;

        var PARENT_DOM=parent;
        var TITLE=title;
        var ME_ENTRY_DOM=PARENT_DOM.append('li');
        // styles;
        var style="";
        var hStyle="";


        function init(){

            // create ul entry;
            PARENT_DOM.style("list-style-type","none");
            PARENT_DOM.style("position","absolute");
            PARENT_DOM.style("top","0");
            PARENT_DOM.style("text-align","left");
            PARENT_DOM.style("width","200px");
            PARENT_DOM.style("left","200px");
            PARENT_DOM.style("padding","0 5px");

            PARENT_DOM.style("border-top-width"    , "1px"   );
            PARENT_DOM.style("border-top-style"    , "solid" );
            PARENT_DOM.style("border-left-width"   , "1px"   );
            PARENT_DOM.style("border-left-style"   , "solid" );
            PARENT_DOM.style("border-bottom-width" , "1px"   );
            PARENT_DOM.style("border-bottom-style" , "solid" );
            PARENT_DOM.style("border-right-width"  , "1px"   );
            PARENT_DOM.style("border-right-style"  , "solid" );
            // PARENT_DOM.classed("nav_menu_entryContainer",true);
            // test setting;
            ME_ENTRY_DOM.node().innerHTML=TITLE;

            ME_ENTRY_DOM.style("text-align","left");
            ME_ENTRY_DOM.style("height","20px");
            ME_ENTRY_DOM.style("padding","10px 0");

            ME_ENTRY_DOM.style("border-top-width"    , "1px"   );
            ME_ENTRY_DOM.style("border-top-style"    , "solid" );
            ME_ENTRY_DOM.style("border-left-width"   , "1px"   );
            ME_ENTRY_DOM.style("border-left-style"   , "solid" );
            ME_ENTRY_DOM.style("border-bottom-width" , "1px"   );
            ME_ENTRY_DOM.style("border-bottom-style" , "solid" );
            ME_ENTRY_DOM.style("border-right-width"  , "1px"   );
            ME_ENTRY_DOM.style("border-right-style"  , "solid" );


            ME_ENTRY_DOM.on("mouseover",function(){
                ME_ENTRY_DOM.classed("mEntry_hovered",true);

            });
            ME_ENTRY_DOM.on("mouseout",function(){
                ME_ENTRY_DOM.classed("mEntry_hovered",false);
            });


            // add hover Show function;
            // ME_ENTRY_DOM.on("mouseover",function(){
            //     d3.selectAll(".nav_menu_entryContainer").style("display","none"); // hiding all menus
            //     that.updateMenuElementPosition();
            //     ME_ENTRY_CONTAINER.style("display","block");
            //     ME_ENTRY_DOM.classed(hStyle,true);
            // });
            // ME_ENTRY_DOM.on("mouseout",function(){
            //     ME_ENTRY_DOM.classed(hStyle,false);
            // });
            // ME_ENTRY_DOM.classed(style,true);
            //
            //
            // // add hidde, show on click
            // ME_ENTRY_DOM.on("click",function () {
            //     // using shorthand if here ! if style is block -> hide , else show..
            //     ME_ENTRY_CONTAINER.style("display")==="block"?
            //         ME_ENTRY_CONTAINER.style("display","none"):
            //         ME_ENTRY_CONTAINER.style("display","block");
            // });

        } init();

    };
    SubEntry.prototype = Object.create(SubEntry.prototype);
    SubEntry.prototype.constructor = SubEntry;
    return SubEntry;

}());
