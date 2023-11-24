import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateWishlistDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  image: string;

  @IsArray()
  @IsOptional()
  itemsId: number[];

  @IsString()
  @IsOptional()
  description: string;
}
