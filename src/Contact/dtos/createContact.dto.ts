import { IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty()
  @IsString()
  nom: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsNotEmpty()
  @IsString()
  objet: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}
