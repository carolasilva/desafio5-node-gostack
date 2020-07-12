import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const incomeTransactions = transactions.filter(transaction =>
      this.transactionIsOfType('income', transaction),
    );

    const outcomeTransactions = transactions.filter(transaction =>
      this.transactionIsOfType('outcome', transaction),
    );

    const incomeTransactionsValue = incomeTransactions.map(
      transaction => transaction.value,
    );

    const outcomeTransactionsValue = outcomeTransactions.map(
      transaction => transaction.value,
    );

    const totalIncome = incomeTransactionsValue.reduce(
      this.sumTransactionsValues,
      0,
    );

    const totalOutcome = outcomeTransactionsValue.reduce(
      this.sumTransactionsValues,
      0,
    );

    return {
      income: totalIncome,
      outcome: totalOutcome,
      total: totalIncome - totalOutcome,
    };
  }

  private transactionIsOfType(type: string, transaction: Transaction): boolean {
    return transaction.type === type;
  }

  private sumTransactionsValues(accumulator: number, current: number): number {
    return accumulator + current;
  }
}

export default TransactionsRepository;
