import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import uploadConfig from '../config/upload';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from './CreateTransactionService';

import Transaction from '../models/Transaction';

interface Request {
  fileName: string;
}

interface CsvLine {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ fileName }: Request): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();
    const csvFilePath = path.join(uploadConfig.directory, fileName);
    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: any[] = [];

    parseCSV.on('data', line => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const saveTransactions = async (
      lines: Array<Array<string>>,
    ): Promise<Transaction[]> => {
      const transactions = [];
      for (let i = 0; i < lines.length; i++) {
        const stringLine: string[] = lines[i];
        const line: CsvLine = {
          title: stringLine[0],
          type: stringLine[1] === 'income' ? 'income' : 'outcome',
          value: parseFloat(stringLine[2]),
          category: stringLine[3],
        };

        try {
          const transaction = await createTransaction.execute({
            title: line.title,
            type: line.type,
            value: line.value,
            category: line.category,
          });

          transactions.push(transaction);
        } catch (error) {
          console.error(error);
        }
      }

      return transactions;
    };

    const transactions = await saveTransactions(lines);

    return transactions;
  }
}

export default ImportTransactionsService;
