/* ============================================================
   ASSESSMENT WIZARD
   - goals:           goal chips shown in step 2, keyed by user type
   - plans:           personalised result content for step 3
   - buildResultCard: renders the step-3 result card into a container element
   DOM wiring at the bottom runs only when the wizard elements exist.
   ============================================================ */

/* Goal options for step 2, grouped by the user type selected in step 1 */
export const goals = {
  highschool: [
    '🐷 Start saving money', '📊 Understand budgeting', '💳 Learn about credit',
    '🎓 Save for college', '💵 Make money as a teen', '📈 Learn about investing'
  ],
  college: [
    '🎓 Manage student loans', '💰 Budget on a tight income', '🏦 Build an emergency fund',
    '📈 Start investing early', '💳 Build good credit', '🏠 Plan for after graduation'
  ],
  adult: [
    '💳 Pay off debt', '🏠 Save for a home', '📈 Grow investments',
    '👪 Budget for a family', '🏖️ Save for retirement', '💼 Grow my business'
  ]
};

/* Personalised plan content displayed in the step-3 result card */
export const plans = {
  highschool: {
    title: 'Your High School Money Workout 🎒',
    body: 'Great start! Focus on building the savings habit early, understanding how credit works, and letting compound interest work for you over time. Even $20/week adds up fast!'
  },
  college: {
    title: 'Your College Money Playbook 🏫',
    body: 'Smart move! Tackle your loans by understanding interest rates, build a small emergency fund first, and start a Roth IRA as soon as you have any income — time is your biggest asset.'
  },
  adult: {
    title: 'Your Adult Wealth-Building Plan 💼',
    body: "You've got this! Focus on eliminating high-interest debt first, then automate your savings and investments. Consistent monthly contributions beat timing the market every time."
  }
};

/* Strings read aloud by screen readers when navigating between steps */
const stepAnnouncements = {
  1: 'Step 1 of 3. Who are you?',
  2: 'Step 2 of 3. What are your goals? Select one or more.',
  3: 'Step 3 of 3. Your Money Fitness plan.'
};

let selectedWho = null;
let selectedGoals = [];

function announceAssessment(msg) {
  const live = document.getElementById('assessment-live');
  if (!live) return;
  live.textContent = '';
  requestAnimationFrame(() => { live.textContent = msg; });
}

function focusStepHeading(stepEl) {
  const h = stepEl.querySelector('.step-question');
  if (!h) return;
  h.setAttribute('tabindex', '-1');
  h.focus({ preventScroll: true });
}

function selectWho(card, type) {
  document.querySelectorAll('#step-1 .choice-card').forEach(c => {
    c.classList.remove('selected');
    c.setAttribute('aria-pressed', 'false');
  });
  card.classList.add('selected');
  card.setAttribute('aria-pressed', 'true');
  selectedWho = type;
  document.getElementById('next-1').disabled = false;

  const grid = document.getElementById('goal-grid');
  grid.replaceChildren();
  goals[type].forEach(goal => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'goal-chip';
    chip.textContent = goal;
    chip.setAttribute('aria-pressed', 'false');
    chip.addEventListener('click', function () { toggleGoal(chip, goal); });
    grid.appendChild(chip);
  });
  selectedGoals = [];
  document.getElementById('next-2').disabled = true;
}

function toggleGoal(chip, goal) {
  chip.classList.toggle('selected');
  const on = chip.classList.contains('selected');
  chip.setAttribute('aria-pressed', on ? 'true' : 'false');
  if (on) {
    selectedGoals.push(goal);
  } else {
    selectedGoals = selectedGoals.filter(g => g !== goal);
  }
  document.getElementById('next-2').disabled = selectedGoals.length === 0;
}

export function buildResultCard(container, who, selectedGoalsList) {
  const plan = plans[who];
  const goalList = selectedGoalsList.slice(0, 3);

  container.replaceChildren();

  const h3 = document.createElement('h3');
  h3.textContent = plan.title;
  container.appendChild(h3);

  const body = document.createElement('p');
  body.textContent = plan.body;
  container.appendChild(body);

  if (goalList.length > 0) {
    const focusDiv = document.createElement('div');
    focusDiv.className = 'result-focus';
    const strong = document.createElement('strong');
    strong.textContent = goalList.join(' · ');
    focusDiv.append('Your focus areas: ', strong);
    container.appendChild(focusDiv);
  }

  const cta = document.createElement('p');
  cta.className = 'result-cta';
  cta.textContent = 'Ready to go deeper? Ask your specific money questions below!';
  container.appendChild(cta);
}

function goToStep(n) {
  document.querySelectorAll('.step').forEach(s => {
    s.classList.remove('active');
    s.hidden = true;
  });
  const stepEl = document.getElementById('step-' + n);
  stepEl.classList.add('active');
  stepEl.hidden = false;
  announceAssessment(stepAnnouncements[n] || '');
  focusStepHeading(stepEl);

  if (n === 3 && selectedWho) {
    buildResultCard(document.getElementById('result-card'), selectedWho, selectedGoals);
  }
}

// DOM wiring — only runs when the assessment elements are present
const next1 = document.getElementById('next-1');
const next2 = document.getElementById('next-2');

if (next1 && next2) {
  document.querySelectorAll('#step-1 .choice-card').forEach(card => {
    card.addEventListener('click', function () { selectWho(card, card.dataset.who); });
  });

  next1.addEventListener('click', function () { goToStep(2); });
  next2.addEventListener('click', function () { goToStep(3); });
  document.querySelectorAll('[data-goto-step]').forEach(btn => {
    btn.addEventListener('click', function () { goToStep(Number(btn.dataset.gotoStep)); });
  });
}
