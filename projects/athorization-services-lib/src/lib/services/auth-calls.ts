import {Observable} from "rxjs";
import {User} from "../models/user";
import {CreateUserRequest} from "../models/create-user-request";
import {LoginRequest} from "../models/login-request";
import {PasswordRequest} from "../models/password-request";
import {HttpResponse} from "@angular/common/http";
import {TokenRenewListener} from "./token-renew";

export interface AuthCalls {
  getAll(): Observable<User[]>;
  add(user: User): Observable<User>;
  update(request: CreateUserRequest): Observable<User>;
  login(request: LoginRequest): Observable<HttpResponse<User>>;
  changePassword(request: PasswordRequest): Observable<void>;
  getRoles(): Observable<string[]>;
  deleteByUserName(username: string): Observable<void>;
  cancelAutoRenew(): void;
  autoRenewToken(token: string, expiration: number, tokenRenewListener: TokenRenewListener, tolerance: number): void;
}
