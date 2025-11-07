import {User} from "../models/user";

export interface TokenRenewListener {
  onTokenReceived(token: string, expiration: number, user: User): void;
  onException(error: any): void;
}
