import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);
    let category_id: string;

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError(
        `You only have $${balance.total} in your account. Cannot process outcome of $${value}`,
      );
    }

    const findCategoryWithSameName = await categoriesRepository.findOne({
      title: category,
    });

    const lowercaseType = type.toLowerCase();
    if (lowercaseType !== 'income' && lowercaseType !== 'outcome') {
      throw new AppError('Type can only be either income or outcome.', 400);
    }

    if (!findCategoryWithSameName) {
      const newCategory = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(newCategory);
      category_id = newCategory.id;
    } else {
      category_id = findCategoryWithSameName.id;
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category_id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
