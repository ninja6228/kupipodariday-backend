import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  name: string;

  @IsString()
  @IsUrl()
  image: string;

  @IsArray()
  itemsId: number[];

  @IsString()
  @IsOptional()
  description: string;
}
