import { IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateWishDto {
  @IsString()
  name: string;

  @IsUrl()
  link: string;

  @IsUrl()
  image: string;

  @IsNumber()
  price: number;

  @IsString()
  @IsOptional()
  description: string;
}
