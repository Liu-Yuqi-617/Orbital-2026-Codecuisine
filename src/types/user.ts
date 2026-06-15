export class User {
  email: string;

  constructor(email: string) {
    this.email = email;
  }

  get username() {
    return this.email.split("@")[0];
  }
}