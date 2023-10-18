import {Injectable, OnDestroy} from '@angular/core';
import {Constants} from "../constants";
import {AuthService} from "./auth.service";
import {TokenRenewListener} from "./token-renew";
import {User} from "../models/user";

@Injectable({
  providedIn: 'root'
})
export class SessionService implements OnDestroy, TokenRenewListener {
  private loggedIn: boolean = false;
  private user: User;
  private store: boolean;
  constructor(private authService: AuthService) {
    const authToken: string = localStorage.getItem(Constants.SESSION_STORAGE.AUTH_TOKEN);
    const expires: number = +localStorage.getItem(Constants.SESSION_STORAGE.AUTH_EXPIRATION);
    let user: User = localStorage.getItem(Constants.SESSION_STORAGE.USER) ? User.clone(JSON.parse(localStorage.getItem(Constants.SESSION_STORAGE.USER))) : undefined;
    if (!user) {
      user = sessionStorage.getItem(Constants.SESSION_STORAGE.USER) ? User.clone(JSON.parse(sessionStorage.getItem(Constants.SESSION_STORAGE.USER))) : undefined;
    }
    this.user = user;
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
      this.loggedIn = true;
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
    this.loggedIn = false;
    this.user = undefined;
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
    this.loggedIn = true;
  }

  getToken(): string {
    return sessionStorage.getItem(Constants.SESSION_STORAGE.AUTH_TOKEN);
  }

  isTokenExpired(): boolean {
    const expired: boolean = !sessionStorage.getItem(Constants.SESSION_STORAGE.AUTH_EXPIRATION) ||
      new Date().getTime() > +sessionStorage.getItem(Constants.SESSION_STORAGE.AUTH_EXPIRATION) || !this.getToken();
    if (!expired) {
      this.loggedIn = true;
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

  get isLoggedIn(): boolean {
    return this.loggedIn;
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
    this.user = user;
  }

  getUser(): User {
    return this.user;
  }

}
