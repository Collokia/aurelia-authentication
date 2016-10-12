import * as LogManager from 'aurelia-logging';
import {PLATFORM,DOM} from 'aurelia-pal';
import {parseQueryString,join,buildQueryString} from 'aurelia-path';
import {inject} from 'aurelia-dependency-injection';
import {EventAggregator} from 'aurelia-event-aggregator';
import {deprecated} from 'aurelia-metadata';
import {BindingSignaler} from 'aurelia-templating-resources';
import {Redirect} from 'aurelia-router';
import {HttpClient} from 'aurelia-fetch-client';
import {Config,Rest} from 'aurelia-api';

export declare class Popup {
  constructor();
  open(url?: any, windowName?: any, options?: any): any;
  eventListener(redirectUri?: any): any;
  pollPopup(): any;
}
export declare class CognitoAuth {
  constructor(config?: any);
  registerUser(username?: any, password?: any, userAttributes?: any): any;
  confirmUser(username?: any, code?: any): any;
  loginUser(username?: any, password?: any): any;
  getSession(): any;
  logoutUser(): any;
  getUserAttributes(): any;
  forgotPassword(username?: any): any;
  verificationCode(username?: any, verificationCode?: any, newPassword?: any): any;
  resendVerificationCode(username?: any): any;
}
export declare class AuthFilterValueConverter {
  
  /**
     * route toView predictator on route.config.auth === isAuthenticated
     * @param  {RouteConfig}  routes            the routes array to convert
     * @param  {Boolean}      isAuthenticated   authentication status
     * @return {Boolean}      show/hide element
     */
  toView(routes?: any, isAuthenticated?: any): any;
}
export declare class AuthenticatedFilterValueConverter {
  constructor(authService?: any);
  
  /**
     * route toView predictator on route.config.auth === (parameter || authService.isAuthenticated())
     * @param  {RouteConfig}  routes            the routes array to convert
     * @param  {[Boolean]}    [isAuthenticated] optional isAuthenticated value. default: this.authService.authenticated
     * @return {Boolean}      show/hide element
     */
  toView(routes?: any, isAuthenticated?: any): any;
}
export declare class AuthenticatedValueConverter {
  constructor(authService?: any);
  
  /**
     * element toView predictator on authService.isAuthenticated()
     * @return {Boolean}  show/hide element
     */
  toView(): any;
}