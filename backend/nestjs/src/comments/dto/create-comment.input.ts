import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';

@InputType()
export class CreateCommentInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  content: string;

  @Field()
  @IsUUID()
  postId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

@InputType()
export class UpdateCommentInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  content: string;
}
