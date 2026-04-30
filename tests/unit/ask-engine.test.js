import { describe, it, expect } from 'vitest';
import { buildAnswer, scoreTopic, topicLibrary, defaultReply } from '../../js/ask-engine.js';

// ─── topicLibrary ────────────────────────────────────────────────────────────

describe('topicLibrary', () => {
  it('has exactly 8 topics', () => {
    expect(topicLibrary).toHaveLength(8);
  });

  it('every topic has keys, label, and parts', () => {
    topicLibrary.forEach(topic => {
      expect(Array.isArray(topic.keys)).toBe(true);
      expect(typeof topic.label).toBe('string');
      expect(Array.isArray(topic.parts)).toBe(true);
    });
  });

  it('every topic has at least 1 key', () => {
    topicLibrary.forEach(topic => {
      expect(topic.keys.length).toBeGreaterThan(0);
    });
  });

  it('every topic has exactly 3 parts', () => {
    topicLibrary.forEach(topic => {
      expect(topic.parts).toHaveLength(3);
    });
  });

  it('all keys are lowercase — contract with scoreTopic caller', () => {
    topicLibrary.forEach(topic => {
      topic.keys.forEach(key => {
        expect(key).toBe(key.toLowerCase());
      });
    });
  });

  it('no two topics share the same label', () => {
    const labels = topicLibrary.map(t => t.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('all parts are non-empty strings', () => {
    topicLibrary.forEach(topic => {
      topic.parts.forEach(part => {
        expect(typeof part).toBe('string');
        expect(part.trim().length).toBeGreaterThan(0);
      });
    });
  });
});

// ─── defaultReply ─────────────────────────────────────────────────────────────

describe('defaultReply', () => {
  it('has a non-empty label', () => {
    expect(typeof defaultReply.label).toBe('string');
    expect(defaultReply.label.trim().length).toBeGreaterThan(0);
  });

  it('has exactly 3 parts', () => {
    expect(defaultReply.parts).toHaveLength(3);
  });

  it('all parts are non-empty strings', () => {
    defaultReply.parts.forEach(p => {
      expect(typeof p).toBe('string');
      expect(p.trim().length).toBeGreaterThan(0);
    });
  });
});

// ─── scoreTopic ───────────────────────────────────────────────────────────────

describe('scoreTopic', () => {
  const budgetTopic = topicLibrary.find(t => t.label === 'Budgeting & spending');
  const creditTopic = topicLibrary.find(t => t.label === 'Credit');

  it('returns 0 when no keys match', () => {
    expect(scoreTopic('how do i make pasta', budgetTopic)).toBe(0);
  });

  it('returns > 0 when a key matches', () => {
    expect(scoreTopic('i need help with my budget', budgetTopic)).toBeGreaterThan(0);
  });

  it('score equals the length of the matched key', () => {
    // 'budget' has length 6
    expect(scoreTopic('my budget is a mess', budgetTopic)).toBe(6);
  });

  it('accumulates score for multiple matching keys in one topic', () => {
    // 'budget' (6) + 'spending' (8) = 14
    expect(scoreTopic('my budget and spending habits', budgetTopic)).toBe(14);
  });

  it('longer key phrase scores higher than shorter word', () => {
    // 'credit score' (12) > 'credit' (6) in a single match
    const withPhrase = scoreTopic('my credit score is low', creditTopic);
    const withWord = scoreTopic('my credit is low', creditTopic);
    expect(withPhrase).toBeGreaterThan(withWord);
  });

  it('is case-sensitive — expects pre-lowercased input', () => {
    expect(scoreTopic('BUDGET', budgetTopic)).toBe(0);
    expect(scoreTopic('budget', budgetTopic)).toBeGreaterThan(0);
  });

  it('handles multi-word keys like "money gone"', () => {
    expect(scoreTopic('my money gone after rent', budgetTopic)).toBeGreaterThan(0);
  });
});

// ─── buildAnswer ──────────────────────────────────────────────────────────────

describe('buildAnswer — default fallback', () => {
  it('returns usedDefault: true when no keywords match', () => {
    expect(buildAnswer('how do i make pasta').usedDefault).toBe(true);
  });

  it('returns default parts when no keywords match', () => {
    expect(buildAnswer('nothing relevant here').parts).toEqual(defaultReply.parts);
  });

  it('labels contains the default label when using fallback', () => {
    expect(buildAnswer('nothing relevant here').labels).toEqual([defaultReply.label]);
  });

  it('uses default for empty string', () => {
    expect(buildAnswer('').usedDefault).toBe(true);
  });

  it('uses default for whitespace-only string', () => {
    expect(buildAnswer('   ').usedDefault).toBe(true);
  });
});

describe('buildAnswer — keyword matching', () => {
  it('returns usedDefault: false when a keyword matches', () => {
    expect(buildAnswer('I need help with my budget').usedDefault).toBe(false);
  });

  it('matches budget topic for "budget"', () => {
    expect(buildAnswer('help with my budget').labels).toContain('Budgeting & spending');
  });

  it('matches debt topic for "debt"', () => {
    expect(buildAnswer('I have a lot of debt').labels).toContain('Debt & loans');
  });

  it('matches savings topic for "emergency"', () => {
    expect(buildAnswer('I need an emergency fund').labels).toContain('Saving & emergency funds');
  });

  it('matches investing topic for "roth"', () => {
    expect(buildAnswer('should I open a roth IRA').labels).toContain('Investing & retirement');
  });

  it('matches tax topic for "freelance"', () => {
    expect(buildAnswer('I do freelance work how do taxes work').labels).toContain('Taxes & self-employment');
  });

  it('matches college topic for "fafsa"', () => {
    expect(buildAnswer('how do i fill out my fafsa').labels).toContain('College costs');
  });

  it('matches housing topic for "mortgage"', () => {
    expect(buildAnswer('thinking about getting a mortgage').labels).toContain('Housing & big purchases');
  });

  it('is case-insensitive', () => {
    const result = buildAnswer('BUDGET MY DEBT');
    expect(result.usedDefault).toBe(false);
  });
});

describe('buildAnswer — topic selection and ranking', () => {
  it('returns at most 2 topics', () => {
    const result = buildAnswer('I have debt and want to budget and save for retirement and pay mortgage');
    expect(result.labels.length).toBeLessThanOrEqual(2);
  });

  it('returns exactly 1 topic when only one matches', () => {
    const result = buildAnswer('help with my budget');
    expect(result.labels).toHaveLength(1);
  });

  it('highest-scoring topic comes first', () => {
    // 'student loan' (11) + 'loan' (4) = 15 for debt vs 'budget' (6) for budgeting
    const result = buildAnswer('my student loan and budget');
    expect(result.labels[0]).toBe('Debt & loans');
  });

  it('combines parts from two matched topics into one array', () => {
    // Each topic has 3 parts → 6 combined
    const result = buildAnswer('I have debt and need to budget');
    expect(result.parts).toHaveLength(6);
  });

  it('returns 3 parts when only one topic matches', () => {
    const result = buildAnswer('help with my budget');
    expect(result.parts).toHaveLength(3);
  });
});
