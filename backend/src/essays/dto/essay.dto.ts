import { IsString, IsNotEmpty, MinLength } from 'class-validator'

export class CreateEssayDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title!: string

  @IsString()
  @IsNotEmpty()
  contents!: string
}

export class UpdateEssayDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title!: string

  @IsString()
  @IsNotEmpty()
  contents!: string
} 