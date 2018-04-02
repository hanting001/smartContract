import { TransactionPipe } from './transaction.pipe';

describe('TransactionPipe', () => {
  it('create an instance', () => {
    const pipe = new TransactionPipe();
    expect(pipe).toBeTruthy();
  });
});
