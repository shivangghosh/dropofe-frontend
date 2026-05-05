/**
 * Simulator Models - In-memory implementations of Mongoose models
 * Provides the same interface as the real models for seamless switching
 */

import SimulatorDatabase from './simulatorDb';
import { IUser } from '@/db/models/user.model';
import { IQuestion } from '@/db/models/question.model';
import { IAnswer } from '@/db/models/answer.model';
import { ITag } from '@/db/models/tag.model';
import { IInteraction } from '@/db/models/interaction.model';
import { IReply } from '@/db/models/reply.model';
import { FilterQuery } from 'mongoose';

type AnyDoc = any;

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Utility function to convert Map values to array and apply filters
function filterDocuments<T extends AnyDoc>(
  documents: T[],
  query: FilterQuery<T>,
): T[] {
  return documents.filter((doc: any) => {
    for (const key in query) {
      const condition = (query as any)[key];

      if (condition && typeof condition === 'object') {
        if ('$regex' in condition) {
          const regex = condition.$regex;
          const options = condition.$options || '';
          const re = new RegExp(regex.source, options);
          if (!re.test(doc[key])) return false;
        } else if ('$size' in condition) {
          if (Array.isArray(doc[key])) {
            if (doc[key].length !== condition.$size) return false;
          } else {
            return false;
          }
        } else if ('$or' in condition) {
          const orConditions = condition.$or as any[];
          const matches = orConditions.some((orCond) => {
            for (const orKey in orCond) {
              const orValue = orCond[orKey];
              if (orValue && typeof orValue === 'object' && '$regex' in orValue) {
                const re = new RegExp(orValue.$regex.source, orValue.$options || '');
                if (re.test(doc[orKey])) return true;
              } else if (doc[orKey] === orValue) {
                return true;
              }
            }
            return false;
          });
          if (!matches) return false;
        }
      } else if (condition !== undefined) {
        if (doc[key] !== condition) return false;
      }
    }
    return true;
  });
}

export class SimulatorUserModel {
  static async find(query: FilterQuery<IUser> = {}) {
    const db = SimulatorDatabase.getInstance();
    const documents = Array.from(db.getStore().users.values());
    return filterDocuments(documents, query);
  }

  static async findOne(query: FilterQuery<IUser>) {
    const results = await this.find(query);
    return results[0] || null;
  }

  static async findById(id: string) {
    const db = SimulatorDatabase.getInstance();
    return db.getStore().users.get(id) || null;
  }

  static async findByIdAndUpdate(id: string, update: any, options?: any) {
    const db = SimulatorDatabase.getInstance();
    const doc: any = db.getStore().users.get(id);
    if (!doc) return null;

    const updateOperation = update;
    if (updateOperation.$inc) {
      for (const key in updateOperation.$inc) {
        doc[key] = (doc[key] || 0) + updateOperation.$inc[key];
      }
    }
    if (updateOperation.$set) {
      Object.assign(doc, updateOperation.$set);
    }
    if (updateOperation.$push) {
      for (const key in updateOperation.$push) {
        if (!Array.isArray(doc[key])) {
          doc[key] = [];
        }
        doc[key].push(updateOperation.$push[key]);
      }
    }

    const cleanUpdate = { ...update };
    delete cleanUpdate.$inc;
    delete cleanUpdate.$set;
    delete cleanUpdate.$push;
    Object.assign(doc, cleanUpdate);

    doc.updatedAt = new Date();
    return doc;
  }

  static async findOneAndUpdate(query: FilterQuery<IUser>, update: any, options?: any) {
    const doc = await this.findOne(query);
    if (!doc) return null;
    return this.findByIdAndUpdate((doc as any)._id, update, options);
  }

  static async create(data: any) {
    const db = SimulatorDatabase.getInstance();
    const id = generateId('user');
    const newDoc = {
      ...data,
      _id: id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.getStore().users.set(id, newDoc);
    return newDoc;
  }

  static async countDocuments(query: FilterQuery<IUser> = {}) {
    const results = await this.find(query);
    return results.length;
  }
}

export class SimulatorQuestionModel {
  static async find(query: FilterQuery<IQuestion> = {}) {
    const db = SimulatorDatabase.getInstance();
    const documents = Array.from(db.getStore().questions.values());
    return filterDocuments(documents, query);
  }

  static async findOne(query: FilterQuery<IQuestion>) {
    const results = await this.find(query);
    return results[0] || null;
  }

  static async findById(id: string) {
    const db = SimulatorDatabase.getInstance();
    return db.getStore().questions.get(id) || null;
  }

  static async findByIdAndUpdate(id: string, update: any, options?: any) {
    const db = SimulatorDatabase.getInstance();
    const doc: any = db.getStore().questions.get(id);
    if (!doc) return null;

    const updateOperation = update;
    if (updateOperation.$inc) {
      for (const key in updateOperation.$inc) {
        doc[key] = (doc[key] || 0) + updateOperation.$inc[key];
      }
    }
    if (updateOperation.$push) {
      for (const key in updateOperation.$push) {
        if (!Array.isArray(doc[key])) {
          doc[key] = [];
        }
        if (updateOperation.$push[key].$each) {
          doc[key].push(...updateOperation.$push[key].$each);
        } else {
          doc[key].push(updateOperation.$push[key]);
        }
      }
    }
    if (updateOperation.$pull) {
      for (const key in updateOperation.$pull) {
        if (Array.isArray(doc[key])) {
          doc[key] = doc[key].filter((item: any) => item.toString() !== updateOperation.$pull[key].toString());
        }
      }
    }

    const cleanUpdate = { ...update };
    delete cleanUpdate.$inc;
    delete cleanUpdate.$push;
    delete cleanUpdate.$pull;
    Object.assign(doc, cleanUpdate);

    doc.updatedAt = new Date();
    return doc;
  }

  static async findByIdAndDelete(query: FilterQuery<IQuestion>) {
    const db = SimulatorDatabase.getInstance();
    const id = query._id as string;
    const doc = db.getStore().questions.get(id);
    if (doc) {
      db.getStore().questions.delete(id);
    }
    return doc || null;
  }

  static async updateMany(filter: FilterQuery<IQuestion>, update: any) {
    const results = await this.find(filter);
    results.forEach((doc) => {
      this.findByIdAndUpdate((doc as any)._id, update);
    });
  }

  static async create(data: any) {
    const db = SimulatorDatabase.getInstance();
    const id = generateId('question');
    const newDoc = {
      ...data,
      _id: id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.getStore().questions.set(id, newDoc);
    return newDoc;
  }

  static async countDocuments(query: FilterQuery<IQuestion> = {}) {
    const results = await this.find(query);
    return results.length;
  }
}

export class SimulatorAnswerModel {
  static async find(query: FilterQuery<IAnswer> = {}) {
    const db = SimulatorDatabase.getInstance();
    const documents = Array.from(db.getStore().answers.values());
    return filterDocuments(documents, query);
  }

  static async findOne(query: FilterQuery<IAnswer>) {
    const results = await this.find(query);
    return results[0] || null;
  }

  static async findById(id: string) {
    const db = SimulatorDatabase.getInstance();
    return db.getStore().answers.get(id) || null;
  }

  static async findByIdAndUpdate(id: string, update: any, options?: any) {
    const db = SimulatorDatabase.getInstance();
    const doc: any = db.getStore().answers.get(id);
    if (!doc) return null;

    const updateOperation = update;
    if (updateOperation.$inc) {
      for (const key in updateOperation.$inc) {
        doc[key] = (doc[key] || 0) + updateOperation.$inc[key];
      }
    }
    if (updateOperation.$pull) {
      for (const key in updateOperation.$pull) {
        if (Array.isArray(doc[key])) {
          doc[key] = doc[key].filter((item: any) => item.toString() !== updateOperation.$pull[key].toString());
        }
      }
    }
    if (updateOperation.$push) {
      for (const key in updateOperation.$push) {
        if (!Array.isArray(doc[key])) {
          doc[key] = [];
        }
        doc[key].push(updateOperation.$push[key]);
      }
    }
    if (updateOperation.$addToSet) {
      for (const key in updateOperation.$addToSet) {
        if (!Array.isArray(doc[key])) {
          doc[key] = [];
        }
        if (!doc[key].includes(updateOperation.$addToSet[key])) {
          doc[key].push(updateOperation.$addToSet[key]);
        }
      }
    }

    const cleanUpdate = { ...update };
    delete cleanUpdate.$inc;
    delete cleanUpdate.$pull;
    delete cleanUpdate.$push;
    delete cleanUpdate.$addToSet;
    Object.assign(doc, cleanUpdate);

    doc.updatedAt = new Date();
    return doc;
  }

  static async findByIdAndDelete(query: FilterQuery<IAnswer>) {
    const db = SimulatorDatabase.getInstance();
    const id = query._id;
    const doc = db.getStore().answers.get(id);
    if (doc) {
      db.getStore().answers.delete(id);
    }
    return doc || null;
  }

  static async deleteMany(query: FilterQuery<IAnswer>) {
    const results = await this.find(query);
    results.forEach((doc: any) => {
      this.findByIdAndDelete((doc as any)._id);
    });
  }

  static async create(data: any) {
    const db = SimulatorDatabase.getInstance();
    const id = generateId('answer');
    const newDoc = {
      ...data,
      _id: id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.getStore().answers.set(id, newDoc);
    return newDoc;
  }

  static async countDocuments(query: FilterQuery<IAnswer> = {}) {
    const results = await this.find(query);
    return results.length;
  }
}

export class SimulatorTagModel {
  static async find(query: FilterQuery<ITag> = {}) {
    const db = SimulatorDatabase.getInstance();
    const documents = Array.from(db.getStore().tags.values());
    return filterDocuments(documents, query);
  }

  static async findOne(query: FilterQuery<ITag>) {
    const results = await this.find(query);
    return results[0] || null;
  }

  static async findById(id: string) {
    const db = SimulatorDatabase.getInstance();
    return db.getStore().tags.get(id) || null;
  }

  static async findByIdAndUpdate(id: string, update: any, options?: any) {
    const db = SimulatorDatabase.getInstance();
    const doc: any = db.getStore().tags.get(id);
    if (!doc) return null;

    Object.assign(doc, update);
    doc.updatedAt = new Date();
    return doc;
  }

  static async findOneAndUpdate(query: FilterQuery<ITag>, update: any, options?: any) {
    const doc = await this.findOne(query);
    if (!doc) {
      if (options?.upsert) {
        const id = generateId('tag');
        const newDoc: any = {
          ...query,
          ...update.$setOnInsert,
          _id: id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        SimulatorDatabase.getInstance().getStore().tags.set(id, newDoc);
        return newDoc;
      }
      return null;
    }

    if (update.$setOnInsert) {
      Object.assign(doc, update.$setOnInsert);
    }
    if (update.$push) {
      for (const key in update.$push) {
        const docAny = doc as any;
        if (!Array.isArray(docAny[key])) {
          docAny[key] = [];
        }
        docAny[key].push(update.$push[key]);
      }
    }

    (doc as any).updatedAt = new Date();
    return doc;
  }

  static async create(data: any) {
    const db = SimulatorDatabase.getInstance();
    const id = generateId('tag');
    const newDoc = {
      ...data,
      _id: id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.getStore().tags.set(id, newDoc);
    return newDoc;
  }

  static async countDocuments(query: FilterQuery<ITag> = {}) {
    const results = await this.find(query);
    return results.length;
  }

  static async updateMany(filter: FilterQuery<ITag>, update: any) {
    const results = await this.find(filter);
    results.forEach((doc: any) => {
      this.findByIdAndUpdate((doc as any)._id, update);
    });
  }
}

export class SimulatorInteractionModel {
  static async create(data: any) {
    const db = SimulatorDatabase.getInstance();
    const id = generateId('interaction');
    const newDoc = {
      ...data,
      _id: id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.getStore().interactions.set(id, newDoc);
    return newDoc;
  }

  static async find(query: FilterQuery<IInteraction> = {}) {
    const db = SimulatorDatabase.getInstance();
    const documents = Array.from(db.getStore().interactions.values());
    return filterDocuments(documents, query);
  }

  static async findOne(query: FilterQuery<IInteraction>) {
    const results = await this.find(query);
    return results[0] || null;
  }

  static async findByIdAndUpdate(id: string, update: any) {
    const db = SimulatorDatabase.getInstance();
    const doc = db.getStore().interactions.get(id);
    if (!doc) return null;
    Object.assign(doc, update);
    doc.updatedAt = new Date();
    return doc;
  }

  static async deleteMany(query: FilterQuery<IInteraction>) {
    const results = await this.find(query);
    results.forEach((doc: any) => {
      SimulatorDatabase.getInstance().getStore().interactions.delete(doc._id);
    });
  }
}

export class SimulatorReplyModel {
  static async create(data: any) {
    const db = SimulatorDatabase.getInstance();
    const id = generateId('reply');
    const newDoc = {
      ...data,
      _id: id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.getStore().replies.set(id, newDoc);
    return newDoc;
  }

  static async find(query: FilterQuery<IReply> = {}) {
    const db = SimulatorDatabase.getInstance();
    const documents = Array.from(db.getStore().replies.values());
    return filterDocuments(documents, query);
  }

  static async findByIdAndUpdate(id: string, update: any) {
    const db = SimulatorDatabase.getInstance();
    const doc = db.getStore().replies.get(id);
    if (!doc) return null;
    Object.assign(doc, update);
    doc.updatedAt = new Date();
    return doc;
  }

  static async countDocuments(query: FilterQuery<IReply> = {}) {
    const results = await this.find(query);
    return results.length;
  }
}
