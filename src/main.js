import './style.css';

const T = {
  en: {
    title: 'Student Task Manager',
    sub: 'Plan your work. Track your progress.',
    total: 'Total',
    left: 'Remaining',
    done: 'Completed',
    addTitle: 'Add a new task',
    taskName: 'Task name',
    due: 'Due date',
    priority: 'Priority',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    add: '+ Add task',
    myTasks: 'My tasks',
    all: 'All',
    pending: 'Pending',
    completed: 'Completed',
    empty: 'No tasks yet. Add your first task above.',
    late: 'Overdue',
    today: 'Due today',
    soon: 'Due soon',
    noDate: 'No date',
    botTitle: '🤖 Study assistant',
    organize: 'Organize my tasks',
    first: 'What should I do first?',
    tips: 'Study tips',
    botHello: 'Hi! Tap a button and I will help you plan.',
    needTasks:
      'You have no pending tasks. Add some and I will plan them for you.',
    planHead: 'Here is your plan, most urgent first:',
    firstIs: 'Start with: ',
    because: 'It is the most urgent one.',
    tipList:
      '1. Work in 25-minute sessions with 5-minute breaks.\n2. Do the hardest task first, while you have energy.\n3. Split big tasks into small steps.\n4. Put your phone away while you study.',
    lateWarn: 'You have overdue tasks. Finish those first.',
    placeholder: 'Enter your task...',
  },
  ar: {
    title: 'مدير مهام الطالب',
    sub: 'خطّط لعملك. تابع تقدّمك.',
    total: 'الكل',
    left: 'المتبقية',
    done: 'المنجزة',
    addTitle: 'إضافة مهمة جديدة',
    taskName: 'اسم المهمة',
    due: 'تاريخ التسليم',
    priority: 'الأولوية',
    high: 'عالية',
    medium: 'متوسطة',
    low: 'منخفضة',
    add: '+ إضافة مهمة',
    myTasks: 'مهامي',
    all: 'الكل',
    pending: 'المعلّقة',
    completed: 'المكتملة',
    empty: 'لا توجد مهام بعد. أضف أول مهمة من الأعلى.',
    late: 'متأخرة',
    today: 'تُسلَّم اليوم',
    soon: 'قريبة',
    noDate: 'بلا تاريخ',
    botTitle: '🤖 مساعد المذاكرة',
    organize: 'رتّب لي مهامي',
    first: 'بماذا أبدأ؟',
    tips: 'نصائح للمذاكرة',
    botHello: 'أهلًا! اضغط على أحد الأزرار وسأساعدك في التخطيط.',
    needTasks: 'ما عندك مهام معلّقة. أضف بعض المهام وسأرتبها لك.',
    planHead: 'هذه خطتك، الأكثر إلحاحًا أولًا:',
    firstIs: 'ابدأ بـ: ',
    because: 'لأنها الأكثر إلحاحًا.',
    tipList:
      '١. ذاكر على جلسات 25 دقيقة مع راحة 5 دقائق.\n٢. ابدأ بأصعب مهمة وأنت نشيط.\n٣. قسّم المهام الكبيرة إلى خطوات صغيرة.\n٤. ابعد جوالك أثناء المذاكرة.',
    lateWarn: 'عندك مهام متأخرة. أنجزها أولًا.',
    placeholder: 'اكتب مهمتك...',
  },
};
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
let S = { lang: 'en', theme: 'light', tasks: [] },
  filter = 'all';
try {
  Object.assign(S, JSON.parse(localStorage.getItem('stm') || '{}'));
} catch (e) {}
const save = () => {
  try {
    localStorage.setItem('stm', JSON.stringify(S));
  } catch (e) {}
};
const t = (k) => T[S.lang][k];
const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const days = (d) =>
  d ? Math.round((new Date(d + 'T00:00:00') - today()) / 864e5) : null;
const pw = { high: 0, medium: 1, low: 2 };
const sorted = (l) =>
  [...l].sort((a, b) => {
    const da = days(a.date),
      db = days(b.date);
    return (da ?? 9999) - (db ?? 9999) || pw[a.prio] - pw[b.prio];
  });

function applyStatic() {
  document.documentElement.lang = S.lang;
  document.documentElement.dir = S.lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dataset.theme = S.theme;
  $$('[data-t]').forEach((e) => (e.textContent = t(e.dataset.t)));
  $('#name').placeholder = t('placeholder');
  $('#langBtn').textContent = S.lang === 'ar' ? 'EN' : 'ع';
  $('#themeBtn').textContent = S.theme === 'dark' ? '☀️' : '🌙';
}
function badge(task) {
  const d = days(task.date);
  if (d === null) return t('noDate');
  if (task.done) return task.date;
  if (d < 0) return `<span class="late">${t('late')}</span> · ${task.date}`;
  if (d === 0) return `<span class="soon">${t('today')}</span>`;
  if (d <= 2) return `<span class="soon">${t('soon')}</span> · ${task.date}`;
  return task.date;
}
function render() {
  const l = S.tasks,
    dn = l.filter((x) => x.done).length;
  $('#sTotal').textContent = l.length;
  $('#sLeft').textContent = l.length - dn;
  $('#sDone').textContent = dn;
  const v = sorted(l).filter(
    (x) => filter === 'all' || (filter === 'pending' ? !x.done : x.done)
  );
  $('#list').innerHTML = v.length
    ? ''
    : `<div class="empty">${t('empty')}</div>`;
  v.forEach((x) => {
    const el = document.createElement('div');
    el.className = `task ${x.prio}${x.done ? ' done' : ''}`;
    el.innerHTML = `<input type="checkbox" ${
      x.done ? 'checked' : ''
    }><div class="info"><div class="name"></div><div class="meta">${badge(
      x
    )}</div></div><button class="del" aria-label="Delete">×</button>`;
    el.querySelector('.name').textContent = x.name;
    el.querySelector('input').onchange = () => {
      x.done = !x.done;
      save();
      render();
    };
    el.querySelector('.del').onclick = () => {
      S.tasks = S.tasks.filter((y) => y !== x);
      save();
      render();
    };
    $('#list').appendChild(el);
  });
}
$('#addBtn').onclick = () => {
  const n = $('#name').value.trim();
  if (!n) {
    $('#name').focus();
    return;
  }
  S.tasks.push({
    id: Date.now(),
    name: n,
    date: $('#date').value,
    prio: $('#prio').value,
    done: false,
  });
  $('#name').value = '';
  $('#date').value = '';
  save();
  render();
};
$('#name').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') $('#addBtn').click();
});
$('#langBtn').onclick = () => {
  S.lang = S.lang === 'ar' ? 'en' : 'ar';
  save();
  applyStatic();
  render();
};
$('#themeBtn').onclick = () => {
  S.theme = S.theme === 'dark' ? 'light' : 'dark';
  save();
  applyStatic();
};
$('#botBtn').onclick = () => {
  $('#bot').classList.toggle('open');
  $('#botBtn').classList.toggle('on');
};
$$('.filters .chip').forEach(
  (b) =>
    (b.onclick = () => {
      filter = b.dataset.f;
      $$('.filters .chip').forEach((c) =>
        c.classList.toggle('active', c === b)
      );
      render();
    })
);

$$('[data-act]').forEach(
  (b) =>
    (b.onclick = () => {
      const p = sorted(S.tasks.filter((x) => !x.done)),
        out = $('#botOut');
      if (b.dataset.act === 'tips') {
        out.textContent = t('tipList');
        return;
      }
      if (!p.length) {
        out.textContent = t('needTasks');
        return;
      }
      const late = p.some((x) => days(x.date) < 0);
      if (b.dataset.act === 'first') {
        out.textContent = `${t('firstIs')}${p[0].name}\n${t('because')}${
          late ? '\n' + t('lateWarn') : ''
        }`;
        return;
      }
      S.tasks = [...p, ...S.tasks.filter((x) => x.done)];
      save();
      render();
      out.textContent =
        `${t('planHead')}\n` +
        p
          .map(
            (x, i) => `${i + 1}. ${x.name}${x.date ? ' (' + x.date + ')' : ''}`
          )
          .join('\n') +
        (late ? '\n\n' + t('lateWarn') : '');
    })
);
applyStatic();
render();

const MONTHS = {
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  ar: [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ],
};
const WD = {
  en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  ar: ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'],
};
const dateInp = $('#date'),
  cal = $('#cal');
let vy, vm;
const pad = (n) => String(n).padStart(2, '0');
function setPh() {
  dateInp.placeholder = S.lang === 'ar' ? 'اختر التاريخ' : 'Select a date';
}
function drawCal() {
  const first = new Date(vy, vm, 1).getDay(),
    dim = new Date(vy, vm + 1, 0).getDate();
  const td = today(),
    sel = dateInp.value;
  let h = `<div class="cal-head"><button type="button" data-n="-1">‹</button><b>${
    MONTHS[S.lang][vm]
  } ${vy}</b><button type="button" data-n="1">›</button></div><div class="cal-grid">`;
  WD[S.lang].forEach((w) => (h += `<span class="wd">${w}</span>`));
  for (let i = 0; i < first; i++) h += '<span></span>';
  for (let d = 1; d <= dim; d++) {
    const v = `${vy}-${pad(vm + 1)}-${pad(d)}`;
    const isToday =
      vy === td.getFullYear() && vm === td.getMonth() && d === td.getDate();
    h += `<button type="button" class="day${v === sel ? ' sel' : ''}${
      isToday ? ' today' : ''
    }" data-d="${v}">${d}</button>`;
  }
  cal.innerHTML = h + '</div>';
}
dateInp.onclick = () => {
  const b = dateInp.value ? new Date(dateInp.value + 'T00:00:00') : new Date();
  vy = b.getFullYear();
  vm = b.getMonth();
  drawCal();
  cal.classList.add('open');
};
cal.onclick = (e) => {
  const n = e.target.closest('[data-n]'),
    d = e.target.closest('[data-d]');
  if (n) {
    vm += +n.dataset.n;
    if (vm < 0) {
      vm = 11;
      vy--;
    }
    if (vm > 11) {
      vm = 0;
      vy++;
    }
    drawCal();
  }
  if (d) {
    dateInp.value = d.dataset.d;
    cal.classList.remove('open');
  }
};
document.addEventListener('click', (e) => {
  if (!e.target.closest('.datebox')) cal.classList.remove('open');
});
$('#langBtn').addEventListener('click', setPh);
setPh();
