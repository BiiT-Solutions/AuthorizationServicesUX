export interface TokenRenewListener {
  onTokenReceived(token: string, expiration: number): void;
  onException(error: any): void;
}
