BEM.DOM.decl('b-weather-alert', {
    onSetMod: {
        'js': function () {
            BEM.DOM.update(this.domElem, BEM.HTML.build({
                block: 'b-weather-alert',
                elem: 'message',
                content: 'test'
            }));
        }
    },
    AUTO_HIDE_TIMEOUT: 2000,
    show: function (message, autohide) {
        this.elem('message').html(this.params.keywords[message] || message);
        this.setMod('visible', 'yes');
        if (autohide) {
            setTimeout(function () {
                this.hide();
            }.bind(this), this.AUTO_HIDE_TIMEOUT);
        }
    },
    hide: function () {
        this.setMod('visible', 'no');
    }
});
