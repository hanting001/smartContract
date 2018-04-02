import { TransactionUrlPipe } from './transaction-url.pipe';

describe('TransactionUrlPipe', () => {
  it('create an instance', () => {
    const pipe = new TransactionUrlPipe();
    expect(pipe).toBeTruthy();
  });
});
