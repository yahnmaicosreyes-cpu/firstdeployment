import { describe, it, expect } from 'vitest';
import { options, detectRoute, buildSimOutput } from '../../js/paycheck-sim.js';

describe('options data', () => {

  it('has exactly 3 options', () => {
    expect(options).toHaveLength(3);
  });

  it('option ids are deposit, cashAtBank, checkCashing in that order', () => {
    expect(options.map(o => o.id)).toEqual(['deposit', 'cashAtBank', 'checkCashing']);
  });

  it('each option has all required fields', () => {
    options.forEach(opt => {
      expect(opt).toHaveProperty('id');
      expect(opt).toHaveProperty('title');
      expect(opt).toHaveProperty('tag');
      expect(opt).toHaveProperty('condition');
      expect(opt).toHaveProperty('steps');
      expect(opt).toHaveProperty('result');
      expect(opt.steps.length).toBeGreaterThan(0);
    });
  });

  it('each step has an action and either why or how (not neither)', () => {
    options.forEach(opt => {
      opt.steps.forEach(step => {
        expect(step).toHaveProperty('action');
        expect(step.why || step.how).toBeTruthy();
      });
    });
  });

  it('deposit option has no warning', () => {
    expect(options.find(o => o.id === 'deposit').warning).toBeNull();
  });

  it('checkCashing option has a warning about fees', () => {
    const warning = options.find(o => o.id === 'checkCashing').warning;
    expect(warning).toBeTruthy();
    expect(warning.toLowerCase()).toContain('fee');
  });

});

describe('detectRoute', () => {

  it('returns all false for a generic question with no signals', () => {
    const r = detectRoute('I just got my first paycheck');
    expect(r.noBank).toBe(false);
    expect(r.needCash).toBe(false);
    expect(r.hasBank).toBe(false);
  });

  it('detects no bank account — "no bank account"', () => {
    expect(detectRoute("I don't have a bank account").noBank).toBe(true);
  });

  it('detects no bank account — "no bank"', () => {
    expect(detectRoute('I have no bank').noBank).toBe(true);
  });

  it('detects no bank account — "no checking"', () => {
    expect(detectRoute('I have no checking account').noBank).toBe(true);
  });

  it('detects need for cash — "need cash right now"', () => {
    expect(detectRoute('I need cash right now').needCash).toBe(true);
  });

  it('detects need for cash — "cash it today"', () => {
    expect(detectRoute('I want to cash it today').needCash).toBe(true);
  });

  it('detects existing bank account — "I have a bank account"', () => {
    expect(detectRoute('I have a bank account').hasBank).toBe(true);
  });

  it('detects existing bank account — "my bank"', () => {
    expect(detectRoute('I want to deposit into my bank').hasBank).toBe(true);
  });

  it('does not confuse "no bank" with "hasBank"', () => {
    const r = detectRoute("I don't have a bank account");
    expect(r.noBank).toBe(true);
    expect(r.hasBank).toBe(false);
  });

});

describe('buildSimOutput', () => {

  it('always returns all 3 options', () => {
    const inputs = [
      'I have no bank account',
      'I have a bank and need cash today',
      'I have a bank account',
      'my first paycheck what do I do'
    ];
    inputs.forEach(q => {
      expect(buildSimOutput(q).options).toHaveLength(3);
    });
  });

  it('returns null recommendedId for a generic question', () => {
    expect(buildSimOutput('how do I cash my paycheck').recommendedId).toBeNull();
  });

  it('recommends checkCashing and puts it first when no bank detected', () => {
    const { options: opts, recommendedId } = buildSimOutput('I have no bank account');
    expect(recommendedId).toBe('checkCashing');
    expect(opts[0].id).toBe('checkCashing');
  });

  it('recommends cashAtBank when user has bank and needs cash', () => {
    const { options: opts, recommendedId } = buildSimOutput('I have a bank account and need cash today');
    expect(recommendedId).toBe('cashAtBank');
    expect(opts[0].id).toBe('cashAtBank');
  });

  it('recommends deposit when user mentions bank account with no urgency', () => {
    const { recommendedId } = buildSimOutput('I have a bank account, what should I do?');
    expect(recommendedId).toBe('deposit');
  });

  it('noBank signal takes priority over hasBank', () => {
    const { recommendedId } = buildSimOutput("I don't have a bank account but my friend does");
    expect(recommendedId).toBe('checkCashing');
  });

  it('non-recommended options still present when one is recommended', () => {
    const { options: opts } = buildSimOutput('I have no bank account');
    const ids = opts.map(o => o.id);
    expect(ids).toContain('deposit');
    expect(ids).toContain('cashAtBank');
    expect(ids).toContain('checkCashing');
  });

});
