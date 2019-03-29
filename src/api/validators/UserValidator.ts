import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class UserValidator {

  @IsEmail( {}, {
    message: 'email invalid',
  })
  public email: string;

  @MinLength(8, {
    message: 'password must be atleast 8 characters in length',
  })
  public password: string;

  @IsNotEmpty()
  public username: string;
}