Locale = function(){
    this.contentType = 'locale';
    this.language = 'en_US';
    this.allLanguages = [
        {
            locale: "en_US"
        },
        {
            locale: "lt_LT"
        },
        {
            locale: "ru_RU"
        },
        {
            locale: "de_DE"
        }
    ];
}

Locale.prototype.constructor = Locale;

Locale.prototype.disable = function(){
    $("[data-au-locale]").cmsInnLocale.destroy();
}

Locale.prototype.enable = function(){
    $("[data-au-locale]").cmsInnLocale({});  
}

CmsInnLocale = new Locale();

function renderLocales(locales){
    var options = '';
    for(var i=0; i<locales.length; i++){
        options += ' \
            <option value="'+locales[i].locale+'">'+locales[i].locale+'</option> \
        ';
    }
    return options;
}

function generateTpl(referenceToValue, locales){

    var addNewItemTpl = ' \
        <div class="clearfix '+referenceToValue+'"> \
            <div class="col-md-12 column"> \
                <div class="row clearfix"> \
                    <div class="col-md-12 column"> \
                        <div class="form-group"> \
                            <label>Select language</label> \
                            <select data-id="'+referenceToValue+'" class="form-control locale-selector"> \
                                <option value="none">Select</option> \
                                '+renderLocales(locales)+' \
                            </select> \
                        </div> \
                    </div> \
                </div> \
                <div class="row clearfix"> \
                    <div class="col-md-12 column"> \
                        <div class="form-group"> \
                            <button type="button" class="btn btn-default close-locale" data-id="'+referenceToValue+'">Close</button> \
                        </div> \
                    </div> \
                </div> \
            </div> \
        </div> \
    ';

    return addNewItemTpl;
}

if(Meteor.isClient){
    (function($) {
        $.fn.cmsInnLocale = function(options) {
            var self = this;
            var settings = $.extend({
                bindLanguage : function(locale, id){
                    id = id + '_locale';
                    var result = ContentCollection.findOne({_id:id});
                    if(result){
                        ContentCollection.update(
                            {_id: id},
                            {$set : {locale : locale}}
                        );
                    } else {
                        ContentCollection.insert(
                            {
                                _id: id,
                                locale : locale
                            }
                        );
                    }
                }
            }, options);

            $('body').on('change', '.locale-selector ', function(){
                if($("option:selected", this).val() != 'none'){
                    settings.bindLanguage(
                        $("option:selected", this).val(), 
                        $(this).attr('data-id')
                    );
                }
            });

            $.fn.cmsInnLocale.destroy = function() {
                self.each(function() {
                    $(this).removeClass('mark');
                    $(this).popover('destroy');
                    $(this).unbind('mouseover');
                });
            }

            return this.each(function() {
                var element = this;
                $(element).addClass('mark');
                var referenceToValue = $(element).attr('data-au-locale');

                $(this).on('mouseover', function(){
                    $("[data-au-locale]").each(function(){
                        $(this).popover('destroy');
                    });

                    $(element).popover({
                        title: 'Locale',
                        html: true,
                        content : generateTpl(referenceToValue, CmsInnLocale.allLanguages),
                        container: 'body',
                        placement: 'bottom'
                    });
                    $(element).on('shown.bs.popover', function () {
                        $('.close-locale').on('click', function(){
                            $(element).popover('destroy');
                        });  
                    });
                    $(element).popover('show');
                });
            });
        };
    }(jQuery));

    if(UI) {
        UI.registerHelper('lang', function(id) {
            id = id + '_locale';
            var result = ContentCollection.findOne({_id:id});
            if(result){
                return result['locale'];
            }
        });
    } 
}