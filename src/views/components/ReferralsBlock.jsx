import React from "react";

export function ReferralsBlock({
                                   referrals,
                                   loading,
                                   onReload,
                                   telegramIdInput,
                                   onChangeTelegramIdInput,
                                   onAddReferral,
                                   onRemoveReferral,
                                   submitting,
                               }) {
    const hasReferrals = referrals.length > 0;

    return (
        <section className="admin-section admin-section--users">
            <div className="admin-section__header-row">
                <h3 className="admin-section__title">Рефералы</h3>
                <button
                    type="button"
                    className="admin-button admin-button--ghost admin-button--xs"
                    onClick={onReload}
                >
                    Обновить список
                </button>
            </div>

            <p className="admin-section__hint">
                Введи Telegram ID пользователя, чтобы добавить его в реферальную программу или убрать из неё.
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

            <p className="admin-section__hint">Достаточно указать только Telegram ID пользователя.</p>

            <div className="admin-admin-actions">
                <button
                    type="button"
                    className="admin-button admin-button--primary"
                    onClick={onAddReferral}
                    disabled={submitting || !telegramIdInput.trim()}
                >
                    {submitting ? "Сохраняю…" : "Добавить в рефералы"}
                </button>
                <button
                    type="button"
                    className="admin-button admin-button--ghost"
                    onClick={onRemoveReferral}
                    disabled={submitting || !telegramIdInput.trim()}
                >
                    Убрать из рефералов
                </button>
            </div>

            <div className="admin-section__subheader-row">
                <h4 className="admin-section__subtitle">Текущие рефералы</h4>
            </div>

            {loading && <p className="admin-section__hint">Загружаю список рефералов…</p>}

            {!loading && !hasReferrals && (
                <p className="admin-section__hint">Пока нет ни одного партнёра-реферала.</p>
            )}

            {!loading && hasReferrals && (
                <div className="admin-table-wrapper admin-table-wrapper--admins">
                    <table className="admin-table">
                        <thead>
                        <tr>
                            <th className="admin-table__th admin-table__th--user">Пользователь</th>
                            <th className="admin-table__th">Рефералов</th>
                            <th className="admin-table__th admin-table__th--money">Заработано</th>
                        </tr>
                        </thead>
                        <tbody>
                        {referrals.map((row) => {
                            const referralsCount =
                                typeof row.referrals_count === "number" ? row.referrals_count : 0;
                            const earnedRub = typeof row.earned_rub === "number" ? row.earned_rub : 0;

                            return (
                                <tr key={row.telegram_id} className="admin-table__tr">
                                    <td className="admin-table__td admin-table__td--user">
                                        <div className="admin-table__user">
                                            <div className="admin-table__user-main">
                                                {row.username ? `@${row.username}` : "Без никнейма"}
                                            </div>
                                            <div className="admin-table__user-sub">ID: {row.telegram_id}</div>
                                        </div>
                                    </td>
                                    <td className="admin-table__td admin-table__td--number">{referralsCount}</td>
                                    <td className="admin-table__td admin-table__td--number">
                                        {earnedRub.toLocaleString("ru-RU")} ₽
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}