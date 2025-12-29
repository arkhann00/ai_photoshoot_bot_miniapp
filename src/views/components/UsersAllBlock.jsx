import React, { useMemo } from "react";

export function UsersAllBlock({
  users,
  loading,
  onReload,
  query,
  onChangeQuery,
  onClearBalance,
  clearingTelegramId,
  formatDateTime,
}) {
  const filtered = useMemo(() => {
    const q = String(query || "")
      .trim()
      .toLowerCase();
    if (!q) return users;

    return (users || []).filter((u) => {
      const username = (u.username || "").toLowerCase();
      const idStr = String(u.telegram_id || "");
      return username.includes(q) || idStr.includes(q);
    });
  }, [users, query]);

  const totalUsers = Array.isArray(users) ? users.length : 0;
  const shownUsers = Array.isArray(filtered) ? filtered.length : 0;

  return (
    <section className="admin-section admin-section--users">
      <div className="admin-section__header-row">
        <div>
          <h3 className="admin-section__title">Пользователи</h3>
          <div className="admin-section__hint" style={{ marginTop: 4 }}>
            Всего пользователей: <b>{totalUsers}</b>
            {String(query || "").trim() ? (
              <>
                {" "}
                · найдено: <b>{shownUsers}</b>
              </>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          className="admin-button admin-button--ghost admin-button--xs"
          onClick={onReload}
          disabled={loading}
        >
          Обновить список
        </button>
      </div>

      <p className="admin-section__hint">
        Здесь отображаются все пользователи. Можно быстро найти по username или
        Telegram ID и сбросить баланс.
      </p>

      <div className="admin-field admin-field--inline">
        <div className="admin-field__col">
          <label className="admin-label">Поиск</label>
          <input
            type="text"
            className="admin-input"
            value={query}
            onChange={(e) => onChangeQuery(e.target.value)}
            placeholder="Например: 707366569 или username"
          />
        </div>
      </div>

      {loading && (
        <p className="admin-section__hint">Загружаю пользователей…</p>
      )}

      {!loading && filtered.length === 0 && (
        <p className="admin-section__hint">Пользователи не найдены.</p>
      )}

      {!loading && filtered.length > 0 && (
        <div className="admin-table-wrapper admin-table-wrapper--admins">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-table__th admin-table__th--user">
                  Пользователь
                </th>
                <th className="admin-table__th">Баланс</th>
                <th className="admin-table__th">Кредиты</th>
                <th className="admin-table__th">Админ</th>
                <th className="admin-table__th admin-table__th--date">
                  Создан
                </th>
                <th className="admin-table__th admin-table__th--actions">
                  Действия
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((u) => {
                const isClearing =
                  Number(clearingTelegramId) === Number(u.telegram_id);
                const balance = Number(u.balance || 0);

                return (
                  <tr key={u.telegram_id} className="admin-table__tr">
                    <td className="admin-table__td admin-table__td--user">
                      <div className="admin-table__user">
                        <div className="admin-table__user-main">
                          {u.username ? `@${u.username}` : "Без никнейма"}
                        </div>
                        <div className="admin-table__user-sub">
                          ID: {u.telegram_id}
                        </div>
                      </div>
                    </td>

                    <td className="admin-table__td">{balance}</td>
                    <td className="admin-table__td">
                      {Number(u.photoshoot_credits || 0)}
                    </td>
                    <td className="admin-table__td">
                      {u.is_admin ? "Да" : "Нет"}
                    </td>

                    <td className="admin-table__td admin-table__td--date">
                      {formatDateTime
                        ? formatDateTime(u.created_at)
                        : u.created_at || "—"}
                    </td>

                    <td className="admin-table__td admin-table__td--actions">
                      <button
                        type="button"
                        className="admin-button admin-button--ghost admin-button--xs"
                        disabled={isClearing || balance <= 0}
                        onClick={() => onClearBalance(u)}
                        title={
                          balance <= 0 ? "Баланс уже 0" : "Сбросить баланс до 0"
                        }
                      >
                        {isClearing ? "Сбрасываю…" : "Сбросить баланс"}
                      </button>
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
