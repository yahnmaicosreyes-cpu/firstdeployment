import { describe, it, expect, beforeEach, vi } from 'vitest';

const ASSESSMENT_HTML = `
  <p id="assessment-live" aria-live="polite"></p>

  <div class="step active" id="step-1">
    <h2 class="step-question" id="step-1-heading">Who are you?</h2>
    <div class="choice-grid" role="group" aria-labelledby="step-1-heading">
      <button type="button" class="choice-card" data-who="highschool" aria-pressed="false">High School</button>
      <button type="button" class="choice-card" data-who="college" aria-pressed="false">College</button>
      <button type="button" class="choice-card" data-who="adult" aria-pressed="false">Adult</button>
    </div>
    <button class="btn btn-primary" id="next-1" disabled>Next</button>
  </div>

  <div class="step" id="step-2" hidden>
    <h2 class="step-question" id="step-2-heading">What are your goals?</h2>
    <div class="goal-grid" id="goal-grid"></div>
    <button class="btn btn-outline" data-goto-step="1">Back</button>
    <button class="btn btn-primary" id="next-2" disabled>Next</button>
  </div>

  <div class="step" id="step-3" hidden>
    <h2 class="step-question" id="step-3-heading">Your Plan</h2>
    <div class="result-card" id="result-card"></div>
    <button class="btn btn-outline" data-goto-step="2">Back</button>
  </div>
`;

beforeEach(async () => {
  vi.resetModules();
  document.body.innerHTML = ASSESSMENT_HTML;
  await import('../../js/assessment.js');
});

// ─── step 1: who are you ──────────────────────────────────────────────────────

describe('step 1 — user type selection', () => {
  it('next button is disabled before any selection', () => {
    expect(document.getElementById('next-1').disabled).toBe(true);
  });

  it('clicking a choice card enables the next button', () => {
    document.querySelector('[data-who="highschool"]').click();
    expect(document.getElementById('next-1').disabled).toBe(false);
  });

  it('clicking a card marks it as selected', () => {
    const card = document.querySelector('[data-who="college"]');
    card.click();
    expect(card.getAttribute('aria-pressed')).toBe('true');
    expect(card.classList.contains('selected')).toBe(true);
  });

  it('selecting a new card deselects the previous one', () => {
    const hs = document.querySelector('[data-who="highschool"]');
    const col = document.querySelector('[data-who="college"]');
    hs.click();
    col.click();
    expect(hs.getAttribute('aria-pressed')).toBe('false');
    expect(col.getAttribute('aria-pressed')).toBe('true');
  });

  it('clicking a card populates the goal grid with chips', () => {
    document.querySelector('[data-who="highschool"]').click();
    const chips = document.querySelectorAll('#goal-grid .goal-chip');
    expect(chips.length).toBe(6);
  });

  it('switching user types replaces goal chips', () => {
    document.querySelector('[data-who="highschool"]').click();
    const hsChip = document.querySelector('#goal-grid .goal-chip').textContent;

    document.querySelector('[data-who="adult"]').click();
    const adultChip = document.querySelector('#goal-grid .goal-chip').textContent;

    expect(hsChip).not.toBe(adultChip);
  });

  it('switching user types resets next-2 to disabled', () => {
    document.querySelector('[data-who="highschool"]').click();
    document.querySelector('#goal-grid .goal-chip').click();
    expect(document.getElementById('next-2').disabled).toBe(false);

    document.querySelector('[data-who="college"]').click();
    expect(document.getElementById('next-2').disabled).toBe(true);
  });
});

// ─── step 2: goal selection ───────────────────────────────────────────────────

describe('step 2 — goal selection', () => {
  beforeEach(() => {
    document.querySelector('[data-who="highschool"]').click();
  });

  it('next-2 is disabled before any goal is selected', () => {
    expect(document.getElementById('next-2').disabled).toBe(true);
  });

  it('selecting a goal chip enables next-2', () => {
    document.querySelector('#goal-grid .goal-chip').click();
    expect(document.getElementById('next-2').disabled).toBe(false);
  });

  it('selected chip gets aria-pressed="true"', () => {
    const chip = document.querySelector('#goal-grid .goal-chip');
    chip.click();
    expect(chip.getAttribute('aria-pressed')).toBe('true');
  });

  it('deselecting a chip sets aria-pressed back to false', () => {
    const chip = document.querySelector('#goal-grid .goal-chip');
    chip.click();
    chip.click();
    expect(chip.getAttribute('aria-pressed')).toBe('false');
  });

  it('deselecting the only selected goal disables next-2 again', () => {
    const chip = document.querySelector('#goal-grid .goal-chip');
    chip.click();
    chip.click();
    expect(document.getElementById('next-2').disabled).toBe(true);
  });

  it('multiple goals can be selected simultaneously', () => {
    const chips = document.querySelectorAll('#goal-grid .goal-chip');
    chips[0].click();
    chips[1].click();
    expect(chips[0].getAttribute('aria-pressed')).toBe('true');
    expect(chips[1].getAttribute('aria-pressed')).toBe('true');
  });
});

// ─── step navigation ──────────────────────────────────────────────────────────

describe('step navigation', () => {
  it('clicking next-1 shows step 2 and hides step 1', () => {
    document.querySelector('[data-who="adult"]').click();
    document.getElementById('next-1').click();
    expect(document.getElementById('step-2').hidden).toBe(false);
    expect(document.getElementById('step-1').hidden).toBe(true);
  });

  it('clicking back from step 2 returns to step 1', () => {
    document.querySelector('[data-who="adult"]').click();
    document.getElementById('next-1').click();
    document.querySelector('[data-goto-step="1"]').click();
    expect(document.getElementById('step-1').hidden).toBe(false);
    expect(document.getElementById('step-2').hidden).toBe(true);
  });

  it('step 3 shows the result card with plan title', () => {
    document.querySelector('[data-who="college"]').click();
    document.getElementById('next-1').click();
    document.querySelector('#goal-grid .goal-chip').click();
    document.getElementById('next-2').click();

    const card = document.getElementById('result-card');
    expect(card.querySelector('h3').textContent).toContain('College');
  });

  it('step 3 result card includes selected goal text', () => {
    document.querySelector('[data-who="adult"]').click();
    document.getElementById('next-1').click();

    const chip = document.querySelector('#goal-grid .goal-chip');
    const goalText = chip.textContent;
    chip.click();

    document.getElementById('next-2').click();
    expect(document.getElementById('result-card').textContent).toContain(goalText);
  });

  it('clicking back from step 3 returns to step 2', () => {
    document.querySelector('[data-who="adult"]').click();
    document.getElementById('next-1').click();
    document.querySelector('#goal-grid .goal-chip').click();
    document.getElementById('next-2').click();
    document.querySelector('[data-goto-step="2"]').click();
    expect(document.getElementById('step-2').hidden).toBe(false);
    expect(document.getElementById('step-3').hidden).toBe(true);
  });
});
