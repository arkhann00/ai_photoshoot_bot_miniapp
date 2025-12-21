import React from "react";

export function PromoCodesBlock({
                                    promoCodes,
                                    loading,
                                    onReload,
                                    onDeletePromoCode,
                                    deletingCode,
                                    selectedCode,
                                    onSelectPromoCode,
                                    formatDateTime,
                                }) {
    const hasItems = promoCodes.length > 0;

    return (
        <section className="admin-section admin-section--users">
            <div className="admin-section__header-row">
                <h3 className="admin-section__title">Промокоды</h3>
                <button
                    type="button"
                    className="admin-button admin-button--ghost admin-button--xs"
                    onClick={onReload}
                    disabled={loading}
                >
                    Обновить
                </button>
            </div>

            {loading && <p className="admin-section__hint">Загружаю промокоды…</p>}

            {!loading && !hasItems && (
                <p className="admin-section__hint">
                    Промокодов пока нет. Создай первый слева.
                </p>
            )}

            {!loading && hasItems && (
                <div className="admin-table-wrapper admin-table-wrapper--admins">
                    <table className="admin-table">
                        <thead>
                        <tr>
                            <th className="admin-table__th">Код</th>
                            <th className="admin-table__th admin-table__th--number">Генераций</th>
                            <th className="admin-table__th">Статус</th>
                            <th className="admin-table__th admin-table__th--date">Создан</th>
                            <th className="admin-table__th" style={{ width: 90 }} />
                        </tr>
                        </thead>
                        <tbody>
                        {promoCodes.map((p) => {
                            const code = String(p.code || "");
                            const generations =
                                typeof p.generations === "number" ? p.generations : Number(p.generations || 0);
                            const isActive = Boolean(p.is_active);

                            const isSelected = selectedCode === code;

                            return (
                                <tr
                                    key={code}
                                    className="admin-table__tr"
                                    onClick={() => onSelectPromoCode(p)}
                                    style={{ cursor: "pointer", opacity: deletingCode === code ? 0.6 : 1 }}
                                >
                                    <td className="admin-table__td">
                      <span className={isSelected ? "admin-badge admin-badge--accent" : "admin-badge"}>
                        {code || "—"}
                      </span>
                                    </td>

                                    <td className="admin-table__td admin-table__td--number">
                                        {Number.isFinite(generations) ? generations : 0}
                                    </td>

                                    <td className="admin-table__td">
                                        {isActive ? (
                                            <span className="admin-badge">Активен</span>
                                        ) : (
                                            <span className="admin-badge admin-badge--muted">Выключен</span>
                                        )}
                                    </td>

                                    <td className="admin-table__td admin-table__td--date">
                                        {formatDateTime ? formatDateTime(p.created_at) : "—"}
                                    </td>

                                    <td className="admin-table__td" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            type="button"
                                            className="admin-button admin-button--ghost admin-button--xs"
                                            onClick={() => onDeletePromoCode(code)}
                                            disabled={deletingCode === code}
                                            title="Удалить промокод"
                                        >
                                            {deletingCode === code ? "…" : "Удалить"}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>

                    <p className="admin-hint" style={{ marginTop: 10 }}>
                        Клик по строке — редактирование слева.
                    </p>
                </div>
            )}
        </section>
    );
}