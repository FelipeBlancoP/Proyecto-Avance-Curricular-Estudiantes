import { useTheme } from '../../theme/TemaContext';
import './TemaToggle.css';

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="theme-switch">
            <label className="switch">
                <input
                    type="checkbox"
                    checked={isDark}
                    onChange={toggleTheme}
                    aria-label="Cambiar tema claro / oscuro"
                />
                <span className="slider">
                    <span className="slider-icon">
                        {isDark ? '⏾' : '🔆'}
                    </span>
                </span>
            </label>
        </div>
    );
}

export default ThemeToggle;
