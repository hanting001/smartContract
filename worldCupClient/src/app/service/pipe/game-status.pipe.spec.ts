import { GameStatusPipe } from './game-status.pipe';

describe('GameStatusPipe', () => {
  it('create an instance', () => {
    const pipe = new GameStatusPipe();
    expect(pipe).toBeTruthy();
  });
});
