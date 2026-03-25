const goals = {
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

const plans = {
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

let selectedWho = null;
let selectedGoals = [];

const stepAnnouncements = {
  1: 'Step 1 of 3. Who are you?',
  2: 'Step 2 of 3. What are your goals? Select one or more.',
  3: 'Step 3 of 3. Your Money Fitness plan.'
};

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
  grid.innerHTML = '';
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
    const plan = plans[selectedWho];
    const goalList = selectedGoals.slice(0, 3).join(' · ');
    document.getElementById('result-card').innerHTML = `
      <h3>${plan.title}</h3>
      <p>${plan.body}</p>
      ${goalList ? `<div style="background:rgba(255,255,255,0.1);border-radius:12px;padding:12px 16px;margin-top:12px;font-size:0.9rem;opacity:0.9;">Your focus areas: <strong>${goalList}</strong></div>` : ''}
      <p style="margin-top:18px;font-size:0.9rem;opacity:0.75;">Ready to go deeper? Ask your specific money questions below!</p>
    `;
  }
}
