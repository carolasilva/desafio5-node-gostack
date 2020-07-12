import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const findTransactionWithId = await transactionsRepository.findOne(id);

    console.log(findTransactionWithId);

    if (!findTransactionWithId) {
      throw new AppError(
        'Not able to delete. Please, verify the id and try again',
        400,
      );
    }

    await transactionsRepository.remove(findTransactionWithId);
  }
}

export default DeleteTransactionService;
