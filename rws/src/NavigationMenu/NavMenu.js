var menuConstructor = require("./MenuEntry");



module.exports = (function () {

    var NavMenu = function (rws,parent,alignment,orientation) {
        var that=this;

        var NAV_ALIGNMENT=alignment;
        var NAV_ORIENTATION=orientation;
        var NAV_PARENT_DOM;
        var NAV_MENU_DOM;
        var NAV_DOM;
        var NAV_BUTTONS;

        var menuElementArray=[];

        var scroll_hMax;
        var l_button;
        var r_button;

        var nav_height;

        function init(){
            // create properParentString;
            if (parent.indexOf("#")!==0 && parent.length>0){
                parent="#"+parent;
                NAV_PARENT_DOM=d3.select(parent);
            }
            if ( NAV_PARENT_DOM===undefined || (NAV_PARENT_DOM.length===1 && NAV_PARENT_DOM[0][0]===null) ){
                // console.log("Failed to find parent Element for NAV MENU, put into main");
                var mainObj=document.getElementsByTagName("MAIN")[0];
                // console.log(mainObj);
                NAV_DOM=d3.select(mainObj).append("div");
                NAV_MENU_DOM=d3.select(mainObj).append("div");
                NAV_DOM.node().id="NAV_DOM";
                NAV_MENU_DOM.node().id="NAV_MENU_DOM";
                NAV_BUTTONS=d3.select(mainObj).append("div");
                //console.log(NAV_BUTTONS);

            }
            // set alignment
            if (alignment!==undefined){
                NAV_DOM.style("position","fixed");
                 NAV_DOM.style("overflow-x","hidden");
                 NAV_DOM.style("overflow-y","hidden");
                 NAV_DOM.style("white-space","nowrap");

            }

            switch(alignment){
                case rws.NAV_POSITION_TOP:
                    NAV_DOM.style("top","0");
                    NAV_DOM.style("width","100%");
                    NAV_DOM.style("height","40px");
                    NAV_DOM.style("display", "flex");
                    break;
                case rws.NAV_POSITION_BOTTOM:
                    NAV_DOM.style("bottom","0");
                    NAV_DOM.style("width","100%");
                    NAV_DOM.style("height","40px");
                    NAV_DOM.style("display", "flex");
                    break;
                case rws.NAV_POSITION_LEFT:
                    NAV_DOM.style("left","0");
                    NAV_DOM.style("height","100%");
                    break;
                case rws.NAV_POSITION_RIGHT:
                    NAV_DOM.style("right","0");
                    NAV_DOM.style("height","100%");
                    break;

                default: console.log("Faild to set the NAVIGATION POSTION ");
            }

            // initialize some constants

            nav_height=NAV_DOM.node().getBoundingClientRect().height;
        }

        that.setBackgroundColor=function(colorAsString){
            NAV_DOM.style("background-color",colorAsString)
        };

        that.addMenuEntry=function(title,textH_Align,style){
            var mE=new menuConstructor(NAV_MENU_DOM,NAV_DOM,title,textH_Align,style);
            menuElementArray.push(mE);
            return mE;
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
            NAV_DOM.style("margin",set);
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
            NAV_DOM.style("padding",set);
        };






        // helper functions
        that.addMWheelHandler=function(){
            NAV_DOM.on("wheel",function() {
                var wheelEvent = d3.event;
                var offset;
                if (wheelEvent.deltaY < 0) offset =  20;
                if (wheelEvent.deltaY > 0) offset = -20;
                NAV_DOM.node().scrollLeft+=offset;
                that.hideAllMenus();
                that.updateScrollButtonVisibility();
            });
        };


        that.updateScrollButtonVisibility=function(){
            scroll_hMax = NAV_DOM.node().scrollWidth - NAV_DOM.node().clientWidth -2;
            if ( NAV_DOM.node().scrollLeft === 0){
                l_button.classed("hidden",true);
            }else{ l_button.classed("hidden",false);}

            if ( NAV_DOM.node().scrollLeft > scroll_hMax){
                r_button.classed("hidden",true);
            }else{ r_button.classed("hidden",false); }

        };

        that.addLeftScrollButton=function(){
            l_button=NAV_BUTTONS.append("div");
            l_button.classed("noselect",true);
            l_button.style("background-color","#ff0");
            l_button.style("width","25px");
            l_button.style("text-align","center");
            //l_button.style("height",nav_height);
            l_button.style("position","absolute");
            l_button.style("bottom","0");
            l_button.style("left","0");
            l_button.node().innerHTML="<";

            // compute top and bot padding;
            var mH=l_button.node().getBoundingClientRect().height;
            var mP=0.5*(nav_height-mH);
            l_button.style("padding-top",mP+"px");
            l_button.style("padding-bottom",mP+"px");




        };
        that.addRightScrollButton=function(){
            r_button=NAV_BUTTONS.append("div");
            r_button.classed("noselect",true);
            r_button.style("background-color","#ff0");
            r_button.style("width","50px");
           // r_button.style("height",nav_height);
            r_button.style("position","absolute");
            r_button.style("bottom","0");
            r_button.style("right","0");
            r_button.node().innerHTML=">";
            r_button.style("width","25px");
            r_button.style("text-align","center");
            var mH=r_button.node().getBoundingClientRect().height;
            var mP=0.5*(nav_height-mH);
            r_button.style("padding-top",mP+"px");
            r_button.style("padding-bottom",mP+"px");

        };

        that.getMenuArray=function(){
            return menuElementArray;
        };

        that.hideAllMenus=function(){
            d3.selectAll(".nav_menu_entryContainer").style("display","none"); // hiding all menus
        };


        // Default calls on object construction;

        init();

        that.addLeftScrollButton();
        that.addRightScrollButton();
        that.addMWheelHandler();
        // KILL THE MARGIN DIRECTLY ON INITIALIZATION;
        that.setMargin(0,0,0,0);
        that.setPadding(0,0,0,0);
    };
    NavMenu.prototype = Object.create(NavMenu.prototype);
    NavMenu.prototype.constructor = NavMenu;
    return NavMenu;
}());
