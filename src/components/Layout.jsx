// src/components/Layout.jsx

import React from "react";
import BottomNav from "./BottomNav.jsx";

export default function Layout({ me, activeTab, onChangeTab, children }) {
    const showAdmin = !!me?.is_admin;

    return (
        <div className="app-root">
            <header className="app-header">
                <div className="app-header__title-block">
                    <h1 className="app-header__title">AI Photoshoot</h1>
                    <p className="app-header__subtitle">
                        Фотосессии из селфи за пару тапов
                    </p>
                </div>

                {me && (
                    <div className="app-header__stats">
                        <span className="app-header__stat">
                            {me.balance} ₽
                        </span>
                        <span className="app-header__stat">
                            Сессий: {me.photoshoot_credits}
                        </span>
                    </div>
                )}
            </header>

            <main className="app-main">{children}</main>

            <BottomNav
                activeTab={activeTab}
                onChange={onChangeTab}
                showAdmin={showAdmin}
            />
        </div>
    );
}
