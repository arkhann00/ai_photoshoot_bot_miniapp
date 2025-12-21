import React from "react";
import { formatDateTime } from "../../utils.js";

export function AdminUsersStatsBlock({
                                         items,
                                         page,
                                         pageSize,
                                         total,
                                         loading,
                                         onReload,
                                         onPrevPage,
                                         onNextPage,
                                         onClear,
                                         clearing,
                                     }) {
    const hasItems = items.length > 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const humanPage = page + 1;

    return (
        <section className="admin-section admin-section--users">
            <div className="admin-section__header-row">
                <h3 className="admin-section__title">Статистика пользователей</h3>

                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        type="button"
                        className="admin-button admin-button--ghost admin-button--xs"
                        onClick={onReload}
                        disabled={loading || clearing}
                        title="Обновить статистику"
                    >
                        Обновить
                    </button>

                    <button
                        type="button"
                        className="admin-button admin-button--ghost admin-button--xs"
                        onClick={onClear}
                        disabled={loading || clearing}
                        title="Очистить статистику (необратимо)"
                    >
                        {clearing ? "Очищаю…" : "Очистить"}
                    </button>
                </div>
            </div>

            {loading && <p className="admin-section__hint">Загружаю статистику пользователей…</p>}

            {!loading && !hasItems && (
                <p className="admin-section__hint">Пока нет данных по фотосессиям пользователей.</p>
            )}

            {!loading && hasItems && (
                <>
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th className="admin-table__th admin-table__th--user">Пользователь</th>
                                <th className="admin-table__th admin-table__th--money">Потрачено</th>
                                <th className="admin-table__th admin-table__th--photos">Фотосессии</th>
                                <th className="admin-table__th admin-table__th--date">Последняя сессия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {items.map((row) => {
                                const spentRub = typeof row.spent_rub === "number" ? row.spent_rub : 0;
                                const success = typeof row.photos_success === "number" ? row.photos_success : 0;
                                const failed = typeof row.photos_failed === "number" ? row.photos_failed : 0;
                                const totalPhotos = success + failed;

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

                                        <td className="admin-table__td admin-table__td--number">
                                            {spentRub.toLocaleString("ru-RU")} ₽
                                        </td>

                                        <td className="admin-table__td">
                                            <div className="admin-table__photos">
                                                <span className="admin-badge">Успешных: {success}</span>
                                                <span className="admin-badge admin-badge--muted">Ошибок: {failed}</span>
                                                <span className="admin-badge admin-badge--accent">Всего: {totalPhotos}</span>
                                            </div>
                                        </td>

                                        <td className="admin-table__td admin-table__td--date">
                                            {formatDateTime(row.last_photoshoot_at)}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>

                    <div className="admin-table-footer">
                        <div className="admin-table-footer__info">Пользователей: {total}</div>
                        <div className="admin-table-footer__pager">
                            <button
                                type="button"
                                className="admin-button admin-button--ghost admin-button--xs"
                                onClick={onPrevPage}
                                disabled={page <= 0 || loading || clearing}
                            >
                                Назад
                            </button>
                            <span className="admin-table-footer__page">
                Страница {humanPage} из {totalPages}
              </span>
                            <button
                                type="button"
                                className="admin-button admin-button--ghost admin-button--xs"
                                onClick={onNextPage}
                                disabled={humanPage >= totalPages || loading || clearing}
                            >
                                Вперёд
                            </button>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}