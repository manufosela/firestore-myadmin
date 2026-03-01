import { describe, it, expect } from 'vitest';

describe('Cloud Functions setup', () => {
  it('helloWorld function is exported', async () => {
    const { helloWorld } = await import('./index.js');
    expect(helloWorld).toBeDefined();
  });
});
