if (!window.storage) {
  window.storage = {
    get(key) {
      try {
        const val = localStorage.getItem(key);
        return val !== null ? JSON.parse(val) : null;
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn('Storage error:', e);
      }
    },
    remove(key) {
      localStorage.removeItem(key);
    },
    clear() {
      localStorage.clear();
    },
  };
}

const s = window.storage;

export function getUser() {
  return {
    name: s.get('user_name') || 'கற்பவர்',
    avatar: s.get('user_avatar') || '🦉',
    level: s.get('user_level') || 'beginner',
    xp: s.get('xp_points') || 0,
    streak: s.get('streak_days') || 0,
    lastActive: s.get('last_active_date'),
    lessonsCompleted: s.get('lessons_completed') || [],
    wordsLearned: s.get('words_learned') || [],
    weakWords: s.get('weak_words') || [],
    activityLog: s.get('activity_log') || [],
  };
}

export function saveUserField(key, value) {
  s.set(key, value);
}

export function addXP(amount) {
  const current = s.get('xp_points') || 0;
  const next = current + amount;
  s.set('xp_points', next);
  return next;
}

export function addWeakWord(word) {
  const weak = s.get('weak_words') || [];
  if (!weak.find(w => w.id === word.id)) {
    s.set('weak_words', [...weak, word]);
  }
}

export function removeWeakWord(wordId) {
  const weak = s.get('weak_words') || [];
  s.set('weak_words', weak.filter(w => w.id !== wordId));
}

export function addLearnedWord(word) {
  const learned = s.get('words_learned') || [];
  if (!learned.find(w => w.id === word.id)) {
    s.set('words_learned', [...learned, word]);
  }
}

export function markLessonComplete(lessonId) {
  const done = s.get('lessons_completed') || [];
  if (!done.includes(lessonId)) {
    s.set('lessons_completed', [...done, lessonId]);
  }
}

export function updateStreak() {
  const today = new Date().toDateString();
  const lastActive = s.get('last_active_date');
  let streak = s.get('streak_days') || 0;

  if (lastActive === today) return streak;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastActive === yesterday.toDateString()) {
    streak += 1;
  } else {
    streak = 1;
  }

  s.set('streak_days', streak);
  s.set('last_active_date', today);
  return streak;
}

export function logActivity(lesson, score, accuracy) {
  const log = s.get('activity_log') || [];
  log.push({ date: new Date().toDateString(), lesson, score, accuracy });
  if (log.length > 30) log.shift();
  s.set('activity_log', log);
}

export function getReminderMessage() {
  const lastActive = s.get('last_active_date');
  if (!lastActive) return null;
  const today = new Date();
  const last = new Date(lastActive);
  const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return { text: 'நேற்று படிக்கவில்லை! இன்று கற்போம்! 📖', level: 1 };
  if (diffDays === 2) return { text: 'உங்கள் Streak போகும்! இப்போதே படிங்க! 🔥', level: 2 };
  if (diffDays >= 3) return { text: 'நீண்ட நாளாக காணவில்லை! வாருங்கள்! 🦉', level: 3 };
  return null;
}

export function isOnboardingDone() {
  return !!s.get('onboarding_done');
}

export function completeOnboarding(name, avatar, level) {
  s.set('user_name', name);
  s.set('user_avatar', avatar);
  s.set('user_level', level);
  s.set('onboarding_done', true);
  s.set('xp_points', 0);
  s.set('streak_days', 0);
  s.set('last_active_date', new Date().toDateString());
}

export function resetProgress() {
  s.clear();
}
