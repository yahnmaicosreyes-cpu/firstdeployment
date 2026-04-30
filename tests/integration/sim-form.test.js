import { describe, it, expect, beforeEach } from 'vitest';
import { bindSimForm } from '../../js/paycheck-sim.js';

const SIM_HTML = `
  <form id="sim-form">
    <textarea id="sim-question" maxlength="500" required></textarea>
    <p id="sim-char-count"></p>
    <button type="submit">Submit</button>
  </form>
  <div id="sim-output" hidden>
    <h2 id="sim-heading" tabindex="-1">Results</h2>
    <div id="sim-body"></div>
  </div>
`;

const CONFIG = {
  formId:      'sim-form',
  textareaId:  'sim-question',
  outputId:    'sim-output',
  bodyId:      'sim-body',
  charCountId: 'sim-char-count',
  headingId:   'sim-heading'
};

describe('bindSimForm — initial state', () => {

  beforeEach(() => {
    document.body.innerHTML = SIM_HTML;
    bindSimForm(CONFIG);
  });

  it('output is hidden on load', () => {
    expect(document.getElementById('sim-output').hidden).toBe(true);
  });

  it('char count is empty on load', () => {
    expect(document.getElementById('sim-char-count').textContent).toBe('');
  });

  it('returns early without throwing when elements are missing', () => {
    document.body.innerHTML = '';
    expect(() => bindSimForm(CONFIG)).not.toThrow();
  });

});

describe('bindSimForm — char counter', () => {

  beforeEach(() => {
    document.body.innerHTML = SIM_HTML;
    bindSimForm(CONFIG);
  });

  it('shows remaining characters after typing', () => {
    const ta = document.getElementById('sim-question');
    ta.value = 'hello';
    ta.dispatchEvent(new Event('input'));
    expect(document.getElementById('sim-char-count').textContent).toBe('495 characters left');
  });

  it('clears count when textarea is emptied', () => {
    const ta = document.getElementById('sim-question');
    ta.value = 'hello';
    ta.dispatchEvent(new Event('input'));
    ta.value = '';
    ta.dispatchEvent(new Event('input'));
    expect(document.getElementById('sim-char-count').textContent).toBe('');
  });

});

describe('bindSimForm — form submission', () => {

  beforeEach(() => {
    document.body.innerHTML = SIM_HTML;
    bindSimForm(CONFIG);
  });

  it('empty submission keeps output hidden', () => {
    document.getElementById('sim-form').dispatchEvent(new Event('submit', { cancelable: true }));
    expect(document.getElementById('sim-output').hidden).toBe(true);
  });

  it('empty submission sets aria-invalid on textarea', () => {
    const ta = document.getElementById('sim-question');
    document.getElementById('sim-form').dispatchEvent(new Event('submit', { cancelable: true }));
    expect(ta.getAttribute('aria-invalid')).toBe('true');
  });

  it('typing after invalid submission clears aria-invalid', () => {
    const ta = document.getElementById('sim-question');
    document.getElementById('sim-form').dispatchEvent(new Event('submit', { cancelable: true }));
    ta.dispatchEvent(new Event('input'));
    expect(ta.getAttribute('aria-invalid')).toBeNull();
  });

  it('valid submission reveals the output', () => {
    const ta = document.getElementById('sim-question');
    ta.value = 'I just got my first paycheck';
    document.getElementById('sim-form').dispatchEvent(new Event('submit', { cancelable: true }));
    expect(document.getElementById('sim-output').hidden).toBe(false);
  });

  it('output contains exactly 3 option cards', () => {
    const ta = document.getElementById('sim-question');
    ta.value = 'how do I cash my first paycheck?';
    document.getElementById('sim-form').dispatchEvent(new Event('submit', { cancelable: true }));
    expect(document.querySelectorAll('#sim-body .sim-option')).toHaveLength(3);
  });

  it('each option card has a condition line', () => {
    const ta = document.getElementById('sim-question');
    ta.value = 'what do I do with my paycheck?';
    document.getElementById('sim-form').dispatchEvent(new Event('submit', { cancelable: true }));
    expect(document.querySelectorAll('#sim-body .sim-condition')).toHaveLength(3);
  });

  it('each option card has a result block', () => {
    const ta = document.getElementById('sim-question');
    ta.value = 'first paycheck help';
    document.getElementById('sim-form').dispatchEvent(new Event('submit', { cancelable: true }));
    expect(document.querySelectorAll('#sim-body .sim-result')).toHaveLength(3);
  });

});

describe('bindSimForm — Why?/How? toggles', () => {

  beforeEach(() => {
    document.body.innerHTML = SIM_HTML;
    bindSimForm(CONFIG);
    const ta = document.getElementById('sim-question');
    ta.value = 'how do I cash my paycheck?';
    document.getElementById('sim-form').dispatchEvent(new Event('submit', { cancelable: true }));
  });

  it('why content is hidden before toggle', () => {
    expect(document.querySelector('.why-content').hidden).toBe(true);
  });

  it('clicking Why? reveals its content', () => {
    const btn = document.querySelector('.why-btn');
    const content = btn.closest('.sim-step').querySelector('.why-content');
    btn.click();
    expect(content.hidden).toBe(false);
  });

  it('clicking Why? again hides its content', () => {
    const btn = document.querySelector('.why-btn');
    const content = btn.closest('.sim-step').querySelector('.why-content');
    btn.click();
    btn.click();
    expect(content.hidden).toBe(true);
  });

  it('aria-expanded toggles correctly', () => {
    const btn = document.querySelector('.why-btn');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    btn.click();
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    btn.click();
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

});

describe('bindSimForm — routing', () => {

  beforeEach(() => {
    document.body.innerHTML = SIM_HTML;
    bindSimForm(CONFIG);
  });

  it('no-bank question puts checkCashing card first and marks it recommended', () => {
    const ta = document.getElementById('sim-question');
    ta.value = 'I have no bank account and just got my first paycheck';
    document.getElementById('sim-form').dispatchEvent(new Event('submit', { cancelable: true }));
    const first = document.querySelector('#sim-body .sim-option');
    expect(first.classList.contains('sim-option--recommended')).toBe(true);
    expect(first.querySelector('.sim-option-title').textContent).toContain('cashing');
  });

  it('has-bank + need-cash question puts cashAtBank card first', () => {
    const ta = document.getElementById('sim-question');
    ta.value = 'I have a bank account and need cash today';
    document.getElementById('sim-form').dispatchEvent(new Event('submit', { cancelable: true }));
    const first = document.querySelector('#sim-body .sim-option');
    expect(first.querySelector('.sim-option-title').textContent).toContain('Cash it');
  });

  it('shows routing banner when a recommendation is made', () => {
    const ta = document.getElementById('sim-question');
    ta.value = 'I have no bank account';
    document.getElementById('sim-form').dispatchEvent(new Event('submit', { cancelable: true }));
    expect(document.querySelector('.sim-routed')).toBeTruthy();
  });

  it('no routing banner for a generic question', () => {
    const ta = document.getElementById('sim-question');
    ta.value = 'how do I cash a paycheck';
    document.getElementById('sim-form').dispatchEvent(new Event('submit', { cancelable: true }));
    expect(document.querySelector('.sim-routed')).toBeNull();
  });

});
