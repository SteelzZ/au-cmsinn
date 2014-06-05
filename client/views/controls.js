function rotate(direction){
    if(direction == 'back'){
        $('#cmsinn-container').removeClass('rotate-90');
        $('.control').removeClass('rotate90');
    } else {
        $('#cmsinn-container').addClass('rotate-90');
        $('.control').addClass('rotate90');
    }
}

function scale(action){
    if(action == 'down'){
        $('#cmsinn-container').addClass('scale-down');
    } else {
        $('#cmsinn-container').removeClass('scale-down');
    }
}
var scroller = function(){
    var scrollToTop = $(window).scrollTop();
    var elementHeight = $('#cmsinn-container').height();
    var topPosition = $('.drager').position().top;
    var elementsBottom = elementHeight + $('.drager').position().top;
    var bottomOfScreen = scrollToTop + $(window).height();

    if($(window).height() < $('#cmsinn-container').height()){
        scale('down');
    } else {
        scale('up');
    }

    var top = null;
    if(scrollToTop > topPosition){
        top = scrollToTop;
        if($('#cmsinn-container').hasClass('scale-down')){
            top = bottomOfScreen - elementHeight;
        }
    }

    if(elementsBottom > bottomOfScreen){
        top = bottomOfScreen - elementHeight;
    }
    if(top != null){
        $('.drager').css({top:top+'px'});
    }
};


// var scroller = function(){
//     var elementHeight = $('#cmsinn-container').height();
//     if($('#cmsinn-container').hasClass('rotate-90')){
//         elementHeight = $('#cmsinn-container').width();
//     }

//     var elementsBottom = elementHeight + $('#cmsinn-container').position().top;
//     var bottomOfScreen = $(window).scrollTop() + $(window).height();

//     if($(window).height() < $('#cmsinn-container').height()){
//         rotate();
//     } else {
//         rotate('back');
//     }

//     console.log(elementHeight + "---" + elementsBottom + "--" + bottomOfScreen + "--" + $(window).scrollTop() + "---" + $(document).height() + "--" + $(window).height() + "--" + $('#cmsinn-container').position().top + "---" + $('.drager').offset().top);
//     if($(window).scrollTop() > $('#cmsinn-container').position().top){
//         var top = $(window).scrollTop();
//         if($('#cmsinn-container').hasClass('rotate-90')){
//             top = top - (Math.floor($('#cmsinn-container').height() / 2.2));
//         }
//         $('#cmsinn-container').css({top:top+'px'});
//     }

//     if(elementsBottom > bottomOfScreen){
//         var top = bottomOfScreen - elementHeight;
//         if($('#cmsinn-container').hasClass('rotate-90')){
//             top = bottomOfScreen - (Math.floor($('#cmsinn-container').height() / 2));
//         }
//         $('#cmsinn-container').css({top:top+'px'});
//     }
// };

var controls = function(){
    //$('#cmsinn-container').sticky({});
    $('.drager').draggable({cursor: "move", opacity: 0.35, zIndex: 9999});

    $('#translations').on('click', function(event){
        CmsInn.toggle('i18n');
    });
    $('#navigation').on('click', function(event){
        CmsInn.toggle('navigation');
    });
    $('#structure').on('click', function(event){
        CmsInn.toggle('record');
    });
    $('#image').on('click', function(event){
        CmsInn.toggle('image');
    });
    $('#locale').on('click', function(event){
        CmsInn.toggle('locale');
    });
    $('#sortable').on('click', function(event){
        CmsInn.toggle('sortable');
    });
    $('#deletable').on('click', function(event){
        CmsInn.toggle('deletable');
    });

    $('#disable').on('click', function(event){
        CmsInn.disable();
    });
    $(window).scroll(scroller)
    $(window).resize(scroller);
}

Template['cmsinn_controls_left'].rendered = controls;

Meteor.startup(function(){
    $('body').on('click', '[data-au-locale]', function(event){
        CmsInn.plugins.i18n.setLocale($(event.currentTarget).attr('data-au-locale'));  
    });

    $('body').on('click', '[data-au-filter]', function(event){
        CmsInn.plugins.record.setFilter($(event.currentTarget).attr('data-au-filter'));
    });
});