import {ElementDto} from "./element-dto";

export class User extends ElementDto {
  idCard: string;
  username: string;
  name: string;
  lastname: string;
  email: string;
  phone: string;
  languageId: string;
  password: string;
  passwordModifiedDate: Date;
  accountLocked: boolean;
  accountBlocked: boolean;
  enabled: boolean;
  city: string;

  public static override clone(from: User): User {
    const to: User = new User();
    User.copy(from, to);
    return to;
  }

  public static override copy(from: User, to: User): void {
    super.copy(from, to);
    to.idCard = from.idCard;
    to.username = from.username;
    to.name = from.name;
    to.lastname = from.lastname;
    to.email = from.email;
    to.phone = from.phone;
    to.languageId = from.languageId;
    to.password = from.password;
    to.passwordModifiedDate = from.passwordModifiedDate ? new Date(from.passwordModifiedDate) : null;
    to.accountLocked = from.accountLocked;
    to.accountBlocked = from.accountBlocked;
    to.enabled = from.enabled;
    to.city = from.city;
  }
}
