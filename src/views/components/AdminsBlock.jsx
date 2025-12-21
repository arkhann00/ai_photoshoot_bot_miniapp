import React from "react";
import { formatDateTime } from "../../utils";

export function AdminsBlock({
                                admins,
                                loading,
                                onReload,
                                telegramIdInput,
                                onChangeTelegramIdInput,
                                onSetAdmin,
                                onUnsetAdmin,
                                submitting,
                            }) {
    return (
        <section className="admin-section admin-section--users">
            <div className="admin-section__header-row">
                <h3 className="admin-section__title">Админы</h3>
                <button
                    type="button"
                    className="admin-button admin-button--ghost admin-button--xs"
                    onClick={onReload}
                >
                    Обновить список
                </button>
            </div>

            <p className="admin-section__hint">
                Введи Telegram ID пользователя, чтобы выдать или снять права админа.
            </p>

            <div className="admin-field admin-field--inline">
                <div className="admin-field__col">
                    <label className="admin-label">Telegram ID</label>
                    <input
                        type="text"
                        className="admin-input"
                        value={telegramIdInput}
                        onChange={(e) => onChangeTelegramIdInput(e.target.value)}
                        placeholder="Например, 707366569"
                    />
                </div>
            </div>

            <div className="admin-admin-actions">
                <button
                    type="button"
                    className="admin-button admin-button--primary"
                    onClick={onSetAdmin}
                    disabled={submitting || !telegramIdInput.trim()}
                >
                    {submitting ? "Сохраняю…" : "Сделать админом"}
                </button>
                <button
                    type="button"
                    className="admin-button admin-button--ghost"
                    onClick={onUnsetAdmin}
                    disabled={submitting || !telegramIdInput.trim()}
                >
                    Снять права
                </button>
            </div>

            <div className="admin-section__subheader-row">
                <h4 className="admin-section__subtitle">Текущие админы</h4>
            </div>

            {loading && <p className="admin-section__hint">Загружаю список админов…</p>}

            {!loading && admins.length === 0 && (
                <p className="admin-section__hint">
                    Пока нет пользователей с правами админа, кроме супер-админа.
                </p>
            )}

            {!loading && admins.length > 0 && (
                <div className="admin-table-wrapper admin-table-wrapper--admins">
                    <table className="admin-table">
                        <thead>
                        <tr>
                            <th className="admin-table__th admin-table__th--user">Пользователь</th>
                            <th className="admin-table__th admin-table__th--date">Дата создания</th>
                        </tr>
                        </thead>
                        <tbody>
                        {admins.map((u) => (
                            <tr key={u.telegram_id} className="admin-table__tr">
                                <td className="admin-table__td admin-table__td--user">
                                    <div className="admin-table__user">
                                        <div className="admin-table__user-main">
                                            {u.username ? `@${u.username}` : "Без никнейма"}
                                        </div>
                                        <div className="admin-table__user-sub">ID: {u.telegram_id}</div>
                                    </div>
                                </td>
                                <td className="admin-table__td admin-table__td--date">
                                    {formatDateTime(u.created_at)}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}