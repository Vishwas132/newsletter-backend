import { IsString, IsIn, IsNotEmpty } from 'class-validator';

export class SegmentRuleDto {
  @IsString()
  @IsNotEmpty()
  field: string;

  @IsString()
  @IsIn([
    'equals',
    'contains',
    'startsWith',
    'endsWith',
    'greaterThan',
    'lessThan',
  ])
  operator: string;

  @IsNotEmpty()
  value: any;
}
