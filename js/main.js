/*-- Initialization function --*/
function init() {

  let x1 = 256949.3665611869946588
  let x2 = 257713.3665611869946588
  let y1 = 470721.1748565000016242
  let y2 = 471875.1748565000016242

  //define map object & link to placeholder div:
  navMap = new ol.Map({
    controls: ol.control.defaults().extend([
      new ol.control.FullScreen(),
      new ol.control.ZoomToExtent({
        extent: [
          x1, y1, x2,y2
        ],
      })]),
    target: "map_container"});
  // define layer as tiled map:
  osmLayer = new ol.layer.Tile({
      // load OSM (a connector predefined in the API) as source:
      source: new ol.source.OSM()
  });
  

  //Set Dutch RD projection CRS
  proj4.defs("EPSG:28992","+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 "+
  "+x_0=155000 +y_0=463000 +ellps=bessel "+
  "+towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs");
  // ol.proj.proj4.register(proj4)

  const dutch_proj = ol.proj.get("EPSG:28992")
  // create a map view:
  
  dtmLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
      url: "https://gisedu.itc.utwente.nl/cgi-bin/mapserv.exe?map=d:/iishome/student/s2516306/GIT/website_assignment/configWMS.map&",
      params: {"LAYERS": "DTM", 
                "TILED": true,
                "VERSION":"1.3.0",
                "REQUEST":"GetMap",
                "CRS":"EPSG:28992",
                "BBOX":"256949.3665611869946588,470721.1748565000016242,257713.3665611869946588,471875.1748565000016242",
                "WIDTH":"600",
                "HEIGHT":"800",
                "FORMAT":"image/png",
                "SLD": "https://gisedu.itc.utwente.nl/student/s2516306/GIT/website_assignment/sld.xml"
                }
    })
  });


  centerX = (x1 + x2)/2
  centerY = (y1 + y2)/2
  // add layer to map:
  navMap.addLayer(osmLayer);
  navMap.addLayer(dtmLayer);
  navMap.setView(
      //center coords and zoom level:
      new ol.View({
        // 256949.3665611869946588,470721.1748565000016242
          // center: ol.proj.transform([6.88453, 52.21995], 'EPSG:4326', 'EPSG:3857'),
          projection:dutch_proj,
          center: [centerX,centerY],
          // center: [256949.3665611869946588,471290.1548565000016242],
          
          // center: ol.proj.transform([256949.3665611869946588,470721.1748565000016242], 'EPSG:28992','EPSG:3857'),
          zoom: 15
      })
  );


  navMap.addControl(new ol.control.Zoom());

  // navMap.addControl(new ol.control.MousePosition({
  //     projection: 'EPSG:4326',  
  //     coordinateFormat: ol.coordinate.createStringXY(4)
  // })
  // );
  //   navMap.addControl(new ol.control.MousePosition());

  // change_map(CountryName)
  // if (CountryNameList === "empty") {
  //     getCountryListfromDB();
  // }
}
/*---*/


(function ($) {
  "use strict";

  // Preloader (if the #preloader div exists)
  $(window).on('load', function () {
    init();
    if ($('#preloader').length) {
      $('#preloader').delay(100).fadeOut('slow', function () {
        $(this).remove();
      });
    }
  });

  // Back to top button
  $(window).scroll(function() {
    if ($(this).scrollTop() > 100) {
      $('.back-to-top').fadeIn('slow');
    } else {
      $('.back-to-top').fadeOut('slow');
    }
  });
  $('.back-to-top').click(function(){
    $('html, body').animate({scrollTop : 0},1500, 'easeInOutExpo');
    return false;
  });

  // Initiate the wowjs animation library
  new WOW().init();

  // Header scroll class
  $(window).scroll(function() {
    if ($(this).scrollTop() > 100) {
      $('#header').addClass('header-scrolled');
    } else {
      $('#header').removeClass('header-scrolled');
    }
  });

  if ($(window).scrollTop() > 100) {
    $('#header').addClass('header-scrolled');
  }

  // Smooth scroll for the navigation and links with .scrollto classes
  $('.main-nav a, .mobile-nav a, .scrollto').on('click', function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      if (target.length) {
        var top_space = 0;

        if ($('#header').length) {
          top_space = $('#header').outerHeight();

          if (! $('#header').hasClass('header-scrolled')) {
            top_space = top_space - 40;
          }
        }

        $('html, body').animate({
          scrollTop: target.offset().top - top_space
        }, 1500, 'easeInOutExpo');

        if ($(this).parents('.main-nav, .mobile-nav').length) {
          $('.main-nav .active, .mobile-nav .active').removeClass('active');
          $(this).closest('li').addClass('active');
        }

        if ($('body').hasClass('mobile-nav-active')) {
          $('body').removeClass('mobile-nav-active');
          $('.mobile-nav-toggle i').toggleClass('fa-times fa-bars');
          $('.mobile-nav-overly').fadeOut();
        }
        return false;
      }
    }
  });

  // Navigation active state on scroll
  var nav_sections = $('section');
  var main_nav = $('.main-nav, .mobile-nav');
  var main_nav_height = $('#header').outerHeight();

  $(window).on('scroll', function () {
    var cur_pos = $(this).scrollTop();
  
    nav_sections.each(function() {
      var top = $(this).offset().top - main_nav_height,
          bottom = top + $(this).outerHeight();
  
      if (cur_pos >= top && cur_pos <= bottom) {
        main_nav.find('li').removeClass('active');
        main_nav.find('a[href="#'+$(this).attr('id')+'"]').parent('li').addClass('active');
      }
    });
  });

  // jQuery counterUp (used in Whu Us section)
  $('[data-toggle="counter-up"]').counterUp({
    delay: 10,
    time: 1000
  });

  // Porfolio isotope and filter
  $(window).on('load', function () {
    var portfolioIsotope = $('.portfolio-container').isotope({
      itemSelector: '.portfolio-item'
    });
    $('#portfolio-flters li').on( 'click', function() {
      $("#portfolio-flters li").removeClass('filter-active');
      $(this).addClass('filter-active');
  
      portfolioIsotope.isotope({ filter: $(this).data('filter') });
    });
  });

  // Testimonials carousel (uses the Owl Carousel library)
  $(".testimonials-carousel").owlCarousel({
    autoplay: true,
    dots: true,
    loop: true,
    items: 1
  });

  // Clients carousel (uses the Owl Carousel library)
  $(".clients-carousel").owlCarousel({
    autoplay: true,
    dots: true,
    loop: true,
    responsive: { 0: { items: 2 }, 768: { items: 4 }, 900: { items: 6 }
    }
  });

})(jQuery);

