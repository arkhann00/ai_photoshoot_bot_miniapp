import React, { useState } from "react";

import { adminGetUserReferrals } from "../../api.js";

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
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [subReferralsLoading, setSubReferralsLoading] = useState(null);
  const [subReferrals, setSubReferrals] = useState({});

  const hasReferrals = referrals.length > 0;

  const loadSubReferrals = async (telegramId) => {
    if (subReferrals[telegramId]) return; // Уже загружены

    setSubReferralsLoading(telegramId);
    try {
      const data = await adminGetUserReferrals({ telegramId }); // ← Изменено здесь
      setSubReferrals((prev) => ({ ...prev, [telegramId]: data }));
    } catch (error) {
      console.error("Ошибка загрузки подрефералов:", error);
    } finally {
      setSubReferralsLoading(null);
    }
  };

  const toggleSubReferrals = (telegramId) => {
    if (expandedUserId === telegramId) {
      setExpandedUserId(null);
      return;
    }

    setExpandedUserId(telegramId);
    loadSubReferrals(telegramId);
  };

  return (
    <section className="admin-section admin-section--users">
      <div className="admin-section__header-row">
        <h3 className="admin-section__title">Рефералы</h3>
        <button
          type="button"
          className="admin-button admin-button--ghost admin-button--xs"
          onClick={onReload}
          disabled={loading}
        >
          {loading ? "Загрузка…" : "Обновить список"}
        </button>
      </div>

      <p className="admin-section__hint">
        Введи Telegram ID пользователя, чтобы добавить его в реферальную
        программу или убрать из неё.
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

      <p className="admin-section__hint">
        Достаточно указать только Telegram ID пользователя.
      </p>

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

      {loading && (
        <p className="admin-section__hint">Загружаю список рефералов…</p>
      )}

      {!loading && !hasReferrals && (
        <p className="admin-section__hint">
          Пока нет ни одного партнёра-реферала.
        </p>
      )}

      {!loading && hasReferrals && (
        <div className="admin-table-wrapper admin-table-wrapper--admins">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-table__th admin-table__th--user">
                  Пользователь
                </th>
                <th className="admin-table__th admin-table__th--count">
                  Рефералов
                </th>
                <th className="admin-table__th admin-table__th--money">
                  Заработано
                </th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((row) => {
                const referralsCount =
                  typeof row.referrals_count === "number"
                    ? row.referrals_count
                    : 0;
                const earnedRub =
                  typeof row.earned_rub === "number" ? row.earned_rub : 0;
                const hasSubReferrals =
                  subReferrals[row.telegram_id]?.length > 0;
                const isExpanded = expandedUserId === row.telegram_id;
                const isLoadingSub = subReferralsLoading === row.telegram_id;

                return (
                  <>
                    <tr
                      key={row.telegram_id}
                      className={`admin-table__tr ${isExpanded ? "admin-table__tr--expanded" : ""}`}
                      onClick={() => toggleSubReferrals(row.telegram_id)}
                    >
                      <td className="admin-table__td admin-table__td--user">
                        <div className="admin-table__user">
                          <div className="admin-table__user-main">
                            {row.username ? `@${row.username}` : "Без никнейма"}
                          </div>
                          <div className="admin-table__user-sub">
                            ID: {row.telegram_id}
                          </div>
                          {referralsCount > 0 && (
                            <div className="admin-table__expand-icon">
                              {isExpanded ? "▼" : "▶"}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="admin-table__td admin-table__td--count">
                        {referralsCount}
                      </td>
                      <td className="admin-table__td admin-table__td--money">
                        {earnedRub.toLocaleString("ru-RU")} ₽
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="admin-table__tr admin-table__tr--subreferrals">
                        <td
                          colSpan={3}
                          className="admin-table__td admin-table__td--subreferrals"
                        >
                          {isLoadingSub ? (
                            <p className="admin-section__hint">
                              Загружаю рефералов...
                            </p>
                          ) : subReferrals[row.telegram_id]?.length > 0 ? (
                            <div className="admin-subreferrals-table">
                              <table className="admin-table admin-table--nested">
                                <thead>
                                  <tr>
                                    <th className="admin-table__th admin-table__th--user-small">
                                      Подреферал
                                    </th>
                                    <th className="admin-table__th admin-table__th--money-small">
                                      Заработано
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {subReferrals[row.telegram_id].map(
                                    (subRef) => {
                                      const subEarned =
                                        typeof subRef.earned_rub === "number"
                                          ? subRef.earned_rub
                                          : 0;
                                      return (
                                        <tr key={subRef.telegram_id}>
                                          <td className="admin-table__td admin-table__td--user-small">
                                            {subRef.username
                                              ? `@${subRef.username}`
                                              : "Без никнейма"}
                                            <span className="admin-table__user-sub">
                                              ID: {subRef.telegram_id}
                                            </span>
                                          </td>
                                          <td className="admin-table__td admin-table__td--money-small">
                                            {subEarned.toLocaleString("ru-RU")}{" "}
                                            ₽
                                          </td>
                                        </tr>
                                      );
                                    },
                                  )}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="admin-section__hint">
                              У этого пользователя пока нет рефералов
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
