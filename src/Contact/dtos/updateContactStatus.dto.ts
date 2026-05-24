import { IsNotEmpty, IsIn, IsString } from 'class-validator';

export class UpdateContactStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['Non lu', 'Lu', 'Traité'])
  statut: string;
}
