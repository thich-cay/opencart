function getURLVar(key) {
    var value = [];

    var query = String(document.location).split('?');

    if (query[1]) {
        var part = query[1].split('&');

        for (i = 0; i < part.length; i++) {
            var data = part[i].split('=');

            if (data[0] && data[1]) {
                value[data[0]] = data[1];
            }
        }

        if (value[key]) {
            return value[key];
        } else {
            return '';
        }
    }
}

// On August 17 2021, Internet Explorer 11 (IE11) will no longer be supported by Microsoft's 365 applications and services.
function isIE() {
    if (!!window.ActiveXObject || "ActiveXObject" in window) return true;
}

// Header
$(document).ready(function() {
    // Header
    $('#header-notification [data-bs-toggle=\'modal\']').on('click', function(e) {
        e.preventDefault();

        var element = this;

        $('#modal-notification').remove();

        $.ajax({
            url: $(element).attr('href'),
            dataType: 'html',
            success: function(html) {
                $('body').append(html);

                $('#modal-notification').modal('show');
            }
        });
    });
});

// Menu
$(document).ready(function() {
    $('#button-menu').on('click', function(e) {
        e.preventDefault();

        $('#column-left').toggleClass('active');
    });

    // Set last page opened on the menu
    $('#menu a[href]').on('click', function() {
        sessionStorage.setItem('menu', $(this).attr('href'));
    });

    if (!sessionStorage.getItem('menu')) {
        $('#menu #menu-dashboard').addClass('active');
    } else {
        // Sets active and open to selected page in the left column menu.
        $('#menu a[href=\'' + sessionStorage.getItem('menu') + '\']').parent().addClass('active');
    }

    $('#menu a[href=\'' + sessionStorage.getItem('menu') + '\']').parents('li').children('a').removeClass('collapsed');

    $('#menu a[href=\'' + sessionStorage.getItem('menu') + '\']').parents('ul').addClass('show');

    $('#menu a[href=\'' + sessionStorage.getItem('menu') + '\']').parents('li').addClass('active');
});

// Tooltip
$(document).ready(function() {
    // Apply to all on current page
    $('[data-bs-toggle=\'tooltip\']').each(function(i, element) {
        var handler = bootstrap.Tooltip.getInstance(element);

        if (!handler) {
            var option = [];

            var handler = new bootstrap.Tooltip(element, option);

            $.extend(element, option);
        }
    });
/*
    // Makes tooltips work on ajax generated content
    $(document).ajaxStop(function() {
        $('[data-bs-toggle=\'tooltip\']').each(function(i, element) {
            handler = bootstrap.Tooltip.getInstance(element);

            if (!handler) {
                var option = []

                new bootstrap.Tooltip(element, option);
            } else {
                console.log(handler);
            }
        });
    });
*/
// Apply to all js generated content
    $(document).on('click', '[data-bs-toggle=\'tooltip\']', function(e) {
        var element = this;

        var handler = bootstrap.Tooltip.getInstance(element);

        if (!handler) {
            var option = [];

            var handler = new bootstrap.Tooltip(element, option);

            $.extend(element, option);
        }

        // remove fix
        $('body > .tooltip').remove();
    });
});

// Buttons
$(document).ready(function() {
    $(document).on('click', '[data-oc-loading-text]', function(state) {
        var element = this;

        var html = $(element).html();

        var loading = $(element).attr('data-oc-loading-text');

        if (state == 'loading') {
            $(element).html(loading);
        }

        if (state == 'reset') {
            $(element).html(html);
        }
    });
});

// Forms
$(document).on('submit', 'form[data-oc-toggle=\'ajax\']', function(e) {
    e.preventDefault();

    var element = this;

    var form = e.target;

    var action = $(form).attr('action');

    var button = e.originalEvent.submitter;

    var formaction = $(button).attr('formaction');

    if (formaction !== undefined) {
        action = formaction;
    }

    var method = $(form).attr('method');

    if (method === undefined) {
        method = 'post';
    }

    var enctype = $(element).attr('enctype');

    if (typeof enctype === undefined) {
        enctype = 'application/x-www-form-urlencoded';
    }

    // https://github.com/opencart/opencart/issues/9690
    if (typeof CKEDITOR != 'undefined') {
        for (instance in CKEDITOR.instances) {
            CKEDITOR.instances[instance].updateElement();
        }
    }

    console.log(e);
    console.log('element ' + element);
    console.log('action ' + action);
    console.log('button ' + button);
    console.log('formaction ' + formaction);
    console.log('method ' + method);
    console.log('enctype ' + enctype);

    $.ajax({
        url: action,
        type: method,
        data: $(form).serialize(),
        dataType: 'json',
        contentType: enctype,
        beforeSend: function() {
            $(button).button('loading');
        },
        complete: function() {
           $(button).button('reset');
        },
        success: function(json) {
            $(element).find('.is-invalid').removeClass('is-invalid');
            $(element).find('.invalid-feedback').removeClass('d-block');

            console.log(json);

            if (json['redirect']) {
                location = json['redirect'];

                // Not sure this part works
                delete json['redirect'];
            }

            if (typeof json['error'] == 'string') {
                $('#alert').prepend('<div class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> ' + json['error'] + ' <button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>');

                delete json['error'];
            }

            if (typeof json['error'] == 'object') {
                console.log(json['error']);

                if (json['error']['warning']) {
                    $('#alert').prepend('<div class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> ' + json['error']['warning'] + ' <button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>');

                    delete json['error']['warning'];
                }

                for (key in json['error']) {
                    $('#input-' + key.replaceAll('_', '-')).addClass('is-invalid').find('.form-control, .form-select, .form-check-input, .form-check-label').addClass('is-invalid');
                    $('#error-' + key.replaceAll('_', '-')).html(json['error'][key]).addClass('d-block');
                }

                delete json['error'];
            }

            if (json['success']) {
                $('#alert').prepend('<div class="alert alert-success"><i class="fas fa-check-circle"></i> ' + json['success'] + ' <button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>');

                // Refresh
                var url = $(form).attr('data-oc-load');
                var target = $(form).attr('data-oc-target');

                if (url !== undefined && target !== undefined) {
                   $(target).load(url);
                }

                delete json['success'];
            }

            // Replace any form values that correspond to form names.
            for (key in json) {
                $(element).find('[name=\'' + key + '\']').val(json[key]);
            }
        },
        error: function(xhr, ajaxOptions, thrownError) {
            console.log(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
        }
    });
});

// Upload
$(document).on('click', '[data-oc-toggle=\'upload\']', function() {
    var element = this;

    if (!$(element).prop('disabled')) {
        $('#form-upload').remove();

        $('body').prepend('<form enctype="multipart/form-data" id="form-upload" style="display: none;"><input type="file" name="file" value=""/></form>');

        $('#form-upload input[name=\'file\']').trigger('click');

        var size = $(element).attr('data-oc-size-max');

        $('#form-upload input[name=\'file\']').on('change', function(e) {
            if (this.files[0].size > size) {
                alert($(element).attr('data-oc-size-error'));

                $(this).val('');
            }
        });

        if (typeof timer != 'undefined') {
            clearInterval(timer);
        }

       var timer = setInterval(function() {
            if ($('#form-upload input[name=\'file\']').val() != '') {
               clearInterval(timer);

                $.ajax({
                    url: $(element).attr('data-oc-url'),
                    type: 'post',
                    data: new FormData($('#form-upload')[0]),
                    dataType: 'json',
                    cache: false,
                    contentType: false,
                    processData: false,
                    beforeSend: function() {
                        $(element).button('loading');
                    },
                    complete: function() {
                        $(element).button('reset');
                    },
                    success: function(json) {
                        console.log(json);

                        if (json['error']) {
                            alert(json['error']);
                        }

                        if (json['success']) {
                            alert(json['success']);
                        }

                        if (json['code']) {
                            $($(element).attr('data-oc-target')).attr('value', json['code']);
                        }
                    },
                    error: function(xhr, ajaxOptions, thrownError) {
                        console.log(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
                    }
                });
            }
        }, 500);
    }
});

// Image Manager
$(document).on('click', '[data-oc-toggle=\'image\']', function(e) {
    e.preventDefault();

    var element = this;

    $.ajax({
        url: 'index.php?route=common/filemanager&user_token=' + getURLVar('user_token') + '&target=' + encodeURIComponent($(this).attr('data-oc-target')) + '&thumb=' + encodeURIComponent($(this).attr('data-oc-thumb')),
        dataType: 'html',
        beforeSend: function() {
            $(element).button('loading');
        },
        complete: function() {
            $(element).button('reset');
        },
        success: function(html) {
            console.log(html);

            $('body').append(html);

            var element = document.querySelector('#modal-image');

            var modal = new bootstrap.Modal(element);

            modal.show();
        }
    });
});

$(document).on('click', '[data-oc-toggle=\'clear\']', function() {
    $($(this).attr('data-oc-thumb')).attr('src', $($(this).attr('data-oc-thumb')).attr('data-oc-placeholder'));

    $($(this).attr('data-oc-target')).val('');
});

// Chain ajax calls.
class Chain {
    constructor() {
        this.start = false;
        this.data = [];
    }

    attach(call) {
        this.data.push(call);

        if (!this.start) {
            this.execute();
        }
    }

    execute() {
        if (this.data.length) {
            this.start = true;

            (this.data.shift())().done(function() {
                chain.execute();
            });
        } else {
            this.start = false;
        }
    }
}

var chain = new Chain();

// Autocomplete
(function($) {
    $.fn.autocomplete = function(option) {
        return this.each(function() {
            var $this = $(this);
            var $menu = $('<div class="dropdown d-block">');
            var $dropdown = $('<ul class="dropdown-menu"></ul>');

            this.timer = null;
            this.items = [];

            $.extend(this, option);

            $this.attr('autocomplete', 'off');
            $this.active = false;

            // Focus
            $this.on('focus', function() {
                this.request();
            });

            // Blur
            $this.on('blur', function(e) {
                if (!$this.active) {
                    this.hide();
                }
            });

            $this.parent().on('mouseover', function(e) {
                $this.active = true;
            });

            $this.parent().on('mouseout', function(e) {
                $this.active = false;
            });

            // Keydown
            $this.on('keydown', function(e) {
                switch (e.keyCode) {
                    case 27: // escape
                        this.hide();
                        break;
                    default:
                        this.request();
                        break;
                }
            });

            // Click
            this.click = function(e) {
                e.preventDefault();

                var value = $(e.target).attr('href');

                if (value && this.items[value]) {
                    this.select(this.items[value]);

                    this.hide();
                }
            }

            // Show
            this.show = function() {
                $dropdown.addClass('show');
            }

            // Hide
            this.hide = function() {
                $dropdown.removeClass('show');
            }

            // Request
            this.request = function() {
                clearTimeout(this.timer);

                this.timer = setTimeout(function(object) {
                    object.source($(object).val(), $.proxy(object.response, object));
                }, 50, this);
            }

            // Response
            this.response = function(json) {
                var html = '';
                var category = {};
                var name;
                var i = 0, j = 0;

                if (json.length) {
                    for (i = 0; i < json.length; i++) {
                        // update element items
                        this.items[json[i]['value']] = json[i];

                        if (!json[i]['category']) {
                            // ungrouped items
                            html += '<li><a href="' + json[i]['value'] + '" class="dropdown-item">' + json[i]['label'] + '</a></li>';
                        } else {
                            // grouped items
                            name = json[i]['category'];

                            if (!category[name]) {
                                category[name] = [];
                            }

                            category[name].push(json[i]);
                        }
                    }

                    for (name in category) {
                        html += '<li><h6 class="dropdown-header">' + name + '</h6></li>';

                        for (j = 0; j < category[name].length; j++) {
                            html += '<li><a href="' + category[name][j]['value'] + '" class="dropdown-item">&nbsp;&nbsp;&nbsp;' + category[name][j]['label'] + '</a></li>';
                        }
                    }
                }

                if (html) {
                    this.show();
                } else {
                    this.hide();
                }

                $dropdown.html(html);
            }

            if (!$this.parent().hasClass('input-group')) {
                $this.after($menu.append($dropdown));
            } else {
                $this.parent().after($menu.append($dropdown));
            }

            $dropdown.on('click', 'a', $.proxy(this.click, this));
        });
    }
})(window.jQuery);