;(function ($, window, document, undefined) {

    var defaults = {
        bookmarkHolder: '#bookmark-holder',
        bookmarkClass: 'bookmarked',
        removeBookMarkClass: 'remove-page-mark',
        dataField: 'bookmark-item',
        itemTemplate: '<div class="col-md-3 article"><i {REMOVE_DATA_ATTRIBUTE}  class="glyphicon glyphicon-remove-circle {REMOVE_BOOKMARK_CLASS}"></i><a title="{TITLE}" target="_blank" href="{URL}"><img src="{IMAGE}" class="img-thumbnail"/></a></div>',
        addBookMarkCallback: function () {
            console.log('Added!');
        },
        removeBookMarkCallback: function () {
            console.log('Removed!');
        }
    };

    function SiteMarkManager(elements, options) {
        this.selector = elements.selector;
        this.bookmarks = [];
        this.$elements = elements;
        this.$element = {};
        this.options = $.extend({}, defaults, options);
        this.$bookmarkHolder = $(this.options.bookmarkHolder);

        this.loadLocalStorage();
        this.listen();
        this.init();
    }

    SiteMarkManager.prototype = {
        init: function () {
            var self = this;
            this.$elements.each(function (index, element) {
                self.$element = $(element);
                if (self.isBookmarked()) {
                    self.$element.addClass(self.options.bookmarkClass);
                } else {
                    self.$element.removeClass(self.options.bookmarkClass);
                }
                self.render();
            });
        },
        add: function (bookmarkItem) {
            this.bookmarks.push(bookmarkItem);
            this.save();
            this.options.addBookMarkCallback();
        },
        remove: function (index) {
            this.bookmarks.splice(index, 1);
            this.save();
            this.options.removeBookMarkCallback();
        },
        save: function () {
            localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
            this.loadLocalStorage();
            this.render();
        },
        get: function () {
            return this.bookmarks;
        },
        listen: function () {
            var self = this;
            $(document).on('click', this.selector, function () {
                var $self = $(this);
                var obj = $self.data(self.options.dataField);
                if (obj != null && obj != 'undefined') {
                    index = self.findById(obj);
                    if (index == -1 && !$self.hasClass('.' + self.options.bookmarkClass)) {
                        self.add(obj);
                        $self.addClass(self.options.bookmarkClass);
                        $self.attr('data-' + self.options.dataField + '-id', obj.id);
                    } else {
                        self.remove(index);
                        $self.removeClass(self.options.bookmarkClass);
                    }
                }
            });
            this.listenForRemove();
        },
        listenForRemove: function () {
            var self = this;
            $(document).on('click', '.' + self.options.removeBookMarkClass, function () {
                var $self = $(this),
                    obj = $self.data(self.options.dataField + '-remove');

                var index = self.findById(obj);
                var itemSelector = '[data-' + self.options.dataField + '-id="' + obj.id + '"]';
                $(itemSelector).removeClass(self.options.bookmarkClass);
                self.remove(index);
            });
        },
        loadLocalStorage: function () {
            this.bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
        },
        render: function () {
            var self = this;
            self.$bookmarkHolder.empty();
            this.bookmarks.forEach(function (elem, index) {
                var data = JSON.stringify(elem);
                var item = self.renderItem(elem, data);
                self.$bookmarkHolder.append(item);
            });
        },
        renderItem: function (element, data) {
            var item = this.options.itemTemplate.replace('{REMOVE_DATA_ATTRIBUTE}', 'data-' + this.options.dataField + '-remove=\'' + data + "'")
                .replace('{REMOVE_BOOKMARK_CLASS}', this.options.removeBookMarkClass)
                .replace('{TITLE}', element.title)
                .replace('{URL}', element.url)
                .replace('{IMAGE}', element.image);
            return item;
        },
        isBookmarked: function () {
            var obj = this.$element.data(this.options.dataField);
            if (this.findById(obj) == -1) {
                return false;
            } else {
                this.$element.attr('data-' + this.options.dataField + '-id', obj.id);
                return true
            }
        },
        findById: function (obj) {
            var index = -1;

            this.bookmarks.forEach(function (elem, idx) {
                if (obj.id == elem.id) {
                    index = idx;
                }
            });

            return index;
        }
    };

    $.fn['SiteMarkManager'] = function (options) {
        return new SiteMarkManager(this, options);
    };

})(jQuery, window, document);


