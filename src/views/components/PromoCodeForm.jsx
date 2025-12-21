import React from "react";

export function PromoCodeForm({
                                  code,
                                  generations,
                                  isActive,
                                  onChangeCode,
                                  onChangeGenerations,
                                  onChangeIsActive,
                                  onSubmit,
                                  submitting,
                                  isEdit,
                                  onResetSelection,
                              }) {
    const heading = isEdit ? "Редактирование промокода" : "Новый промокод";

    const buttonLabel = submitting
        ? isEdit
            ? "Сохраняем…"
            : "Создаём…"
        : isEdit
            ? "Сохранить изменения"
            : "Создать промокод";

    return (
        <>
            <h2 className="admin-box__title">{heading}</h2>
            <p className="admin-box__hint">
                Промокод даёт пользователю N генераций. Можно включать/выключать в любой момент.
            </p>

            <div className="admin-field">
                <label className="admin-label">Код</label>
                <input
                    type="text"
                    className="admin-input"
                    value={code}
                    onChange={(e) => onChangeCode(e.target.value)}
                    placeholder="Например, NEWYEAR2026"
                    disabled={isEdit}
                />
                {isEdit && (
                    <p className="admin-hint">
                        Код нельзя менять при редактировании (чтобы не ломать ссылки/логику на бэке).
                    </p>
                )}
            </div>

            <div className="admin-field">
                <label className="admin-label">Генераций</label>
                <input
                    type="number"
                    min={1}
                    className="admin-input"
                    value={generations}
                    onChange={(e) => onChangeGenerations(Number(e.target.value))}
                    placeholder="Например, 3"
                />
            </div>

            <div className="admin-field">
                <label className="admin-label">Активен</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input
                        type="checkbox"
                        checked={Boolean(isActive)}
                        onChange={(e) => onChangeIsActive(e.target.checked)}
                    />
                    <span>Разрешить использование промокода</span>
                </div>
            </div>

            <button
                type="button"
                className="admin-button admin-button--primary admin-button--full"
                onClick={onSubmit}
                disabled={submitting}
            >
                {buttonLabel}
            </button>

            {isEdit && (
                <button
                    type="button"
                    className="admin-button admin-button--ghost admin-button--full"
                    onClick={onResetSelection}
                    disabled={submitting}
                >
                    Сбросить выбор
                </button>
            )}
        </>
    );
}