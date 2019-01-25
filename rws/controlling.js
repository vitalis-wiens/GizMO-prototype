
!function(){


    //using this as webvowl2 example
    // create some styles

    // why is the order important here? does not make any sense to me -,-
    rws.createCSSSelector(".menu_element_class", "background-color: #18202a;" +
        "cursor: pointer;" +
        "color: #fff;"
    );

    rws.createCSSSelector(".menu_element_class2", "background-color: #0f0;" +
        "cursor: pointer;" +
        "color: #fff;"
    );

    rws.createCSSSelector(".me_hovered","background-color: #18202a;" +
        "color: #aaa;");



    rws.createCSSSelector(".mEntry", "background-color: #00f;" +
        "cursor: pointer;"
    );
    rws.createCSSSelector(".mEntry_hovered","background-color: #f0f;");
    // This is where we create the gui  and its handler;
    rws.createCSSSelector(".hidden","display: none");





    rws.sayHalloFormRWS();
    var m1=rws.addNavigationMenu("",rws.NAV_POSITION_BOTTOM,"horizontal");
    m1.setBackgroundColor("#18202a");


    var lsb=rws.addSideMenu("LeftSidebar",rws.SIDE_MENU_LEFT, false);
    lsb.setBackgroundColor("#18202a");
    lsb.setSize("140px","100%","0px","-40px");
    lsb.appendAccordionElement("narf");


    var me1= m1.addMenuEntry("Ontology","center");
    me1.setStyle("menu_element_class").setHoverStyle("me_hovered");



    me1.addEntryElement("Test1");
    me1.addEntryElement("Test2");
    me1.addEntryElement("Test3");
    var me2=m1.addMenuEntry("Export","center");
    var me2Container=me2.addEntryElement("T1");
    me2Container.addSubEntry("Test1");
    me2Container.addSubEntry("Test2");
    me2Container.addSubEntry("Test3");

    var me2Container2=me2.addEntryElement("T2");
    me2Container2.addSubEntry("QTest1");
    me2Container2.addSubEntry("QTest2");
    me2Container2.addSubEntry("QTest3");

    me2.addEntryElement("T3");


    var me3= m1.addMenuEntry("Gravity","center");
    var me4= m1.addMenuEntry("Filter","center");
    var me5= m1.addMenuEntry("Modus","center");
    var me6= m1.addMenuEntry("Reset","center");
    var me7= m1.addMenuEntry("Pause","center");
    var me8= m1.addMenuEntry("Options","center");
    var me9= m1.addMenuEntry("About","center");

    me2.setStyle("menu_element_class").setHoverStyle("me_hovered");
    me3.setStyle("menu_element_class").setHoverStyle("me_hovered");
    me4.setStyle("menu_element_class").setHoverStyle("me_hovered");
    me5.setStyle("menu_element_class").setHoverStyle("me_hovered");
    me6.setStyle("menu_element_class").setHoverStyle("me_hovered");
    me7.setStyle("menu_element_class").setHoverStyle("me_hovered");
    me8.setStyle("menu_element_class").setHoverStyle("me_hovered");
    me9.setStyle("menu_element_class").setHoverStyle("me_hovered");

    me1.addSvgIconInFront();
    me2.addSvgIconInFront();
    m1.hideAllMenus();









}();