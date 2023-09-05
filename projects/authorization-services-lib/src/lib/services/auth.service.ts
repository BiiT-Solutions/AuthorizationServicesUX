import {HttpClient, HttpResponse} from "@angular/common/http";
import {Observable} from "rxjs";
import {User} from "../models/user";
import {CreateUserRequest} from "../models/create-user-request";
import {LoginRequest} from "../models/login-request";
import {PasswordRequest} from "../models/password-request";
import {TokenRenewListener} from "./token-renew";
import {AuthCalls} from "./auth-calls";

export class AuthService implements AuthCalls {

  public static readonly ROOT_PATH: string = '/auth';
  private static readonly MIN_WAIT_TIME: number = 1000;
  private static readonly TOLERANCE: number = 1000 * 60 * 5; // 5 minutes
  private timeoutId: number;
  constructor(private serverUrl: URL, private httpClient: HttpClient) { }
  public getAll(): Observable<User[]> {
    return this.httpClient.get<User[]>(`${this.serverUrl}${AuthService.ROOT_PATH}/register`);
  }
  public add(user: User): Observable<User> {
    return this.httpClient.post<User>(`${this.serverUrl}${AuthService.ROOT_PATH}/register`, user);
  }
  public update(request: CreateUserRequest): Observable<User> {
    return this.httpClient.patch<User>(`${this.serverUrl}${AuthService.ROOT_PATH}/register`, request);
  }
  public login(request: LoginRequest): Observable<HttpResponse<User>> {
    return this.httpClient.post<User>(`${this.serverUrl}${AuthService.ROOT_PATH}/public/login`, request, {observe: 'response'});
  }
  public changePassword(request: PasswordRequest): Observable<void> {
    return this.httpClient.post<void>(`${this.serverUrl}${AuthService.ROOT_PATH}/password`, request);
  }
  public getRoles(): Observable<string[]> {
    return this.httpClient.get<string[]>(`${this.serverUrl}${AuthService.ROOT_PATH}/roles`);
  }
  public deleteByUserName(username: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.serverUrl}${AuthService.ROOT_PATH}/register/${username}`);
  }

  public cancelAutoRenew(): void {
    clearTimeout(this.timeoutId);
  }

  public autoRenewToken(token: string, expiration: number, tokenRenewListener: TokenRenewListener,
                        tolerance: number = AuthService.TOLERANCE): void {
    if (this.timeoutId != null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    const expirationDate: Date = new Date(expiration);
    const now: Date = new Date();
    const expirationTime: number = expirationDate.getTime() - AuthService.TOLERANCE - now.getTime();
    this.setTimeoutRenew(token, expirationTime, tokenRenewListener, tolerance);
    console.log(`Next token renew on: ${expirationDate}`);
  }
  private setTimeoutRenew(token: string, timeout: number, tokenRenewListener: TokenRenewListener,
                          tolerance: number): void {
    if (isNaN(timeout)) {
      console.error(`Timeout should be a number and received '${timeout}'`)
      return;
    }
    if (timeout < AuthService.MIN_WAIT_TIME) {
      timeout = AuthService.MIN_WAIT_TIME;
    }
    this.timeoutId = setTimeout((): void => {
      this.renew(token).subscribe(
        {
          next: (res: HttpResponse<User>): void => {
            if (!res) {
              console.error('Server returned invalid response');
              return;
            }
            const authToken: string = res.headers.get('authorization');
            const expiration: number = Number(res.headers.get('expires'));
            const user: User = User.clone(res.body);
            if (!authToken || !expiration) {
              throw new Error('Server returned invalid response');
            }
            if (isNaN(expiration)) {
              throw new Error('Server returned invalid expiration time');
            }
            console.log(`Next token renew on: ${new Date(expiration)}`);
            tokenRenewListener.onTokenReceived(authToken, expiration, user);
            const newTimeOut: number = expiration - new Date().getTime() - tolerance;
            this.setTimeoutRenew(authToken, newTimeOut, tokenRenewListener, tolerance);

          },
          error: (err: any): void => {
            tokenRenewListener.onException(err);
            clearTimeout(this.timeoutId);
          }
        }
      )
    }, timeout)
  }
  public renew(token ?: string): Observable<HttpResponse<User>> {
    return token ?
      this.httpClient.get<User>(
        `${this.serverUrl}${AuthService.ROOT_PATH}/jwt/renew`, {headers: {'Authorization': 'Bearer ' + token}, observe: 'response'})
      : this.httpClient.get<User>(
        `${this.serverUrl}${AuthService.ROOT_PATH}/jwt/renew`, {observe: 'response'});
  }
}
