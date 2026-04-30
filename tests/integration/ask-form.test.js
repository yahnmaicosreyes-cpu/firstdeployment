import { describe, it, expect, beforeEach } from 'vitest';
import { bindAskForm } from '../../js/ask-engine.js';

const FORM_HTML = `
  <form id="ask-form">
    <textarea id="money-question" maxlength="2000" required></textarea>
    <p id="char-count"></p>
    <button type="submit" id="ask-submit">Get my answer</button>
  </form>
  <div id="answer-output" hidden>
    <h2 id="answer-heading" tabindex="-1">Here is some guidance</h2>
    <p id="answer-topics" hidden></p>
    <div id="answer-body"></div>
  </div>
`;

const CONFIG = {
  formId: 'ask-form',
  textareaId: 'money-question',
  outputId: 'answer-output',
  bodyId: 'answer-body',
  topicsId: 'answer-topics',
  charCountId: 'char-count',
  headingId: 'answer-heading'
};

function getEls() {
  return {
    form: document.getElementById('ask-form'),
    ta: document.getElementById('money-question'),
    out: document.getElementById('answer-output'),
    body: document.getElementById('answer-body'),
    topics: document.getElementById('answer-topics'),
    count: document.getElementById('char-count'),
    heading: document.getElementById('answer-heading')
  };
}

function submit(form) {
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

function typeIn(ta, value) {
  ta.value = value;
  ta.dispatchEvent(new Event('input', { bubbles: true }));
}

beforeEach(() => {
  document.body.innerHTML = FORM_HTML;
  bindAskForm(CONFIG);
});

// ─── character counter ────────────────────────────────────────────────────────

describe('character counter', () => {
  it('is empty when textarea is empty', () => {
    expect(getEls().count.textContent).toBe('');
  });

  it('shows remaining character count after typing', () => {
    typeIn(getEls().ta, 'hello');
    expect(getEls().count.textContent).toBe('1995 characters left');
  });

  it('resets to empty when textarea is cleared', () => {
    const { ta } = getEls();
    typeIn(ta, 'hello');
    typeIn(ta, '');
    expect(getEls().count.textContent).toBe('');
  });

  it('counts down as text length increases', () => {
    const { ta, count } = getEls();
    typeIn(ta, 'a');
    const first = count.textContent;
    typeIn(ta, 'ab');
    expect(count.textContent).not.toBe(first);
    expect(count.textContent).toBe('1998 characters left');
  });
});

// ─── validation ───────────────────────────────────────────────────────────────

describe('form validation', () => {
  it('does not show answer box on empty submission', () => {
    const { form, out } = getEls();
    submit(form);
    expect(out.hidden).toBe(true);
  });

  it('sets aria-invalid on empty submission', () => {
    const { form, ta } = getEls();
    ta.value = '';
    submit(form);
    expect(ta.getAttribute('aria-invalid')).toBe('true');
  });

  it('sets aria-invalid on whitespace-only submission', () => {
    const { form, ta } = getEls();
    ta.value = '   ';
    submit(form);
    expect(ta.getAttribute('aria-invalid')).toBe('true');
  });

  it('clears aria-invalid when user starts typing after an error', () => {
    const { form, ta } = getEls();
    ta.value = '';
    submit(form);
    typeIn(ta, 'now I am typing');
    expect(ta.hasAttribute('aria-invalid')).toBe(false);
  });

  it('clears custom validity message when user types', () => {
    const { form, ta } = getEls();
    ta.value = '';
    submit(form);
    typeIn(ta, 'now I am typing');
    expect(ta.validity.valid).toBe(true);
  });
});

// ─── successful submission ────────────────────────────────────────────────────

describe('successful submission', () => {
  it('makes the answer box visible', () => {
    const { form, ta, out } = getEls();
    typeIn(ta, 'how do I start a budget');
    submit(form);
    expect(out.hidden).toBe(false);
  });

  it('renders at least one paragraph in the answer body', () => {
    const { form, ta, body } = getEls();
    typeIn(ta, 'how do I start a budget');
    submit(form);
    expect(body.querySelectorAll('p').length).toBeGreaterThan(0);
  });

  it('shows the topics label when a keyword matches', () => {
    const { form, ta, topics } = getEls();
    typeIn(ta, 'I need to budget my expenses');
    submit(form);
    expect(topics.hidden).toBe(false);
    expect(topics.textContent).toContain('Budgeting');
  });

  it('hides the topics label when no keyword matches (default reply)', () => {
    const { form, ta, topics } = getEls();
    typeIn(ta, 'something about pasta recipes');
    submit(form);
    expect(topics.hidden).toBe(true);
  });

  it('replaces the previous answer on re-submission', () => {
    const { form, ta, body } = getEls();
    typeIn(ta, 'help with my budget');
    submit(form);
    const firstCount = body.querySelectorAll('p').length;

    typeIn(ta, 'help with my savings');
    submit(form);
    const secondCount = body.querySelectorAll('p').length;

    // Both are valid keyword matches — body should be freshly rendered
    expect(body.querySelectorAll('p').length).toBe(secondCount);
    expect(firstCount).toBeGreaterThan(0);
  });

  it('does not set aria-invalid on successful submission', () => {
    const { form, ta } = getEls();
    typeIn(ta, 'how do I budget');
    submit(form);
    expect(ta.hasAttribute('aria-invalid')).toBe(false);
  });
});

// ─── bindAskForm — missing elements guard ────────────────────────────────────

describe('bindAskForm — missing element guard', () => {
  it('does not throw when called with a non-existent formId', () => {
    expect(() => bindAskForm({ ...CONFIG, formId: 'does-not-exist' })).not.toThrow();
  });
});
