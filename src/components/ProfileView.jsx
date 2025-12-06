import React, { useEffect, useState, useCallback } from "react";
import { fetchAvatars, deleteAvatar } from "../api.js";

export default function ProfileView({ me, onError, onGlobalLoadingChange }) {
    const [avatars, setAvatars] = useState([]);
    const [loadingAvatars, setLoadingAvatars] = useState(true);
    const [removingId, setRemovingId] = useState(null);

    const loadAvatars = useCallback(async () => {
        setLoadingAvatars(true);
        onGlobalLoadingChange(true);
        try {
            const data = await fetchAvatars();
            setAvatars(data || []);
        } catch (e) {
            onError(e.message || "Не удалось загрузить аватары");
        } finally {
            setLoadingAvatars(false);
            onGlobalLoadingChange(false);
        }
    }, [onError, onGlobalLoadingChange]);

    useEffect(() => {
        loadAvatars();
    }, [loadAvatars]);

    const handleCopyReferral = async () => {
        if (!me?.referral_url) return;
        try {
            await navigator.clipboard.writeText(me.referral_url);
            // Небольшой нотиф можно сделать позже
            alert("Реферальная ссылка скопирована");
        } catch (e) {
            console.warn("Clipboard error:", e);
            onError("Не удалось скопировать ссылку");
        }
    };

    const handleDeleteAvatar = async (id) => {
        if (!window.confirm("Удалить этот аватар?")) return;

        setRemovingId(id);
        onGlobalLoadingChange(true);
        try {
            await deleteAvatar(id);
            setAvatars((prev) => prev.filter((a) => a.id !== id));
        } catch (e) {
            onError(e.message || "Не удалось удалить аватар");
        } finally {
            setRemovingId(null);
            onGlobalLoadingChange(false);
        }
    };

    return (
        <div className="screen screen--profile">
            <section className="card card--glass">
                <h2 className="card__title">Твой профиль</h2>
                {me ? (
                    <div className="profile-info">
                        <div className="profile-info__row">
                            <span className="profile-info__label">ID</span>
                            <span className="profile-info__value">{me.telegram_id}</span>
                        </div>
                        <div className="profile-info__row">
                            <span className="profile-info__label">Username</span>
                            <span className="profile-info__value">
                {me.username ? `@${me.username}` : "—"}
              </span>
                        </div>
                        <div className="profile-info__row">
                            <span className="profile-info__label">Баланс</span>
                            <span className="profile-info__value">{me.balance} ₽</span>
                        </div>
                        <div className="profile-info__row">
                            <span className="profile-info__label">Фотосессий</span>
                            <span className="profile-info__value">
                {me.photoshoot_credits}
              </span>
                        </div>
                        {me.is_admin && (
                            <div className="profile-info__pill">Admin</div>
                        )}
                    </div>
                ) : (
                    <p className="card__text">Загрузка профиля…</p>
                )}
            </section>

            <section className="card card--glass">
                <h2 className="card__title">Реферальная ссылка</h2>
                {me?.referral_url ? (
                    <>
                        <p className="card__text">
                            Приглашай друзей и получай бонусы за их фотосессии.
                        </p>
                        <div className="referral-box">
                            <div className="referral-box__url">{me.referral_url}</div>
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={handleCopyReferral}
                            >
                                Скопировать
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="card__text">
                        Открой мини-аппу через Telegram, чтобы получить рабочую реферальную
                        ссылку.
                    </p>
                )}
            </section>

            <section className="card card--glass">
                <h2 className="card__title">Аватары</h2>
                {loadingAvatars ? (
                    <div className="loader">Загружаем аватары…</div>
                ) : avatars.length === 0 ? (
                    <p className="card__text">
                        У тебя пока нет аватаров. После фотосессии в боте можно нажать
                        «Сделать это фото аватаром», и они появятся здесь.
                    </p>
                ) : (
                    <div className="avatar-list">
                        {avatars.map((avatar) => (
                            <div className="avatar-item" key={avatar.id}>
                                <div className="avatar-item__icon">
                                    {/* Здесь мы не можем показать реальное изображение,
                     потому что в avatar.file_id — telegram file_id,
                     а не URL. Для веба нужна отдельная прокси-ручка.
                     Пока делаем абстрактный аватар. */}
                                    <div className="avatar-circle" />
                                </div>
                                <div className="avatar-item__info">
                                    <div className="avatar-item__title">
                                        Аватар #{avatar.id}
                                    </div>
                                    <div className="avatar-item__subtitle">
                                        Стиль: {avatar.source_style_title || "неизвестен"}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="avatar-item__delete"
                                    onClick={() => handleDeleteAvatar(avatar.id)}
                                    disabled={removingId === avatar.id}
                                >
                                    {removingId === avatar.id ? "…" : "✕"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
