BEM.DOM.decl('b-weather-condition', {
    onSetMod: {
        'data': {
            'new': function () {
                console.debug(this.params);
                BEM.DOM.update(this.domElem, BEM.HTML.build(jQuery.extend({
                    block: 'b-weather-condition',
                    elem: 'data',
                }, this.params, {
                    inLocality: this._localityDeclination()
                })));
            }
        }
    },
    _localityDeclination: function () {
        return this.params.locality.split(' ').map(function (wordPart) {
                return wordPart.replace(new RegExp([
                        '[',
                        this.params.keywords.vowels,
                        ']+$'
                ].join(''), 'i'), '')+this.params.keywords.inEnding;
        }.bind(this));
    }
});

BEM.HTML.decl('b-weather-condition', {
    onElem: {
        'data': function (ctx) {
            var params = ctx.params()
            ctx.content([
                {elem: 'title', content: [
                    params.keywords['In'],
                    params.inLocality,
                    (parseInt(params.condition.temp_C) > 0 && '&plus;')+params.condition.temp_C,
                    params.keywords['celsius']
                ].join(' ')},
                {elem: 'subtitle', content: [
                    params.keywords['Wind'],
                    params.condition.windspeedKmph,
                    params.keywords['kmph']+',',
                    params.conditionCodes[params.condition.weatherCode]
                ].join(' ')}
            ])
        }
    }
})
