import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class CommentDto {
  @Field(() => ID)
  id: string;

  @Field()
  authorId: string;

  @Field()
  postId: string;

  @Field(() => String, { nullable: true })
  parentId?: string | null;

  @Field()
  content: string;

  @Field()
  isDeleted: boolean;

  @Field(() => Int)
  upvotes: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [CommentDto], { nullable: true })
  replies?: CommentDto[];
}

@ObjectType()
export class AuthorDto {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;

  @Field(() => String, { nullable: true })
  fullName?: string | null;

  @Field(() => Int)
  reputationScore: number;
}
