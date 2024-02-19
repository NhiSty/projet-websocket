import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Quiz, User } from '@prisma/client';
import { QuizWithAuthor } from 'src/types/quiz';
import { Paginated } from 'src/types/pagination';

@Injectable()
export class QuizService {
  public constructor(private databaseService: DatabaseService) {}

  public async create(name: string, author: User): Promise<Quiz> {
    return this.databaseService.quiz.create({
      data: {
        name,
        author: { connect: { id: author.id } },
      },
    });
  }

  public async find(id: string): Promise<QuizWithAuthor | null> {
    return this.databaseService.quiz.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true } },
        questions: { include: { answers: true } },
      },
    });
  }

  public async findMany(
    page: number,
    search?: string,
  ): Promise<Paginated<QuizWithAuthor>> {
    const totalItems = await this.databaseService.quiz.count({
      where: {
        name: search && {
          contains: search,
          mode: 'insensitive',
        },
      },
    });

    const quiz = await this.databaseService.quiz.findMany({
      take: 10,
      skip: (page - 1) * 10,
      where: {
        name: search && {
          contains: search,
          mode: 'insensitive',
        },
      },
      orderBy: {
        name: 'asc',
      },
      include: {
        author: { select: { id: true, username: true } },
        questions: { include: { answers: true } },
      },
    });

    const totalPages = Math.ceil(totalItems / 10);

    return {
      items: quiz,
      totalItems,
      totalPages,
    };
  }

  public async update(quiz: Quiz): Promise<Quiz> {
    return await this.databaseService.quiz.update({
      where: { id: quiz.id },
      data: { name: quiz.name },
    });
  }

  public async delete(quiz: Quiz): Promise<void> {
    await this.databaseService.quiz.delete({
      where: { id: quiz.id },
    });
  }
}
