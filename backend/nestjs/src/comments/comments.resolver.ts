import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentDto } from './dto/comment.dto';
import { CreateCommentInput, UpdateCommentInput } from './dto/create-comment.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver(() => CommentDto)
export class CommentsResolver {
  constructor(private readonly commentsService: CommentsService) {}

  @Query(() => [CommentDto], { name: 'commentsByPost' })
  async getCommentsByPost(@Args('postId', { type: () => ID }) postId: string) {
    return this.commentsService.findByPost(postId);
  }

  @Query(() => CommentDto, { name: 'comment' })
  async getComment(@Args('id', { type: () => ID }) id: string) {
    return this.commentsService.findById(id);
  }

  @Mutation(() => CommentDto)
  @UseGuards(JwtAuthGuard)
  async createComment(
    @CurrentUser() user: any,
    @Args('input') input: CreateCommentInput,
  ) {
    return this.commentsService.create(user.id, input);
  }

  @Mutation(() => CommentDto)
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @CurrentUser() user: any,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCommentInput,
  ) {
    return this.commentsService.update(user.id, id, input);
  }

  @Mutation(() => CommentDto)
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @CurrentUser() user: any,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.commentsService.softDelete(user.id, user.role, id);
  }
}
