/* ============================================================
   ASK ENGINE
   - topicLibrary: keyword → advice content map
   - scoreTopic:   ranks a topic against the user's question
   - buildAnswer:  picks the best-matching topics and assembles output
   - bindAskForm:  wires a form/textarea/output set in the DOM
   ============================================================ */

/* Fallback shown when no keywords match any topic */
export const defaultReply = {
  label: 'General money habits',
  parts: [
    'A simple first step is to write down what you earn and what you spend each month. You do not need a perfect spreadsheet - a rough picture often shows where money leaks and what matters most to you.',
    'Pick one small win for the next 30 days: trim one subscription, pack lunch a few times, or move a fixed amount to savings on payday. Small repeatable wins build confidence.',
    'When you are ready to go deeper on your exact situation, a certified financial planner or nonprofit credit counselor can give advice tailored to you.'
  ]
};

/* Topic library — each entry has keyword triggers and educational content */
export const topicLibrary = [
  {
    keys: ['budget', 'budgeting', 'spending', 'expenses', 'bills', 'paycheck', 'broke', 'money gone'],
    label: 'Budgeting & spending',
    parts: [
      'Try a zero-based mindset: every dollar is assigned to needs, savings/debt, or wants before the month starts.',
      'Separate fixed costs from flexible ones. If cash is tight, flexible categories are usually where you can adjust first.',
      'Review weekly at first, then monthly. Adjust categories when life changes.'
    ]
  },
  {
    keys: ['save', 'saving', 'savings', 'emergency', 'rainy day', 'buffer'],
    label: 'Saving & emergency funds',
    parts: [
      'A common starting goal is one month of must-pay expenses, then building toward three to six months over time.',
      'Automate a transfer on payday, even if it is small. Paying yourself first beats hoping something is left.',
      'Keep emergency money somewhere safe and liquid, like a savings account.'
    ]
  },
  {
    keys: ['debt', 'credit card', 'pay off', 'loan', 'student loan', 'interest', 'minimum payment', 'collections'],
    label: 'Debt & loans',
    parts: [
      'List debts with balance, interest rate, and minimum payment. Consider avalanche (highest interest first) or snowball (smallest balance first).',
      'While paying down high-interest debt, avoid adding new charges if you can.',
      'For student loans, know whether loans are federal or private because repayment options differ.'
    ]
  },
  {
    keys: ['credit score', 'credit', 'fico', 'build credit', 'secured card'],
    label: 'Credit',
    parts: [
      'Scores generally reward on-time payments, low utilization, and longer history.',
      'Try to keep card utilization under about 30% of your limit, and lower when possible.',
      'Check your credit reports regularly and dispute real errors.'
    ]
  },
  {
    keys: ['invest', 'investing', 'stock', '401k', '403b', 'ira', 'roth', 'retirement', 'index fund', 'etf'],
    label: 'Investing & retirement',
    parts: [
      'If your job offers an employer match, contributing enough to get the full match is often a strong first step.',
      'Broad, low-cost index funds are a common long-term starting point.',
      'For long horizons, consistency usually matters more than trying to time the market.'
    ]
  },
  {
    keys: ['tax', 'taxes', 'w2', '1099', 'self employed', 'freelance', 'side hustle', 'business'],
    label: 'Taxes & self-employment',
    parts: [
      'If you earn non-W2 income, setting aside part of each payment for taxes can prevent a surprise bill.',
      'Track income and expenses as you go to make filing easier.',
      'Use official tax sources for rules, and confirm major decisions with a tax professional.'
    ]
  },
  {
    keys: ['college', 'tuition', 'fafsa', 'scholarship', 'campus'],
    label: 'College costs',
    parts: [
      'Fill out financial aid forms early and compare total cost, not just sticker price.',
      'Every dollar in grants or scholarships can reduce future debt burden.',
      'Part-time work and controlled living costs can lower borrowing pressure.'
    ]
  },
  {
    keys: ['car', 'auto loan', 'lease', 'housing', 'rent', 'mortgage', 'apartment', 'home'],
    label: 'Housing & big purchases',
    parts: [
      'Look at total monthly cost, not only the payment amount.',
      'Include insurance, utilities, and maintenance in your decision.',
      'Read contract details before signing, especially penalties and fees.'
    ]
  }
];

/* Score a topic by summing the character-lengths of matched keywords */
export function scoreTopic(lower, topic) {
  let score = 0;
  topic.keys.forEach(function (k) {
    if (lower.indexOf(k) !== -1) score += k.length;
  });
  return score;
}

/* Pick up to 2 highest-scoring topics; fall back to defaultReply if none match */
export function buildAnswer(question) {
  const lower = question.toLowerCase();
  const scored = topicLibrary.map(function (t) {
    return { t: t, s: scoreTopic(lower, t) };
  }).filter(function (x) {
    return x.s > 0;
  });

  scored.sort(function (a, b) {
    return b.s - a.s;
  });

  const usedDefault = scored.length === 0;
  const picked = usedDefault ? [defaultReply] : scored.slice(0, 2).map(function (x) {
    return x.t;
  });

  const labels = [];
  const parts = [];
  picked.forEach(function (topic) {
    labels.push(topic.label);
    topic.parts.forEach(function (p) {
      parts.push(p);
    });
  });

  return { labels: labels, parts: parts, usedDefault: usedDefault };
}

/* Attach event listeners to a specific form instance via element-ID config */
export function bindAskForm(config) {
  const form = document.getElementById(config.formId);
  const ta = document.getElementById(config.textareaId);
  const out = document.getElementById(config.outputId);
  const bodyEl = document.getElementById(config.bodyId);
  const topicsEl = document.getElementById(config.topicsId);
  const countEl = document.getElementById(config.charCountId);
  const headingEl = document.getElementById(config.headingId);

  if (!form || !ta || !out || !bodyEl || !topicsEl || !countEl || !headingEl) return;

  const max = Number(ta.getAttribute('maxlength')) || 2000;

  function renderAnswer(data) {
    bodyEl.replaceChildren();
    if (data.usedDefault) {
      topicsEl.hidden = true;
      topicsEl.textContent = '';
    } else {
      topicsEl.hidden = false;
      topicsEl.textContent = 'Based on your question, here are ideas related to: ' + data.labels.join(' · ');
    }

    data.parts.forEach(function (text) {
      const p = document.createElement('p');
      p.textContent = text;
      bodyEl.appendChild(p);
    });
  }

  function updateCount() {
    const n = ta.value.length;
    countEl.textContent = n ? max - n + ' characters left' : '';
  }

  ta.addEventListener('input', function () {
    updateCount();
    ta.setCustomValidity('');
    ta.removeAttribute('aria-invalid');
  });
  updateCount();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    ta.setCustomValidity('');

    if (!ta.value.trim()) {
      ta.setCustomValidity('Please enter your money question.');
      ta.setAttribute('aria-invalid', 'true');
      form.reportValidity();
      ta.focus();
      return;
    }

    const answer = buildAnswer(ta.value);
    renderAnswer(answer);
    out.hidden = false;
    headingEl.focus();
  });
}

/* ---- Form instances: home-page teaser and the dedicated Ask page ---- */

bindAskForm({
  formId: 'home-ask-form',
  textareaId: 'home-money-question',
  outputId: 'home-answer-output',
  bodyId: 'home-answer-body',
  topicsId: 'home-answer-topics',
  charCountId: 'home-char-count',
  headingId: 'home-answer-heading'
});

bindAskForm({
  formId: 'ask-form',
  textareaId: 'money-question',
  outputId: 'answer-output',
  bodyId: 'answer-body',
  topicsId: 'answer-topics',
  charCountId: 'char-count',
  headingId: 'answer-heading'
});
