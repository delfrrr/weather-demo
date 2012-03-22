BEM.DOM.decl('b-weather', {
    onSetMod: {
        'js': function () {
            var offline;
            this.alert = this.findBlockInside('b-weather-alert');

            //detect offline status
            window.applicationCache.addEventListener('error', function(){
                this.alert.show('offline', true);
                offline = true
            }.bind(this), false);

            //load weather from cache
            if (this._loadFromStorage()) {
                this._showWeather();
            }

            //update when online
            if (!offline) {
                this._update();
            }
        }
    },
    /**
     * Load Yandex Map Api
     */
    _getYMaps: function (success) {
        jQuery.ajax({
            url: 'http://api-maps.yandex.ru/1.1/index.xml',
            data: {
                loadByRequire: 1,
                key: 'ADs7a08BAAAAsaISNgMAiMg_3xobt-eInWEwP1lHDcPNN08AAAAAAAAAAAALn-u0gTCqq0YutMyLcWGs5clHNg=='
            },
            dataType: "script",
            success: function () {
              success();
            },
            error: function () {
                this.alert.show('errorYMaps', true);
            }.bind(this)
        });
    },
    _update: function () {
        this.alert.show('update');
        window.applicationCache.update();
        this._getYMaps(function () {
            this._getLocation(function () {
                this._geocode(function (newLocality) {
                    //FIXME maybe cache weather if this._locality == newLocality;
                    this._locality = newLocality;
                    this._updateWeather(function () {
                        //FIXME check update time;
                        this.alert.show('updated', true);
                        this._showWeather();
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }.bind(this));
    },
    _showWeather: function () {
        var conditionBlock = this.findBlockInside('b-weather-condition');
        conditionBlock.params.locality = this._locality;
        conditionBlock.params.condition = this._weather.current_condition[0];
        conditionBlock.setMod('data', 'new');
    },
    _locality: null,
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
    _updateWeather: function (success) {
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
                if (data.data) {
                    this._weather = data.data;
                    success();
                    this._saveToStorage();
                } else {
                    this._failUpdate('weatherApiDataError');
                }
            }.bind(this),
            error: function () {
                this._failUpdate('weatherApiTimeout');
            }.bind(this)
        })
    },
    _failUpdate: function (reason) {
        this.alert.show(reason);
    },
    _geocode: function (success) {
        var geocoder;
        if (YMaps.Geocoder) {
            geocoder = new YMaps.Geocoder(new YMaps.GeoPoint(this._longitude, this._latitude), {results: 1});
            YMaps.Events.observe(geocoder, geocoder.Events.Load, function () {
                try {
                    success(geocoder.get(0).AddressDetails.Country.Locality.LocalityName);
                } catch (e) {
                    this._failUpdate('geocoderDataError');
                    throw e;
                }
            });
            YMaps.Events.observe(geocoder, geocoder.Events.Fault, function (error) {
                this._failUpdate('geocoderFault');
            });
        } else {
            YMaps.load(function () {
                this._geocode.call(this, success);
            }.bind(this))
        }
    },
    _getLocationByIp: function (success) {
        if (YMaps.location) {
            this._latitude = YMaps.location.latitude;
            this._longitude = YMaps.location.longitude;
            this._locality = YMaps.location.city;
            success();
        } else {
            this._failUpdate('locationFailed');
        }
    },
    _getLocation: function (success) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                this._latitude  = position.coords.latitude;
                this._longitude = position.coords.longitude;
                success();
            }.bind(this), function () {
                this._getLocationByIp(success);
            }.bind(this));
        } else {
            this._getLocationByIp(success);
        }
    }
})