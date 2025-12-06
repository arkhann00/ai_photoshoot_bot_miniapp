// src/App.jsx

import React, { useEffect, useState } from "react";
import Layout from "./components/Layout.jsx";
import PhotoshootView from "./views/PhotoshootView.jsx";
import AdminView from "./views/AdminView.jsx";
import { fetchMe } from "./api.js";

function App() {
    const [me, setMe] = useState(null);
    const [activeTab, setActiveTab] = useState("home");
    const [isLoadingMe, setIsLoadingMe] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function loadMe() {
            try {
                const data = await fetchMe();
                if (!isMounted) return;
                setMe(data);
            } catch (e) {
                if (!isMounted) return;
                setError(e.message || "Ошибка загрузки профиля");
            } finally {
                if (isMounted) {
                    setIsLoadingMe(false);
                }
            }
        }

        loadMe();

        return () => {
            isMounted = false;
        };
    }, []);

    if (isLoadingMe) {
        return (
            <div className="app-root app-root--center">
                <div className="loader" />
                <p className="loader__text">Загружаем данные…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="app-root app-root--center">
                <p className="error-text">Ошибка: {error}</p>
            </div>
        );
    }

    return (
        <Layout me={me} activeTab={activeTab} onChangeTab={setActiveTab}>
            {activeTab === "home" && <PhotoshootView me={me} />}

            {activeTab === "profile" && (
                <div className="screen">
                    <section className="card">
                        <h2 className="card__title">Профиль</h2>
                        <p className="card__text">
                            Telegram ID: <b>{me.telegram_id}</b>
                        </p>
                        <p className="card__text">
                            Username:{" "}
                            <b>{me.username ? `@${me.username}` : "не указан"}</b>
                        </p>
                    </section>
                </div>
            )}

            {activeTab === "admin" && <AdminView me={me} />}
        </Layout>
    );
}

export default App;
