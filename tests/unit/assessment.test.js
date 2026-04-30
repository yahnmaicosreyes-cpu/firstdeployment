import { describe, it, expect, beforeEach } from 'vitest';
import { goals, plans, buildResultCard } from '../../js/assessment.js';

// ─── goals ────────────────────────────────────────────────────────────────────

describe('goals', () => {
  it('has exactly 3 user types', () => {
    expect(Object.keys(goals)).toEqual(['highschool', 'college', 'adult']);
  });

  it('each user type has exactly 6 goals', () => {
    Object.values(goals).forEach(list => {
      expect(list).toHaveLength(6);
    });
  });

  it('all goals are non-empty strings', () => {
    Object.values(goals).forEach(list => {
      list.forEach(goal => {
        expect(typeof goal).toBe('string');
        expect(goal.trim().length).toBeGreaterThan(0);
      });
    });
  });

  it('no duplicate goals within a user type', () => {
    Object.values(goals).forEach(list => {
      expect(new Set(list).size).toBe(list.length);
    });
  });
});

// ─── plans ────────────────────────────────────────────────────────────────────

describe('plans', () => {
  it('has exactly 3 user types', () => {
    expect(Object.keys(plans)).toEqual(['highschool', 'college', 'adult']);
  });

  it('every plan has a non-empty title', () => {
    Object.values(plans).forEach(plan => {
      expect(typeof plan.title).toBe('string');
      expect(plan.title.trim().length).toBeGreaterThan(0);
    });
  });

  it('every plan has a non-empty body', () => {
    Object.values(plans).forEach(plan => {
      expect(typeof plan.body).toBe('string');
      expect(plan.body.trim().length).toBeGreaterThan(0);
    });
  });

  it('plan keys align with goals keys — no orphaned user types', () => {
    expect(Object.keys(plans)).toEqual(Object.keys(goals));
  });

  it('highschool plan title references High School', () => {
    expect(plans.highschool.title).toContain('High School');
  });

  it('college plan title references College', () => {
    expect(plans.college.title).toContain('College');
  });

  it('adult plan title references Adult', () => {
    expect(plans.adult.title).toContain('Adult');
  });
});

// ─── buildResultCard ──────────────────────────────────────────────────────────

describe('buildResultCard', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders an h3 with the correct plan title', () => {
    buildResultCard(container, 'highschool', []);
    const h3 = container.querySelector('h3');
    expect(h3).not.toBeNull();
    expect(h3.textContent).toBe(plans.highschool.title);
  });

  it('renders the plan body text', () => {
    buildResultCard(container, 'college', []);
    const allText = container.textContent;
    expect(allText).toContain(plans.college.body);
  });

  it('renders focus areas div when goals are provided', () => {
    buildResultCard(container, 'adult', ['💳 Pay off debt', '🏠 Save for a home']);
    const focusDiv = container.querySelector('.result-focus');
    expect(focusDiv).not.toBeNull();
  });

  it('focus areas contain the goal text', () => {
    buildResultCard(container, 'adult', ['💳 Pay off debt', '🏠 Save for a home']);
    const strong = container.querySelector('.result-focus strong');
    expect(strong.textContent).toContain('Pay off debt');
    expect(strong.textContent).toContain('Save for a home');
  });

  it('goals are joined with " · " separator', () => {
    buildResultCard(container, 'adult', ['goal one', 'goal two']);
    const strong = container.querySelector('.result-focus strong');
    expect(strong.textContent).toBe('goal one · goal two');
  });

  it('does not render focus areas when no goals provided', () => {
    buildResultCard(container, 'adult', []);
    expect(container.querySelector('.result-focus')).toBeNull();
  });

  it('limits displayed goals to 3 even when more are passed', () => {
    buildResultCard(container, 'highschool', ['a', 'b', 'c', 'd', 'e']);
    const strong = container.querySelector('.result-focus strong');
    expect(strong.textContent.split(' · ')).toHaveLength(3);
  });

  it('renders the cta paragraph', () => {
    buildResultCard(container, 'college', []);
    const cta = container.querySelector('.result-cta');
    expect(cta).not.toBeNull();
    expect(cta.textContent.trim().length).toBeGreaterThan(0);
  });

  it('clears existing content before rendering', () => {
    container.innerHTML = '<p class="old">stale content</p>';
    buildResultCard(container, 'highschool', []);
    expect(container.querySelector('.old')).toBeNull();
  });

  it('uses textContent — markup in goal strings is escaped, not injected', () => {
    buildResultCard(container, 'highschool', ['<img src=x onerror=alert(1)>']);
    expect(container.querySelectorAll('img')).toHaveLength(0);
    expect(container.querySelectorAll('script')).toHaveLength(0);
    const strong = container.querySelector('.result-focus strong');
    expect(strong.textContent).toContain('<img');
  });

  it('works for all three user types without throwing', () => {
    expect(() => buildResultCard(container, 'highschool', [])).not.toThrow();
    expect(() => buildResultCard(container, 'college', [])).not.toThrow();
    expect(() => buildResultCard(container, 'adult', [])).not.toThrow();
  });
});
