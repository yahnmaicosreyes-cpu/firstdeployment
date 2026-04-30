/* ============================================================
   PAYCHECK SIMULATOR ENGINE
   - options:        the 3 paths for accessing a physical paycheck
   - detectRoute:    reads the user's question for routing signals
   - buildSimOutput: orders options and flags a recommendation
   - bindSimForm:    wires the form and renders output into the DOM
   ============================================================ */

/* The 3 paycheck access paths, each with steps and why/how explanations */
export const options = [
  {
    id: 'deposit',
    title: 'Deposit into your bank account',
    tag: 'Best long-term',
    condition: 'You have a bank account',
    steps: [
      {
        action: 'Go to your bank or open their mobile app',
        why: 'Your bank is the safest place for your money. The app option means you can deposit without traveling to a branch.'
      },
      {
        action: 'Sign the back of the check',
        why: 'This is called endorsing. Banks require your signature to confirm you authorized the deposit — without it they can refuse the check.'
      },
      {
        action: 'Deposit at the ATM, teller window, or by photo in the app',
        how: 'ATM: insert card → select Deposit → insert check. Teller: hand them the check and say you want to deposit it. Mobile app: tap Deposit → take a clear photo of the front and back of the check.'
      }
    ],
    result: 'Money goes safely into your account. Use it with a debit card or withdraw cash at any ATM.',
    warning: null
  },
  {
    id: 'cashAtBank',
    title: 'Cash it at your bank',
    tag: 'Need cash now',
    condition: 'You have a bank account and need cash right away',
    steps: [
      {
        action: 'Go to your bank branch during business hours',
        why: 'Your own bank will cash the check for free. Other banks may charge a fee or refuse entirely.'
      },
      {
        action: 'Bring a valid photo ID',
        why: 'The bank is required by law to verify your identity before handing over cash. A school ID, state ID, or driver\'s license all work.'
      },
      {
        action: 'Tell the teller you want to cash the check',
        how: 'Hand them the check and your ID and say: "I\'d like to cash this check." They will count out the bills and hand them to you. Takes about 5 minutes.'
      }
    ],
    result: 'You walk out with cash immediately — no waiting period, no holds.',
    warning: null
  },
  {
    id: 'checkCashing',
    title: 'Check cashing store',
    tag: 'No bank account',
    condition: 'You do not have a bank account',
    steps: [
      {
        action: 'Find a check cashing store near you',
        how: 'Search "check cashing near me." Common chains include ACE Cash Express, Check Into Cash, and some Walmart or pharmacy locations.'
      },
      {
        action: 'Bring a valid photo ID',
        why: 'Required by law — they cannot cash your check without it. A school ID, state ID, or driver\'s license all work.'
      },
      {
        action: 'Pay the fee and receive your cash',
        why: 'Fees are typically 1–3% of the check amount. On a $400 paycheck that is $4–12. You get the rest in cash immediately.'
      }
    ],
    result: 'You get cash immediately, minus the fee.',
    warning: 'Fees add up over time. Once you can, opening a free checking account saves you money on every future paycheck.'
  }
];

/* Read the question for routing signals */
export function detectRoute(question) {
  const lower = question.toLowerCase();
  const noBank = /no bank|don.t have a bank|no account|without.*(a )?account|no checking|unbanked|check cash(ing)?/i.test(lower);
  return {
    noBank,
    needCash: /\bneed cash\b|\bwant cash\b|cash (it|the check)|right now|today\b|immediately|asap|urgent/i.test(lower),
    hasBank:  !noBank && /\bmy bank\b|have a bank|have an account|my account|bank account|checking account/i.test(lower)
  };
}

/* Order options and flag a recommendation based on detected signals */
export function buildSimOutput(question) {
  const signals = detectRoute(question);
  const ordered = [...options];
  let recommendedId = null;

  if (signals.noBank) {
    recommendedId = 'checkCashing';
    ordered.sort(function (a, b) { return a.id === 'checkCashing' ? -1 : b.id === 'checkCashing' ? 1 : 0; });
  } else if (signals.needCash && signals.hasBank) {
    recommendedId = 'cashAtBank';
    ordered.sort(function (a, b) { return a.id === 'cashAtBank' ? -1 : b.id === 'cashAtBank' ? 1 : 0; });
  } else if (signals.hasBank) {
    recommendedId = 'deposit';
  }

  return { options: ordered, recommendedId: recommendedId };
}

/* Build DOM for one step, including the Why?/How? toggle */
function buildStep(step, idx) {
  const li = document.createElement('li');
  li.className = 'sim-step';

  const row = document.createElement('div');
  row.className = 'sim-step-row';

  const num = document.createElement('span');
  num.className = 'sim-step-num';
  num.setAttribute('aria-hidden', 'true');
  num.textContent = String(idx + 1);
  row.appendChild(num);

  const text = document.createElement('span');
  text.className = 'sim-step-text';
  text.textContent = step.action;
  row.appendChild(text);

  const expandLabel = step.why ? 'Why?' : 'How?';
  const expandContent = step.why || step.how;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'why-btn';
  btn.textContent = expandLabel;
  btn.setAttribute('aria-expanded', 'false');

  const detail = document.createElement('p');
  detail.className = 'why-content';
  detail.hidden = true;
  detail.textContent = expandContent;

  btn.addEventListener('click', function () {
    const willOpen = detail.hidden;
    detail.hidden = !willOpen;
    btn.setAttribute('aria-expanded', String(willOpen));
  });

  row.appendChild(btn);
  li.appendChild(row);
  li.appendChild(detail);
  return li;
}

/* Build the full simulator output DOM from a buildSimOutput result */
function renderSim(data, container) {
  container.replaceChildren();

  if (data.recommendedId) {
    const routed = document.createElement('p');
    routed.className = 'sim-routed';
    routed.textContent = 'Based on what you told us, we flagged your best option — but review all three.';
    container.appendChild(routed);
  }

  data.options.forEach(function (opt) {
    const card = document.createElement('div');
    card.className = 'sim-option' + (opt.id === data.recommendedId ? ' sim-option--recommended' : '');

    /* Header: title, tag, optional recommended badge */
    const header = document.createElement('div');
    header.className = 'sim-option-header';

    const titleEl = document.createElement('h3');
    titleEl.className = 'sim-option-title';
    titleEl.textContent = opt.title;
    header.appendChild(titleEl);

    const tagEl = document.createElement('span');
    tagEl.className = 'sim-tag';
    tagEl.textContent = opt.tag;
    header.appendChild(tagEl);

    if (opt.id === data.recommendedId) {
      const badge = document.createElement('span');
      badge.className = 'sim-rec-badge';
      badge.textContent = '★ Recommended for you';
      header.appendChild(badge);
    }

    card.appendChild(header);

    /* "Do this if:" condition line */
    const cond = document.createElement('p');
    cond.className = 'sim-condition';
    const condStrong = document.createElement('strong');
    condStrong.textContent = 'Do this if: ';
    cond.appendChild(condStrong);
    cond.append(opt.condition);
    card.appendChild(cond);

    /* Numbered steps with Why?/How? toggles */
    const ol = document.createElement('ol');
    ol.className = 'sim-steps';
    opt.steps.forEach(function (step, i) { ol.appendChild(buildStep(step, i)); });
    card.appendChild(ol);

    /* Result summary */
    const result = document.createElement('div');
    result.className = 'sim-result';
    const resultStrong = document.createElement('strong');
    resultStrong.textContent = 'Result: ';
    result.appendChild(resultStrong);
    result.append(opt.result);
    card.appendChild(result);

    /* Warning (check cashing option only) */
    if (opt.warning) {
      const warn = document.createElement('div');
      warn.className = 'sim-warning';
      warn.textContent = opt.warning;
      card.appendChild(warn);
    }

    container.appendChild(card);
  });
}

/* Wire the simulator form to the engine */
export function bindSimForm(config) {
  const form     = document.getElementById(config.formId);
  const ta       = document.getElementById(config.textareaId);
  const out      = document.getElementById(config.outputId);
  const bodyEl   = document.getElementById(config.bodyId);
  const countEl  = document.getElementById(config.charCountId);
  const headingEl = document.getElementById(config.headingId);

  if (!form || !ta || !out || !bodyEl || !countEl || !headingEl) return;

  const max = Number(ta.getAttribute('maxlength')) || 500;

  function updateCount() {
    const n = ta.value.length;
    countEl.textContent = n ? (max - n) + ' characters left' : '';
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
      ta.setCustomValidity('Tell us your paycheck situation.');
      ta.setAttribute('aria-invalid', 'true');
      form.reportValidity();
      ta.focus();
      return;
    }

    const data = buildSimOutput(ta.value);
    renderSim(data, bodyEl);
    out.hidden = false;
    headingEl.focus();
  });
}

/* Bind the simulator form on this page */
bindSimForm({
  formId:      'sim-form',
  textareaId:  'sim-question',
  outputId:    'sim-output',
  bodyId:      'sim-body',
  charCountId: 'sim-char-count',
  headingId:   'sim-heading'
});
