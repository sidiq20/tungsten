import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const mockPrismaService = {
  comment: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('CommentsService', () => {
  let service: CommentsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    prisma = module.get<PrismaService>(PrismaService);
    
    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const mockUser = { id: 'user-1', username: 'testuser', fullName: 'Test User', reputationScore: 10 };
    
    it('should create a new comment successfully', async () => {
      const createInput = { postId: 'post-1', content: 'Great post!' };
      const expectedResult = {
        id: 'comment-1',
        authorId: 'user-1',
        postId: 'post-1',
        parentId: null,
        content: 'Great post!',
        author: mockUser,
      };

      mockPrismaService.comment.create.mockResolvedValue(expectedResult);

      const result = await service.create('user-1', createInput);

      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          authorId: 'user-1',
          postId: 'post-1',
          parentId: null,
          content: 'Great post!',
        },
        include: {
          author: { select: { id: true, username: true, fullName: true, reputationScore: true } },
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if parent comment is not found', async () => {
      const createInput = { postId: 'post-1', parentId: 'invalid-parent', content: 'Reply!' };
      
      mockPrismaService.comment.findUnique.mockResolvedValue(null);

      await expect(service.create('user-1', createInput)).rejects.toThrow(NotFoundException);
      expect(prisma.comment.findUnique).toHaveBeenCalledWith({ where: { id: 'invalid-parent' } });
      expect(prisma.comment.create).not.toHaveBeenCalled();
    });
  });

  describe('softDelete', () => {
    it('should allow author to soft delete their comment', async () => {
      const mockComment = { id: 'comment-1', authorId: 'user-1', content: 'To be deleted' };
      mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);
      mockPrismaService.comment.update.mockResolvedValue({ ...mockComment, isDeleted: true, content: '[deleted]' });

      await service.softDelete('user-1', 'user', 'comment-1');

      expect(prisma.comment.update).toHaveBeenCalledWith({
        where: { id: 'comment-1' },
        data: { isDeleted: true, content: '[deleted]' },
      });
    });

    it('should throw ForbiddenException if user is not author and not admin', async () => {
      const mockComment = { id: 'comment-1', authorId: 'user-1', content: 'To be deleted' };
      mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);

      await expect(service.softDelete('user-2', 'user', 'comment-1')).rejects.toThrow(ForbiddenException);
      expect(prisma.comment.update).not.toHaveBeenCalled();
    });
    
    it('should allow admin to soft delete any comment', async () => {
      const mockComment = { id: 'comment-1', authorId: 'user-1', content: 'To be deleted' };
      mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);
      mockPrismaService.comment.update.mockResolvedValue({ ...mockComment, isDeleted: true, content: '[deleted]' });

      await service.softDelete('admin-user', 'admin', 'comment-1');

      expect(prisma.comment.update).toHaveBeenCalled();
    });
  });
});
