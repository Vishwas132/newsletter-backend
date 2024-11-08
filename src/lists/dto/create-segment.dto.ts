import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSegmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SegmentRule)
  rules: SegmentRule[];
}

export class SegmentRule {
  @IsString()
  @IsNotEmpty()
  field: string;

  @IsString()
  @IsIn(['equals', 'contains', 'greaterThan', 'lessThan'])
  operator: string;

  @IsNotEmpty()
  value: any;
}
