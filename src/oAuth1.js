import {inject} from 'aurelia-dependency-injection';
import {buildQueryString} from 'aurelia-path';
import {EventAggregator} from 'aurelia-event-aggregator';
import extend from 'extend';
import {Storage} from './storage';
import {Popup} from './popup';
import {BaseConfig} from './baseConfig';

@inject(Storage, Popup, BaseConfig, EventAggregator)
export class OAuth1 {
  constructor(storage, popup, config, ea) {
    this.storage  = storage;
    this.config   = config;
    this.eventAggregator   = ea;
    this.popup    = popup;
    this.defaults = {
      url: null,
      name: null,
      popupOptions: null,
      redirectUri: null,
      authorizationEndpoint: null
    };
  }

  open(options, userData, callback) {
    const provider  = extend(true, {}, this.defaults, options);
    const serverUrl = this.config.joinBase(provider.url);

    if (this.config.platform !== 'mobile') {
      this.popup = this.popup.open('', provider.name, provider.popupOptions, callback);
    }

    return this.config.client.post(serverUrl)
      .then(response => {
        const url = provider.authorizationEndpoint + '?' + buildQueryString(response);

        if (this.config.platform === 'mobile') {
          this.popup = this.popup.open(url, provider.name, provider.popupOptions,callback);
        } else {
          this.popup.popupWindow.location = url;
        }

        const popupListener = this.config.platform === 'mobile'
                            ? this.popup.eventListener(provider.redirectUri)
                            : this.popup.pollPopup();

        return popupListener.then(result => this.exchangeForToken(result, userData, provider, callback));
      });
  }

  exchangeForToken(oauthData, userData, provider, callback) {
    const data        = extend(true, {}, userData, oauthData);
    const serverUrl   = this.config.joinBase(provider.url);
    const credentials = this.config.withCredentials ? 'include' : 'same-origin';
    this.eventAggregator.publish('aurelia-authentication:exchangeForToken',{});
    if(callback){
      return callback(serverUrl,data);
    } else {
      return this.config.client.post(serverUrl, data, {credentials: credentials});
    }
  }
}
