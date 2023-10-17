import {Injectable, OnDestroy} from '@angular/core';
import {TokenRenewListener, User} from "authorization-services-lib";
import {Constants} from "../constants";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class SessionService implements OnDestroy, TokenRenewListener {
  private static loggedIn: boolean = false;
  private static user: User;
  private store: boolean;
  constructor(private authService: AuthService) {
    const authToken: string = localStorage.getItem(Constants.SESSION_STORAGE.AUTH_TOKEN);
    const expires: number = +localStorage.getItem(Constants.SESSION_STORAGE.AUTH_EXPIRATION);
    let user: User = localStorage.getItem(Constants.SESSION_STORAGE.USER) ? User.clone(JSON.parse(localStorage.getItem(Constants.SESSION_STORAGE.USER))) : undefined;
    if (!user) {
      user = sessionStorage.getItem(Constants.SESSION_STORAGE.USER) ? User.clone(JSON.parse(sessionStorage.getItem(Constants.SESSION_STORAGE.USER))) : undefined;
    }
    SessionService.user = user;
    if (!expires || isNaN(expires) || expires < new Date().getTime()) {
      localStorage.removeItem(Constants.SESSION_STORAGE.AUTH_TOKEN);
      localStorage.removeItem(Constants.SESSION_STORAGE.AUTH_EXPIRATION);
      localStorage.removeItem(Constants.SESSION_STORAGE.USER);
    }
    if (authToken) {
      sessionStorage.setItem(Constants.SESSION_STORAGE.AUTH_TOKEN, authToken);
      sessionStorage.setItem(Constants.SESSION_STORAGE.USER, JSON.stringify(user));
      this.store = true;
      if (expires && !isNaN(expires)) {
        sessionStorage.setItem(Constants.SESSION_STORAGE.AUTH_EXPIRATION, expires.toString());
      }
      SessionService.loggedIn = true;
    }
    if ((authToken && expires)
      || (sessionStorage.getItem(Constants.SESSION_STORAGE.AUTH_TOKEN) && sessionStorage.getItem(Constants.SESSION_STORAGE.AUTH_EXPIRATION))) {
      this.setAutoRenew(authToken? authToken : sessionStorage.getItem(Constants.SESSION_STORAGE.AUTH_TOKEN)
        , expires ? expires : +sessionStorage.getItem(Constants.SESSION_STORAGE.AUTH_EXPIRATION));
    }
  }

  onTokenReceived(token: string, expiration: number, user: User): void {
    this.setToken(token, expiration);
    this.setUser(user);
    console.log('Token has been renewed successfully.', token);
  }
  onException(error: any): void {
    console.error('There was an exception while renewing the token.');
    this.clearToken();
  }

  private setAutoRenew(token: string, expires: number): void {
    // ADD HERE ALL SERVICES NEED TO BE CALLED TO RENEW TOKEN
    this.authService.autoRenewToken(token, expires, this);
  }

  ngOnDestroy(): void {
    this.clearToken();
  }

  clearToken(): void {
    sessionStorage.removeItem(Constants.SESSION_STORAGE.AUTH_TOKEN);
    sessionStorage.removeItem(Constants.SESSION_STORAGE.AUTH_EXPIRATION);
    sessionStorage.removeItem(Constants.SESSION_STORAGE.USER);
    this.store = undefined;
    localStorage.removeItem(Constants.SESSION_STORAGE.AUTH_TOKEN);
    localStorage.removeItem(Constants.SESSION_STORAGE.AUTH_EXPIRATION);
    localStorage.removeItem(Constants.SESSION_STORAGE.USER);
    SessionService.loggedIn = false;
    SessionService.user = undefined;
  }

  setToken(token: string, expires: number, enableStore: boolean = undefined, autoRenew: boolean = false): void {
    if (!token || !expires) {
      this.clearToken();
      return;
    }
    sessionStorage.setItem(Constants.SESSION_STORAGE.AUTH_TOKEN, token);
    sessionStorage.setItem(Constants.SESSION_STORAGE.AUTH_EXPIRATION, expires.toString());
    if (enableStore !== undefined) {
      this.store = enableStore;
      if (!enableStore) {
        localStorage.removeItem(Constants.SESSION_STORAGE.AUTH_TOKEN);
        localStorage.removeItem(Constants.SESSION_STORAGE.AUTH_EXPIRATION);
      }
    }
    if (this.store) {
      localStorage.setItem(Constants.SESSION_STORAGE.AUTH_TOKEN, token);
      localStorage.setItem(Constants.SESSION_STORAGE.AUTH_EXPIRATION, expires.toString());
    }
    if (autoRenew) {
      this.setAutoRenew(token, expires);
    }
    SessionService.loggedIn = true;
  }

  static getToken(): string {
    return sessionStorage.getItem(Constants.SESSION_STORAGE.AUTH_TOKEN);
  }

  static isTokenExpired(): boolean {
    const expired: boolean = !sessionStorage.getItem(Constants.SESSION_STORAGE.AUTH_EXPIRATION) ||
      new Date().getTime() > +sessionStorage.getItem(Constants.SESSION_STORAGE.AUTH_EXPIRATION) || !SessionService.getToken();
    if (!expired) {
      SessionService.loggedIn = true;
    }
    return expired;
  }
  getExpirationDate(): Date {
    const sessionExpiration = sessionStorage.getItem(Constants.SESSION_STORAGE.AUTH_EXPIRATION);
    if (!isNaN(+sessionExpiration)) {
      return new Date(+sessionStorage.getItem(Constants.SESSION_STORAGE.AUTH_EXPIRATION));
    }
    return null;
  }

  static get isLoggedIn(): boolean {
    return SessionService.loggedIn;
  }

  setUser(user: User, enableStore: boolean = undefined): void {
    sessionStorage.setItem(Constants.SESSION_STORAGE.USER, JSON.stringify(user));
    if (enableStore !== undefined) {
      if (!enableStore) {
        localStorage.removeItem(Constants.SESSION_STORAGE.USER);
      }
    }
    if (this.store) {
      localStorage.setItem(Constants.SESSION_STORAGE.USER, JSON.stringify(user));
    }
    SessionService.user = user;
  }

  static getUser(): User {
    return SessionService.user;
  }

}
