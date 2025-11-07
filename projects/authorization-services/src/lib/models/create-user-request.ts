export class CreateUserRequest {
  uniqueId: string;
  username: string;
  firstname: string;
  lastname: string;
  password: string;
  fullname: string;
  authorities: string[];

  public static copy(from: CreateUserRequest, to: CreateUserRequest): void {
    to.uniqueId = from.uniqueId;
    to.username = from.username;
    to.firstname = from.firstname;
    to.lastname = from.lastname;
    to.password = from.password;
    to.fullname = from.fullname;
    to.authorities = from.authorities;
  }
  public static clone(from: CreateUserRequest): CreateUserRequest {
    const to: CreateUserRequest = new CreateUserRequest();
    CreateUserRequest.copy(from, to);
    return to;
  }
}
