import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama produk tidak boleh kosong' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Harga tidak boleh negatif' })
  price: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Stok tidak boleh negatif' })
  @IsOptional()
  stock?: number;

  @IsString()
  @IsNotEmpty({ message: 'Kategori tidak boleh kosong' })
  categoryId: string;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
