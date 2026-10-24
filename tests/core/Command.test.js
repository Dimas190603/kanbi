import { describe, it, expect } from 'vitest';
import Command from '../../src/core/Command.js';

describe('Command', () => {
  it('execute() langsung melempar error kalau tidak di-override', () => {
    expect(() => new Command().execute()).toThrow(
      'execute() must be implemented!'
    );
  });
  it('undo() langsung melempar error kalau tidak di-override', () => {
    expect(() => new Command().undo()).toThrow('undo() must be implemented!');
  });
  it('Turunan yang lupa meng-override langsung melempar error', () => {
    class Incomplete extends Command {}
    expect(() => new Incomplete().execute()).toThrow();
  });
  it('Turunan yang meng-override bisa berjalan dengan normal', () => {
    class Complete extends Command {
      execute() {
        return 'The system is working well';
      }

      undo() {
        return 'The system was properly cancelled';
      }
    }

    const command = new Complete();
    expect(command.execute()).toBe('The system is working well');
    expect(command.undo()).toBe('The system was properly cancelled');
  });
});
