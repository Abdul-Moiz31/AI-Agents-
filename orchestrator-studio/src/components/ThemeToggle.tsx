import { useTheme } from '../theme/ThemeProvider.js';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="theme-chip"
      onClick={toggleTheme}
      aria-label={isDark ? 'Use light appearance' : 'Use dark appearance'}
    >
      {isDark ? (
        <svg className="theme-chip__icon" width="16" height="16" viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.75" />
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          />
        </svg>
      ) : (
        <svg className="theme-chip__icon" width="16" height="16" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
          />
        </svg>
      )}
      <span className="theme-chip__text">{isDark ? 'Day' : 'Night'}</span>
    </button>
  );
}
