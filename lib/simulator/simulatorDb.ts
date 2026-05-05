/**
 * In-memory Simulator Database
 * Provides a mock database implementation for development/testing
 * Uses the same interfaces as MongoDB models
 */

import { IUser } from '@/db/models/user.model';
import { IQuestion } from '@/db/models/question.model';
import { IAnswer } from '@/db/models/answer.model';
import { ITag } from '@/db/models/tag.model';
import { IInteraction } from '@/db/models/interaction.model';
import { IReply } from '@/db/models/reply.model';
import { Schema } from 'mongoose';

export interface SimulatorStore {
  users: Map<string, IUser & { _id: string; createdAt: Date; updatedAt: Date }>;
  questions: Map<string, IQuestion & { _id: string }>;
  answers: Map<string, IAnswer & { _id: string }>;
  tags: Map<string, ITag & { _id: string }>;
  interactions: Map<string, IInteraction & { _id: string }>;
  replies: Map<string, IReply & { _id: string }>;
  idCounter: { [key: string]: number };
}

class SimulatorDatabase {
  private static instance: SimulatorDatabase;
  private store: SimulatorStore;
  private isInitialized: boolean = false;

  private constructor() {
    this.store = {
      users: new Map(),
      questions: new Map(),
      answers: new Map(),
      tags: new Map(),
      interactions: new Map(),
      replies: new Map(),
      idCounter: {
        users: 0,
        questions: 0,
        answers: 0,
        tags: 0,
        interactions: 0,
        replies: 0,
      },
    };
  }

  static getInstance(): SimulatorDatabase {
    if (!SimulatorDatabase.instance) {
      SimulatorDatabase.instance = new SimulatorDatabase();
    }
    return SimulatorDatabase.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    this.seedData();
    this.isInitialized = true;
  }

  private generateId(type: string): string {
    let counter = this.store.idCounter[type] || 0;
    this.store.idCounter[type] = counter + 1;
    return `${type}_${counter}_${Date.now()}`;
  }

  private seedData(): void {
    // Seed users
    const users = [
      {
        _id: this.generateId('users'),
        clerkId: 'clerk_user_1',
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
        bio: 'Full-stack developer',
        location: 'San Francisco',
        portfolio: 'https://johndoe.com',
        reputation: 150,
        savedQuestions: [],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-03-20'),
      },
      {
        _id: this.generateId('users'),
        clerkId: 'clerk_user_2',
        name: 'Jane Smith',
        username: 'janesmith',
        email: 'jane@example.com',
        picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
        bio: 'React specialist',
        location: 'New York',
        portfolio: 'https://janesmith.dev',
        reputation: 280,
        savedQuestions: [],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-03-18'),
      },
      {
        _id: this.generateId('users'),
        clerkId: 'clerk_user_3',
        name: 'Mike Johnson',
        username: 'mikej',
        email: 'mike@example.com',
        picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
        bio: 'DevOps Engineer',
        location: 'London',
        portfolio: 'https://mikej.io',
        reputation: 420,
        savedQuestions: [],
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-03-19'),
      },
    ];

    users.forEach((user) => {
      this.store.users.set(user._id, user);
    });

    // Seed tags
    const tagNames = [
      {
        name: 'typescript',
        description: 'TypeScript is a typed superset of JavaScript',
        Companywebsite: 'https://www.typescriptlang.org',
        Developedby: 'Microsoft',
      },
      {
        name: 'react',
        description: 'A JavaScript library for building user interfaces',
        Companywebsite: 'https://react.dev',
        Developedby: 'Meta',
      },
      {
        name: 'nextjs',
        description: 'The React Framework for Production',
        Companywebsite: 'https://nextjs.org',
        Developedby: 'Vercel',
      },
      {
        name: 'mongodb',
        description: 'The most popular database for modern apps',
        Companywebsite: 'https://www.mongodb.com',
        Developedby: 'MongoDB Inc',
      },
      {
        name: 'node.js',
        description: 'JavaScript runtime for server-side development',
        Companywebsite: 'https://nodejs.org',
        Developedby: 'OpenJS Foundation',
      },
    ];

    const tags: (ITag & { _id: string })[] = tagNames.map((tag) => ({
      _id: this.generateId('tags'),
      ...tag,
      questions: [],
      followers: [],
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-03-20'),
    }));

    tags.forEach((tag) => {
      this.store.tags.set(tag._id, tag);
    });

    // Seed questions
    const user1Id = Array.from(this.store.users.keys())[0];
    const user2Id = Array.from(this.store.users.keys())[1];
    const tagIds = Array.from(this.store.tags.keys());

    const questions: (IQuestion & { _id: string })[] = [
      {
        _id: this.generateId('questions'),
        title: 'How to setup TypeScript in Next.js?',
        content: 'I am trying to setup TypeScript in my Next.js project but getting errors',
        tags: [tagIds[0], tagIds[2]] as any, // typescript, nextjs
        views: 245,
        upvotes: [user2Id] as any,
        downvotes: [],
        author: user1Id as any,
        answers: [],
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15'),
      },
      {
        _id: this.generateId('questions'),
        title: 'React hooks best practices',
        content: 'What are the best practices for using React hooks in large applications?',
        tags: [tagIds[1]] as any, // react
        views: 512,
        upvotes: [user1Id, user2Id] as any,
        downvotes: [],
        author: user2Id as any,
        answers: [],
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-03-10'),
      },
      {
        _id: this.generateId('questions'),
        title: 'MongoDB aggregation pipeline explained',
        content: 'Can someone explain how aggregation pipelines work in MongoDB?',
        tags: [tagIds[3]] as any, // mongodb
        views: 389,
        upvotes: [user1Id] as any,
        downvotes: [],
        author: user2Id as any,
        answers: [],
        createdAt: new Date('2024-03-05'),
        updatedAt: new Date('2024-03-05'),
      },
      {
        _id: this.generateId('questions'),
        title: 'Async/await vs Promises in Node.js',
        content: 'What is the difference between async/await and promises?',
        tags: [tagIds[4]] as any, // node.js
        views: 723,
        upvotes: [user1Id, user2Id] as any,
        downvotes: [],
        author: user1Id as any,
        answers: [],
        createdAt: new Date('2024-02-28'),
        updatedAt: new Date('2024-02-28'),
      },
      {
        _id: this.generateId('questions'),
        title: 'Getting started with Next.js 14',
        content: 'How to get started with Next.js 14 and its new features?',
        tags: [tagIds[2]] as any, // nextjs
        views: 156,
        upvotes: [],
        downvotes: [],
        author: user1Id as any,
        answers: [],
        createdAt: new Date('2024-03-20'),
        updatedAt: new Date('2024-03-20'),
      },
    ];

    questions.forEach((question) => {
      this.store.questions.set(question._id, question);
      // Add question to tags
      question.tags.forEach((tagId) => {
        const tag = this.store.tags.get(tagId.toString());
        if (tag) {
          (tag.questions as any[]).push(question._id);
        }
      });
    });

    // Seed answers
    const question1Id = Array.from(this.store.questions.keys())[0];
    const question2Id = Array.from(this.store.questions.keys())[1];

    const answers: (IAnswer & { _id: string })[] = [
      {
        _id: this.generateId('answers'),
        author: user2Id as any,
        question: question1Id as any,
        content: 'You need to configure tsconfig.json properly. Here is the setup....',
        upvotes: [user1Id] as any,
        downvotes: [],
        createdAt: new Date('2024-03-16'),
        updatedAt: new Date('2024-03-16'),
      },
      {
        _id: this.generateId('answers'),
        author: user1Id as any,
        question: question2Id as any,
        content: 'The best practice is to keep hooks at the top level...',
        upvotes: [user2Id] as any,
        downvotes: [],
        createdAt: new Date('2024-03-11'),
        updatedAt: new Date('2024-03-11'),
      },
    ];

    answers.forEach((answer) => {
      this.store.answers.set(answer._id, answer);
      // Add answer to question
      const question = this.store.questions.get(answer.question.toString());
      if (question) {
        (question.answers as any[]).push(answer._id);
      }
    });

    // Seed replies
    const answer1Id = Array.from(this.store.answers.keys())[0];
    const replies: (IReply & { _id: string })[] = [
      {
        _id: this.generateId('replies'),
        author: user1Id as any,
        answer: answer1Id as any,
        content: 'Thanks for the answer, it really helped!',
        createdAt: new Date('2024-03-17'),
        updatedAt: new Date('2024-03-17'),
      },
    ];

    replies.forEach((reply) => {
      this.store.replies.set(reply._id, reply);
    });

    console.log('[Simulator] Database initialized with seed data');
  }

  getStore(): SimulatorStore {
    return this.store;
  }

  reset(): void {
    this.store = {
      users: new Map(),
      questions: new Map(),
      answers: new Map(),
      tags: new Map(),
      interactions: new Map(),
      replies: new Map(),
      idCounter: {
        users: 0,
        questions: 0,
        answers: 0,
        tags: 0,
        interactions: 0,
        replies: 0,
      },
    };
    this.isInitialized = false;
  }
}

export default SimulatorDatabase;
