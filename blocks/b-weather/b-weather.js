BEM.DOM.decl('b-weather', {
    onSetMod: {
        'js': function () {
            if (this._loadFromStorage()) {
                this._showWeather();
                //update later
            } else {
                this._update(function () {
                    this._showWeather();
                }.bind(this));
            }
        }
    },
    _update: function (success) {
        this._watchLocation(function () {
            this._geocode(function (newLocality) {
                if (newLocality !== this._locality) {
                    this._locality = newLocality;
                    this._updateWeather(function () {
                        success();
                    });
                }
            }.bind(this));
        }.bind(this));
    },
    _showWeather: function () {
        var conditionBlock = this.findBlockInside('b-weather-condition');
        conditionBlock.params.locality = this._locality;
        conditionBlock.params.condition = this._weather.current_condition[0];
        conditionBlock.setMod('data', 'new');
    },
    _locality: '',
    _longitude: NaN,
    _latitude: NaN,
    _weather: {},
    _loadFromStorage: function () {
        var locality = localStorage.getItem('locality'),
            weather = localStorage.getItem('weather');
        if (locality && weather) {
            this._locality = locality;
            this._weather = JSON.parse(weather);
            return true;
        }
        return false;
    },
    _saveToStorage: function () {
        localStorage.setItem('locality', this._locality);
        localStorage.setItem('weather', JSON.stringify(this._weather));
    },
    _updateWeather: function (update) {
        var _this = this;
        jQuery.ajax('http://free.worldweatheronline.com/feed/weather.ashx?callback=?', {
            dataType: 'jsonp',
            data: {
                q: [_this._latitude, _this._longitude].join(','),
                format: 'json',
                num_of_days: 5,
                key: 'b2926186a8204057122003'
            },
            success: function (data) {
                if (data.data) {}
                this._weather = data.data;
                update();
                this._saveToStorage();
            }.bind(this),
            error: function () {
                console.debug('weather ajax error');
            }
        })
    },
    _geocode: function (success) {
        var geocoder;
        if (YMaps.Geocoder) {
            geocoder = new YMaps.Geocoder(new YMaps.GeoPoint(this._longitude, this._latitude), {results: 1});
            YMaps.Events.observe(geocoder, geocoder.Events.Load, function () {
                try {
                    success(geocoder.get(0).AddressDetails.Country.Locality.LocalityName);
                } catch (e) {
                    console.debug('error');
                    throw e;
                }
            });
            YMaps.Events.observe(geocoder, geocoder.Events.Fault, function (error) {
                console.debug('geocoder.Events.Fault');
            });
        } else {
            YMaps.load(function () {
                this._geocode.call(this, success);
            }.bind(this))
        }
    },
    _watchLocation: function (update) {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(function (position) {
                if (this._latitude !== position.coords.latitude || this._longitude !== position.coords.longitude) {
                    this._latitude  = position.coords.latitude;
                    this._longitude = position.coords.longitude;
                    update();
                }
            }.bind(this), function () {
                console.debug('error');
            }, {
                maximumAge: 1000*60*30,
                timeout: 1000*60*5
            });
        }
    }
})