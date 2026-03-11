import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentInput, UpdateCommentInput } from './dto/create-comment.input';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByPost(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId, parentId: null, isDeleted: false },
      include: {
        author: { select: { id: true, username: true, fullName: true, reputationScore: true } },
        replies: {
          where: { isDeleted: false },
          include: {
            author: { select: { id: true, username: true, fullName: true, reputationScore: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true, fullName: true, reputationScore: true } },
        replies: {
          where: { isDeleted: false },
          include: {
            author: { select: { id: true, username: true, fullName: true, reputationScore: true } },
          },
        },
      },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  async create(userId: string, input: CreateCommentInput) {
    // Verify parent exists if it's a reply
    if (input.parentId) {
      const parent = await this.prisma.comment.findUnique({ where: { id: input.parentId } });
      if (!parent) throw new NotFoundException('Parent comment not found');
    }

    return this.prisma.comment.create({
      data: {
        authorId: userId,
        postId: input.postId,
        parentId: input.parentId || null,
        content: input.content,
      },
      include: {
        author: { select: { id: true, username: true, fullName: true, reputationScore: true } },
      },
    });
  }

  async update(userId: string, commentId: string, input: UpdateCommentInput) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId) throw new ForbiddenException('Not authorized');

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { content: input.content, updatedAt: new Date() },
      include: {
        author: { select: { id: true, username: true, fullName: true, reputationScore: true } },
      },
    });
  }

  async softDelete(userId: string, userRole: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId && userRole !== 'admin') {
      throw new ForbiddenException('Not authorized');
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted: true, content: '[deleted]' },
    });
  }
}
