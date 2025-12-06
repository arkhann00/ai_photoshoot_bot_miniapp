// src/components/BottomNav.jsx

import React from "react";

export default function BottomNav({ activeTab, onChange, showAdmin }) {
    return (
        <nav className="bottom-nav">
            <button
                type="button"
                className={
                    activeTab === "home"
                        ? "bottom-nav__btn bottom-nav__btn--active"
                        : "bottom-nav__btn"
                }
                onClick={() => onChange("home")}
            >
                <span className="bottom-nav__icon">✨</span>
                <span className="bottom-nav__label">Стили</span>
            </button>

            <button
                type="button"
                className={
                    activeTab === "profile"
                        ? "bottom-nav__btn bottom-nav__btn--active"
                        : "bottom-nav__btn"
                }
                onClick={() => onChange("profile")}
            >
                <span className="bottom-nav__icon">👤</span>
                <span className="bottom-nav__label">Профиль</span>
            </button>

            {showAdmin && (
                <button
                    type="button"
                    className={
                        activeTab === "admin"
                            ? "bottom-nav__btn bottom-nav__btn--active"
                            : "bottom-nav__btn"
                    }
                    onClick={() => onChange("admin")}
                >
                    <span className="bottom-nav__icon">🛠</span>
                    <span className="bottom-nav__label">Админ</span>
                </button>
            )}
        </nav>
    );
}
