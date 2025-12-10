import React, { useEffect, useState, useMemo } from "react";
import "./AdminView.css";

const API_BASE = "http://62.113.42.113:8001/api";
// const API_BASE = "http://0.0.0.0:8000/api";

/* ---------- API helpers ---------- */

async function adminGetCategories() {
    const res = await fetch(`${API_BASE}/admin/style-categories`, {
        credentials: "include",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ошибка загрузки категорий: ${res.status} ${text}`);
    }

    return res.json();
}

async function adminUpdateCategory({ id, title, description, gender, file }) {
    const form = new FormData();

    if (title !== undefined && title !== null) {
        form.append("title", title);
    }
    if (description !== undefined && description !== null) {
        form.append("description", description);
    }
    if (gender !== undefined && gender !== null) {
        form.append("gender", gender);
    }
    if (file) {
        form.append("image", file);
    }

    const res = await fetch(`${API_BASE}/admin/style-categories/${id}`, {
        method: "PUT",
        body: form,
        credentials: "include",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(
            `Ошибка обновления категории: ${res.status} ${text}`,
        );
    }

    return res.json();
}

async function adminUpdateStyle({
                                    id,
                                    title,
                                    description,
                                    prompt,
                                    categoryId,
                                    file,
                                }) {
    const form = new FormData();

    if (title !== undefined && title !== null) {
        form.append("title", title);
    }
    if (description !== undefined && description !== null) {
        form.append("description", description);
    }
    if (prompt !== undefined && prompt !== null) {
        form.append("prompt", prompt);
    }
    if (categoryId !== undefined && categoryId !== null) {
        form.append("category_id", String(categoryId));
    }
    if (file) {
        form.append("image", file);
    }

    const res = await fetch(`${API_BASE}/admin/styles/${id}`, {
        method: "PUT",
        body: form,
        credentials: "include",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ошибка обновления стиля: ${res.status} ${text}`);
    }

    return res.json();
}


async function adminCreateCategory({ title, description, gender, file }) {
    const form = new FormData();
    form.append("title", title);
    form.append("description", description);
    form.append("gender", gender);
    if (file) {
        form.append("image", file);
    }

    const res = await fetch(`${API_BASE}/admin/style-categories`, {
        method: "POST",
        body: form,
        credentials: "include",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ошибка создания категории: ${res.status} ${text}`);
    }

    return res.json();
}

async function adminDeleteCategory(categoryId) {
    const res = await fetch(`${API_BASE}/admin/style-categories/${categoryId}`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ошибка удаления категории: ${res.status} ${text}`);
    }

    return res.json();
}

async function adminGetStyles() {
    const res = await fetch(`${API_BASE}/admin/styles`, {
        credentials: "include",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ошибка загрузки стилей: ${res.status} ${text}`);
    }

    return res.json();
}

async function adminCreateStyle({ title, description, prompt, categoryId, file }) {
    const form = new FormData();
    form.append("title", title);
    form.append("description", description);
    form.append("prompt", prompt);
    form.append("category_id", String(categoryId));
    if (file) {
        form.append("image", file);
    }

    const res = await fetch(`${API_BASE}/admin/styles`, {
        method: "POST",
        body: form,
        credentials: "include",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ошибка создания стиля: ${res.status} ${text}`);
    }

    return res.json();
}


async function adminDeleteStyle(styleId) {
    const res = await fetch(`${API_BASE}/admin/styles/${styleId}`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ошибка удаления стиля: ${res.status} ${text}`);
    }

    return res.json();
}

/**
 * Статистика пользователей.
 * GET /api/admin/users/stats
 * [
 *   {
 *     telegram_id,
 *     username,
 *     spent_rub,
 *     photos_success,
 *     photos_failed,
 *     last_photoshoot_at
 *   }
 * ]
 */
async function adminGetUserStats() {
    const res = await fetch(`${API_BASE}/admin/users/stats`, {
        credentials: "include",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(
            `Ошибка загрузки статистики пользователей: ${res.status} ${text}`,
        );
    }

    return res.json();
}

/**
 * Админы:
 * GET  /api/admin/admins
 * POST /api/admin/users/{telegram_id}/admin-flag { is_admin: bool }
 */
async function adminGetAdmins() {
    const res = await fetch(`${API_BASE}/admin/admins`, {
        credentials: "include",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ошибка загрузки списка админов: ${res.status} ${text}`);
    }

    return res.json();
}

async function adminSetAdminFlag({ telegramId, isAdmin }) {
    const res = await fetch(
        `${API_BASE}/admin/users/${telegramId}/admin-flag`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ is_admin: isAdmin }),
        },
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error(
            `Ошибка изменения прав админа: ${res.status} ${text}`,
        );
    }

    return res.json();
}

/* ---------- Утилиты ---------- */

function formatDateTime(value) {
    if (!value) {
        return "—";
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        return "—";
    }
    const date = d.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
    const time = d.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
    });
    return `${date} ${time}`;
}

/* ---------- UI блоки ---------- */

function CategoryChip({ category, onDelete, onSelect, isActive }) {
    const labelGender = category.gender === "female" ? "Ж" : "М";

    function handleClick() {
        onSelect(category);
    }

    function handleDeleteClick(event) {
        event.stopPropagation();
        onDelete(category.id);
    }

    const className = isActive
        ? "admin-chip admin-chip--active"
        : "admin-chip";

    return (
        <div className={className} onClick={handleClick}>
            <span className="admin-chip__text">
                {category.title} · {labelGender}
            </span>
            <button
                type="button"
                className="admin-chip__delete"
                onClick={handleDeleteClick}
                title="Удалить категорию"
            >
                ✕
            </button>
        </div>
    );
}


function AdminCategoriesBlock({
                                  categories,
                                  onReload,
                                  onDeleteCategory,
                                  deletingId,
                                  selectedCategoryId,
                                  onSelectCategory,
                              }) {
    const hasCategories = categories.length > 0;

    return (
        <section className="admin-section admin-section--compact">
            <div className="admin-section__header-row">
                <h3 className="admin-section__title">Категории</h3>
                <button
                    type="button"
                    className="admin-button admin-button--ghost admin-button--xs"
                    onClick={onReload}
                >
                    Обновить
                </button>
            </div>

            {!hasCategories && (
                <p className="admin-section__hint">
                    Категорий пока нет. Создай первую выше.
                </p>
            )}

            {hasCategories && (
                <div className="admin-chips-row">
                    {categories.map((cat) => (
                        <CategoryChip
                            key={cat.id}
                            category={cat}
                            onDelete={onDeleteCategory}
                            onSelect={onSelectCategory}
                            isActive={selectedCategoryId === cat.id}
                        />
                    ))}
                    {deletingId !== null && (
                        <span className="admin-chips-row__status">Удаляем…</span>
                    )}
                </div>
            )}
        </section>
    );
}


function AdminStylesBlock({
                              styles,
                              loading,
                              onReload,
                              onDeleteStyle,
                              deletingId,
                              hasCategorySelected,
                              selectedStyleId,
                              onSelectStyle,
                          }) {
    return (
        <section className="admin-section admin-section--compact">
            <div className="admin-section__header-row">
                <h3 className="admin-section__title">Стили категории</h3>
                <button
                    type="button"
                    className="admin-button admin-button--ghost admin-button--xs"
                    onClick={onReload}
                >
                    Обновить
                </button>
            </div>

            {!hasCategorySelected && (
                <p className="admin-section__hint">
                    Сначала выбери категорию выше, чтобы увидеть её стили.
                </p>
            )}

            {hasCategorySelected && loading && (
                <p className="admin-section__hint">Загружаю стили…</p>
            )}

            {hasCategorySelected && !loading && styles.length === 0 && (
                <p className="admin-section__hint">
                    В выбранной категории пока нет стилей.
                </p>
            )}

            {hasCategorySelected && !loading && styles.length > 0 && (
                <div className="admin-style-list">
                    {styles.map((style) => {
                        const itemClassName =
                            selectedStyleId === style.id
                                ? "admin-style-item admin-style-item--active"
                                : "admin-style-item";

                        function handleClick() {
                            onSelectStyle(style);
                        }

                        function handleDeleteClick(event) {
                            event.stopPropagation();
                            onDeleteStyle(style.id);
                        }

                        return (
                            <div
                                key={style.id}
                                className={itemClassName}
                                onClick={handleClick}
                            >
                                <div className="admin-style-item__row">
                                    <div className="admin-style-item__main">
                                        <div className="admin-style-item__title">
                                            {style.title}
                                        </div>
                                        {style.description && (
                                            <div className="admin-style-item__description">
                                                {style.description}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        className="admin-style-item__delete"
                                        onClick={handleDeleteClick}
                                        disabled={deletingId === style.id}
                                        title="Удалить стиль"
                                    >
                                        {deletingId === style.id ? "…" : "✕"}
                                    </button>
                                </div>
                                <div className="admin-style-item__meta">
                                    <span className="admin-style-item__badge">
                                        #{style.id}
                                    </span>
                                    <span className="admin-style-item__badge">
                                        {style.gender === "female"
                                            ? "Женская категория"
                                            : "Мужская категория"}
                                    </span>
                                    {!style.is_active && (
                                        <span className="admin-style-item__badge admin-style-item__badge--inactive">
                                            Неактивен
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}


function CategoryForm({
                          title,
                          description,
                          gender,
                          file,
                          onChangeTitle,
                          onChangeDescription,
                          onChangeGender,
                          onChangeFile,
                          onSubmit,
                          submitting,
                          isEdit,
                          onResetSelection,
                      }) {
    const heading = isEdit ? "Редактирование категории" : "Новая категория";

    const buttonLabel = submitting
        ? isEdit
            ? "Сохраняем…"
            : "Создаём…"
        : isEdit
            ? "Сохранить изменения"
            : "Создать категорию";

    return (
        <>
            <h2 className="admin-box__title">{heading}</h2>
            <p className="admin-box__hint">
                Категория объединяет несколько стилей. Например: «Vogue», «Dubai»,
                «Аниме».
            </p>

            <div className="admin-field">
                <label className="admin-label">Название</label>
                <input
                    type="text"
                    className="admin-input"
                    value={title}
                    onChange={(e) => onChangeTitle(e.target.value)}
                    placeholder="Например, Vogue Dubai"
                />
            </div>

            <div className="admin-field">
                <label className="admin-label">Описание</label>
                <textarea
                    className="admin-textarea"
                    rows={3}
                    value={description}
                    onChange={(e) => onChangeDescription(e.target.value)}
                    placeholder="Коротко опиши, что за категория."
                />
            </div>

            <div className="admin-field">
                <label className="admin-label">Пол категории</label>
                <select
                    className="admin-select"
                    value={gender}
                    onChange={(e) => onChangeGender(e.target.value)}
                >
                    <option value="female">Женская</option>
                    <option value="male">Мужская</option>
                </select>
            </div>

            <div className="admin-field">
                <label className="admin-label">Картинка категории</label>
                <div className="admin-file-row">
                    <input
                        type="file"
                        accept="image/*"
                        className="admin-file-input"
                        onChange={(e) =>
                            onChangeFile(
                                e.target.files && e.target.files[0]
                                    ? e.target.files[0]
                                    : null,
                            )
                        }
                    />
                    {file && <span className="admin-file-name">{file.name}</span>}
                </div>
                <p className="admin-hint">
                    JPEG / PNG / WEBP, до 5&nbsp;МБ. Показывается в боте при выборе
                    категории.
                </p>
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


function StyleForm({
                       title,
                       description,
                       prompt,
                       categoryId,
                       file,
                       categories,
                       onChangeTitle,
                       onChangeDescription,
                       onChangePrompt,
                       onChangeCategoryId,
                       onChangeFile,
                       onSubmit,
                       submitting,
                       isEdit,
                       onResetSelection,
                   }) {
    const hasCategories = categories.length > 0;

    const categoryOptions = useMemo(
        () =>
            categories.map((cat) => ({
                id: cat.id,
                label:
                    cat.gender === "female"
                        ? `${cat.title} · Ж`
                        : `${cat.title} · М`,
            })),
        [categories],
    );

    const heading = isEdit ? "Редактирование стиля" : "Новый стиль";

    const buttonLabel = submitting
        ? isEdit
            ? "Сохраняем…"
            : "Создаём…"
        : isEdit
            ? "Сохранить изменения"
            : "Создать стиль";

    return (
        <>
            <h2 className="admin-box__title">{heading}</h2>
            <p className="admin-box__hint">
                Стиль относится к выбранной категории и наследует её пол.
            </p>

            <div className="admin-field">
                <label className="admin-label">Название</label>
                <input
                    type="text"
                    className="admin-input"
                    value={title}
                    onChange={(e) => onChangeTitle(e.target.value)}
                    placeholder="Например, Vogue backstage"
                />
            </div>

            <div className="admin-field">
                <label className="admin-label">Описание</label>
                <textarea
                    className="admin-textarea"
                    rows={3}
                    value={description}
                    onChange={(e) => onChangeDescription(e.target.value)}
                    placeholder="Как ты объяснишь пользователю, что это за стиль."
                />
            </div>

            <div className="admin-field">
                <label className="admin-label">Промпт для генерации</label>
                <textarea
                    className="admin-textarea"
                    rows={4}
                    value={prompt}
                    onChange={(e) => onChangePrompt(e.target.value)}
                    placeholder="Подробный промпт, который уйдёт в модель при генерации."
                />
                <p className="admin-hint">
                    Этот текст используется только для AI-генерации, пользователю не
                    показывается.
                </p>
            </div>

            <div className="admin-field">
                <label className="admin-label">Категория стиля</label>
                {!hasCategories && (
                    <p className="admin-hint">
                        Сначала создай хотя бы одну категорию.
                    </p>
                )}
                {hasCategories && (
                    <select
                        className="admin-select"
                        value={categoryId || ""}
                        onChange={(e) =>
                            onChangeCategoryId(
                                e.target.value ? Number(e.target.value) : null,
                            )
                        }
                    >
                        <option value="">Выбери категорию</option>
                        {categoryOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div className="admin-field">
                <label className="admin-label">Картинка примера</label>
                <div className="admin-file-row">
                    <input
                        type="file"
                        accept="image/*"
                        className="admin-file-input"
                        onChange={(e) =>
                            onChangeFile(
                                e.target.files && e.target.files[0]
                                    ? e.target.files[0]
                                    : null,
                            )
                        }
                    />
                    {file && <span className="admin-file-name">{file.name}</span>}
                </div>
                <p className="admin-hint">
                    Картинка будет показана в карусели стилей в боте.
                </p>
            </div>

            <button
                type="button"
                className="admin-button admin-button--primary admin-button--full"
                onClick={onSubmit}
                disabled={submitting || !hasCategories || !categoryId}
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


function AdminUsersStatsBlock({
                                  items,
                                  page,
                                  pageSize,
                                  total,
                                  loading,
                                  onReload,
                                  onPrevPage,
                                  onNextPage,
                              }) {
    const hasItems = items.length > 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const humanPage = page + 1;

    return (
        <section className="admin-section admin-section--users">
            <div className="admin-section__header-row">
                <h3 className="admin-section__title">Статистика пользователей</h3>
                <button
                    type="button"
                    className="admin-button admin-button--ghost admin-button--xs"
                    onClick={onReload}
                >
                    Обновить
                </button>
            </div>

            {loading && (
                <p className="admin-section__hint">
                    Загружаю статистику пользователей…
                </p>
            )}

            {!loading && !hasItems && (
                <p className="admin-section__hint">
                    Пока нет данных по фотосессиям пользователей.
                </p>
            )}

            {!loading && hasItems && (
                <>
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th className="admin-table__th admin-table__th--user">
                                    Пользователь
                                </th>
                                <th className="admin-table__th admin-table__th--money">
                                    Потрачено
                                </th>
                                <th className="admin-table__th admin-table__th--photos">
                                    Фотосессии
                                </th>
                                <th className="admin-table__th admin-table__th--date">
                                    Последняя сессия
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {items.map((row) => {
                                const spentRub =
                                    typeof row.spent_rub === "number"
                                        ? row.spent_rub
                                        : 0;
                                const success =
                                    typeof row.photos_success === "number"
                                        ? row.photos_success
                                        : 0;
                                const failed =
                                    typeof row.photos_failed === "number"
                                        ? row.photos_failed
                                        : 0;
                                const totalPhotos = success + failed;

                                return (
                                    <tr
                                        key={row.telegram_id}
                                        className="admin-table__tr"
                                    >
                                        <td className="admin-table__td admin-table__td--user">
                                            <div className="admin-table__user">
                                                <div className="admin-table__user-main">
                                                    {row.username
                                                        ? `@${row.username}`
                                                        : "Без никнейма"}
                                                </div>
                                                <div className="admin-table__user-sub">
                                                    ID: {row.telegram_id}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="admin-table__td admin-table__td--number">
                                            {spentRub.toLocaleString("ru-RU")} ₽
                                        </td>
                                        <td className="admin-table__td">
                                            <div className="admin-table__photos">
                                                    <span className="admin-badge">
                                                        Успешных: {success}
                                                    </span>
                                                <span className="admin-badge admin-badge--muted">
                                                        Ошибок: {failed}
                                                    </span>
                                                <span className="admin-badge admin-badge--accent">
                                                        Всего: {totalPhotos}
                                                    </span>
                                            </div>
                                        </td>
                                        <td className="admin-table__td admin-table__td--date">
                                            {formatDateTime(
                                                row.last_photoshoot_at,
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>

                    <div className="admin-table-footer">
                        <div className="admin-table-footer__info">
                            Пользователей: {total}
                        </div>
                        <div className="admin-table-footer__pager">
                            <button
                                type="button"
                                className="admin-button admin-button--ghost admin-button--xs"
                                onClick={onPrevPage}
                                disabled={page <= 0}
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
                                disabled={humanPage >= totalPages}
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

function AdminsBlock({
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
                Введи Telegram ID пользователя, чтобы выдать или снять права
                админа.
            </p>

            <div className="admin-field admin-field--inline">
                <div className="admin-field__col">
                    <label className="admin-label">Telegram ID</label>
                    <input
                        type="text"
                        className="admin-input"
                        value={telegramIdInput}
                        onChange={(e) =>
                            onChangeTelegramIdInput(e.target.value)
                        }
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

            {loading && (
                <p className="admin-section__hint">
                    Загружаю список админов…
                </p>
            )}

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
                            <th className="admin-table__th admin-table__th--user">
                                Пользователь
                            </th>
                            <th className="admin-table__th admin-table__th--date">
                                Дата создания
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {admins.map((u) => (
                            <tr
                                key={u.telegram_id}
                                className="admin-table__tr"
                            >
                                <td className="admin-table__td admin-table__td--user">
                                    <div className="admin-table__user">
                                        <div className="admin-table__user-main">
                                            {u.username
                                                ? `@${u.username}`
                                                : "Без никнейма"}
                                        </div>
                                        <div className="admin-table__user-sub">
                                            ID: {u.telegram_id}
                                        </div>
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

/* ---------- Главный компонент ---------- */

function AdminView() {
    const [section, setSection] = useState("builder"); // "builder" | "stats" | "admins"
    const [mode, setMode] = useState("category"); // "category" | "style"

    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedStyleId, setSelectedStyleId] = useState(null);

    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [deletingCategoryId, setDeletingCategoryId] = useState(null);

    const [styles, setStyles] = useState([]);
    const [loadingStyles, setLoadingStyles] = useState(false);
    const [deletingStyleId, setDeletingStyleId] = useState(null);

    const [catTitle, setCatTitle] = useState("");
    const [catDescription, setCatDescription] = useState("");
    const [catGender, setCatGender] = useState("female");
    const [catFile, setCatFile] = useState(null);

    const [styleTitle, setStyleTitle] = useState("");
    const [styleDescription, setStyleDescription] = useState("");
    const [stylePrompt, setStylePrompt] = useState("");
    const [styleCategoryId, setStyleCategoryId] = useState(null);
    const [styleFile, setStyleFile] = useState(null);


    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [statsItems, setStatsItems] = useState([]);
    const [statsPage, setStatsPage] = useState(0);
    const [statsPageSize] = useState(20);
    const [statsTotal, setStatsTotal] = useState(0);
    const [loadingStats, setLoadingStats] = useState(false);

    const [admins, setAdmins] = useState([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);
    const [adminTelegramIdInput, setAdminTelegramIdInput] = useState("");
    const [adminSubmitting, setAdminSubmitting] = useState(false);

    useEffect(() => {
        loadCategories();
        loadStyles();
        loadUserStats();
        loadAdmins();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadCategories() {
        try {
            setLoadingCategories(true);
            setError("");
            const data = await adminGetCategories();
            setCategories(data || []);

            if (data && data.length > 0 && styleCategoryId === null) {
                setStyleCategoryId(data[0].id);
            }
        } catch (e) {
            setError(String(e.message || e));
        } finally {
            setLoadingCategories(false);
        }
    }

    async function loadStyles() {
        try {
            setLoadingStyles(true);
            setError("");
            const data = await adminGetStyles();
            setStyles(data || []);
        } catch (e) {
            setError(String(e.message || e));
        } finally {
            setLoadingStyles(false);
        }
    }

    async function loadUserStats(pageOverride) {
        try {
            setLoadingStats(true);
            setError("");
            const data = await adminGetUserStats();

            const itemsArray = Array.isArray(data) ? data : [];
            setStatsItems(itemsArray);
            setStatsTotal(itemsArray.length);
            setStatsPage(pageOverride ?? 0);
        } catch (e) {
            setError(String(e.message || e));
        } finally {
            setLoadingStats(false);
        }
    }

    async function loadAdmins() {
        try {
            setLoadingAdmins(true);
            setError("");
            const data = await adminGetAdmins();
            setAdmins(data || []);
        } catch (e) {
            setError(String(e.message || e));
        } finally {
            setLoadingAdmins(false);
        }
    }

    function handleResetCategorySelection() {
        setSelectedCategoryId(null);
        setCatTitle("");
        setCatDescription("");
        setCatGender("female");
        setCatFile(null);
    }

    function handleSelectCategory(category) {
        setSelectedCategoryId(category.id);
        setCatTitle(category.title || "");
        setCatDescription(category.description || "");
        setCatGender(category.gender || "female");
        setCatFile(null);
        setStyleCategoryId(category.id);
        setSelectedStyleId(null);
    }

    async function handleSubmitCategory() {
        if (!catTitle.trim()) {
            setError("Заполни название категории.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            if (selectedCategoryId !== null) {
                const updated = await adminUpdateCategory({
                    id: selectedCategoryId,
                    title: catTitle.trim(),
                    description: catDescription.trim(),
                    gender: catGender,
                    file: catFile,
                });

                setCategories((prev) =>
                    prev.map((c) => (c.id === updated.id ? updated : c)),
                );
                setSuccess("Категория обновлена");
                setCatFile(null);
            } else {
                const created = await adminCreateCategory({
                    title: catTitle.trim(),
                    description: catDescription.trim(),
                    gender: catGender,
                    file: catFile,
                });

                setCategories((prev) => [...prev, created]);
                if (styleCategoryId === null) {
                    setStyleCategoryId(created.id);
                }

                setCatTitle("");
                setCatDescription("");
                setCatFile(null);
                setSuccess("Категория создана");
            }
        } catch (e) {
            setError(String(e.message || e));
        } finally {
            setSubmitting(false);
            setTimeout(() => setSuccess(""), 2200);
        }
    }


    async function handleDeleteCategory(id) {
        if (!window.confirm("Удалить категорию и все её стили?")) {
            return;
        }

        try {
            setDeletingCategoryId(id);
            setError("");
            await adminDeleteCategory(id);
            setCategories((prev) => prev.filter((c) => c.id !== id));
            setStyles((prev) => prev.filter((s) => s.category_id !== id));
            if (styleCategoryId === id) {
                setStyleCategoryId(null);
            }
            if (selectedCategoryId === id) {
                handleResetCategorySelection();
            }
        } catch (e) {
            setError(String(e.message || e));
        } finally {
            setDeletingCategoryId(null);
        }
    }


    function handleResetStyleSelection() {
        setSelectedStyleId(null);
        setStyleTitle("");
        setStyleDescription("");
        setStylePrompt("");
        setStyleFile(null);
    }

    function handleSelectStyle(style) {
        setSelectedStyleId(style.id);
        setStyleTitle(style.title || "");
        setStyleDescription(style.description || "");
        setStylePrompt(style.prompt || "");
        setStyleCategoryId(style.category_id || null);
        setStyleFile(null);
    }

    async function handleSubmitStyle() {
        if (!styleTitle.trim()) {
            setError("Заполни название стиля.");
            return;
        }
        if (!styleCategoryId) {
            setError("Выбери категорию для стиля.");
            return;
        }
        if (!stylePrompt.trim()) {
            setError("Заполни промпт для генерации стиля.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            if (selectedStyleId !== null) {
                const updated = await adminUpdateStyle({
                    id: selectedStyleId,
                    title: styleTitle.trim(),
                    description: styleDescription.trim(),
                    prompt: stylePrompt.trim(),
                    categoryId: styleCategoryId,
                    file: styleFile,
                });

                setStyles((prev) =>
                    prev.map((s) => (s.id === updated.id ? updated : s)),
                );
                setSuccess("Стиль обновлён");
                setStyleFile(null);
            } else {
                const created = await adminCreateStyle({
                    title: styleTitle.trim(),
                    description: styleDescription.trim(),
                    prompt: stylePrompt.trim(),
                    categoryId: styleCategoryId,
                    file: styleFile,
                });

                setStyles((prev) => [...prev, created]);
                setStyleTitle("");
                setStyleDescription("");
                setStylePrompt("");
                setStyleFile(null);
                setSuccess("Стиль создан");
            }
        } catch (e) {
            setError(String(e.message || e));
        } finally {
            setSubmitting(false);
            setTimeout(() => setSuccess(""), 2200);
        }
    }




    async function handleDeleteStyle(id) {
        if (!window.confirm("Удалить этот стиль?")) {
            return;
        }

        try {
            setDeletingStyleId(id);
            setError("");
            await adminDeleteStyle(id);
            setStyles((prev) => prev.filter((s) => s.id !== id));
            if (selectedStyleId === id) {
                handleResetStyleSelection();
            }
        } catch (e) {
            setError(String(e.message || e));
        } finally {
            setDeletingStyleId(null);
        }
    }


    function handleStatsPrevPage() {
        if (statsPage <= 0 || loadingStats) {
            return;
        }
        loadUserStats(statsPage - 1);
    }

    function handleStatsNextPage() {
        if (loadingStats) {
            return;
        }
        const totalPages = Math.max(1, Math.ceil(statsTotal / statsPageSize));
        if (statsPage + 1 >= totalPages) {
            return;
        }
        loadUserStats(statsPage + 1);
    }

    async function handleSetAdmin() {
        const value = adminTelegramIdInput.trim();
        if (!value) {
            return;
        }

        const telegramId = Number(value);
        if (!Number.isFinite(telegramId) || telegramId <= 0) {
            setError("Telegram ID должен быть положительным числом.");
            return;
        }

        try {
            setAdminSubmitting(true);
            setError("");
            setSuccess("");
            await adminSetAdminFlag({ telegramId, isAdmin: true });
            setSuccess("Права админа выданы.");
            await loadAdmins();
        } catch (e) {
            setError(String(e.message || e));
        } finally {
            setAdminSubmitting(false);
            setTimeout(() => setSuccess(""), 2200);
        }
    }

    async function handleUnsetAdmin() {
        const value = adminTelegramIdInput.trim();
        if (!value) {
            return;
        }

        const telegramId = Number(value);
        if (!Number.isFinite(telegramId) || telegramId <= 0) {
            setError("Telegram ID должен быть положительным числом.");
            return;
        }

        try {
            setAdminSubmitting(true);
            setError("");
            setSuccess("");
            await adminSetAdminFlag({ telegramId, isAdmin: false });
            setSuccess("Права админа сняты.");
            await loadAdmins();
        } catch (e) {
            setError(String(e.message || e));
        } finally {
            setAdminSubmitting(false);
            setTimeout(() => setSuccess(""), 2200);
        }
    }

    const stylesForSelectedCategory = useMemo(() => {
        if (!styleCategoryId) {
            return [];
        }
        return styles.filter((s) => s.category_id === styleCategoryId);
    }, [styles, styleCategoryId]);

    const hasCategorySelected = !!styleCategoryId;

    return (
        <div className="admin-page">
            <div className="admin-shell">
                <header className="admin-header">
                    <div>
                        <h1 className="admin-header__title">Админка</h1>
                        <p className="admin-header__subtitle">
                            Управляй стилями, статистикой и правами админов.
                        </p>
                    </div>
                </header>

                <div className="admin-main-tabs">
                    <button
                        type="button"
                        className={
                            section === "builder"
                                ? "admin-main-tabs__btn admin-main-tabs__btn--active"
                                : "admin-main-tabs__btn"
                        }
                        onClick={() => setSection("builder")}
                    >
                        Создание категорий и стилей
                    </button>
                    <button
                        type="button"
                        className={
                            section === "stats"
                                ? "admin-main-tabs__btn admin-main-tabs__btn--active"
                                : "admin-main-tabs__btn"
                        }
                        onClick={() => setSection("stats")}
                    >
                        Статистика
                    </button>
                    <button
                        type="button"
                        className={
                            section === "admins"
                                ? "admin-main-tabs__btn admin-main-tabs__btn--active"
                                : "admin-main-tabs__btn"
                        }
                        onClick={() => setSection("admins")}
                    >
                        Админы
                    </button>
                </div>

                {section === "builder" && (
                    <div className="admin-box">
                        <div className="admin-mode-tabs">
                            <button
                                type="button"
                                className={
                                    mode === "category"
                                        ? "admin-mode-tabs__btn admin-mode-tabs__btn--active"
                                        : "admin-mode-tabs__btn"
                                }
                                onClick={() => setMode("category")}
                            >
                                Категория
                            </button>
                            <button
                                type="button"
                                className={
                                    mode === "style"
                                        ? "admin-mode-tabs__btn admin-mode-tabs__btn--active"
                                        : "admin-mode-tabs__btn"
                                }
                                onClick={() => setMode("style")}
                            >
                                Стиль
                            </button>
                        </div>

                        {(error ||
                            success ||
                            loadingCategories ||
                            submitting) && (
                            <div className="admin-status">
                                {error && (
                                    <div className="admin-status__item admin-status__item--error">
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="admin-status__item admin-status__item--success">
                                        {success}
                                    </div>
                                )}
                                {loadingCategories && !submitting && (
                                    <div className="admin-status__item admin-status__item--info">
                                        Загружаю категории…
                                    </div>
                                )}
                                {submitting && (
                                    <div className="admin-status__item admin-status__item--info">
                                        Сохраняю изменения…
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="admin-forms">
                            <section className="admin-section">
                                {mode === "category" && (
                                    <CategoryForm
                                        title={catTitle}
                                        description={catDescription}
                                        gender={catGender}
                                        file={catFile}
                                        onChangeTitle={setCatTitle}
                                        onChangeDescription={setCatDescription}
                                        onChangeGender={setCatGender}
                                        onChangeFile={setCatFile}
                                        onSubmit={handleSubmitCategory}
                                        submitting={submitting}
                                        isEdit={selectedCategoryId !== null}
                                        onResetSelection={handleResetCategorySelection}
                                    />
                                )}


                                {mode === "style" && (
                                    <StyleForm
                                        title={styleTitle}
                                        description={styleDescription}
                                        prompt={stylePrompt}
                                        categoryId={styleCategoryId}
                                        file={styleFile}
                                        categories={categories}
                                        onChangeTitle={setStyleTitle}
                                        onChangeDescription={setStyleDescription}
                                        onChangePrompt={setStylePrompt}
                                        onChangeCategoryId={setStyleCategoryId}
                                        onChangeFile={setStyleFile}
                                        onSubmit={handleSubmitStyle}
                                        submitting={submitting}
                                        isEdit={selectedStyleId !== null}
                                        onResetSelection={handleResetStyleSelection}
                                    />
                                )}


                            </section>

                            {mode === "category" && (
                                <AdminCategoriesBlock
                                    categories={categories}
                                    onReload={loadCategories}
                                    onDeleteCategory={handleDeleteCategory}
                                    deletingId={deletingCategoryId}
                                    selectedCategoryId={selectedCategoryId}
                                    onSelectCategory={handleSelectCategory}
                                />
                            )}


                            {mode === "style" && (
                                <AdminStylesBlock
                                    styles={stylesForSelectedCategory}
                                    loading={loadingStyles}
                                    onReload={loadStyles}
                                    onDeleteStyle={handleDeleteStyle}
                                    deletingId={deletingStyleId}
                                    hasCategorySelected={hasCategorySelected}
                                    selectedStyleId={selectedStyleId}
                                    onSelectStyle={handleSelectStyle}
                                />
                            )}

                        </div>
                    </div>
                )}

                {section === "stats" && (
                    <div className="admin-box admin-box--stats">
                        {(error || success) && (
                            <div className="admin-status">
                                {error && (
                                    <div className="admin-status__item admin-status__item--error">
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="admin-status__item admin-status__item--success">
                                        {success}
                                    </div>
                                )}
                            </div>
                        )}

                        <AdminUsersStatsBlock
                            items={statsItems}
                            page={statsPage}
                            pageSize={statsPageSize}
                            total={statsTotal}
                            loading={loadingStats}
                            onReload={() => loadUserStats(statsPage)}
                            onPrevPage={handleStatsPrevPage}
                            onNextPage={handleStatsNextPage}
                        />
                    </div>
                )}

                {section === "admins" && (
                    <div className="admin-box admin-box--stats">
                        {(error || success) && (
                            <div className="admin-status">
                                {error && (
                                    <div className="admin-status__item admin-status__item--error">
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="admin-status__item admin-status__item--success">
                                        {success}
                                    </div>
                                )}
                            </div>
                        )}

                        <AdminsBlock
                            admins={admins}
                            loading={loadingAdmins}
                            onReload={loadAdmins}
                            telegramIdInput={adminTelegramIdInput}
                            onChangeTelegramIdInput={setAdminTelegramIdInput}
                            onSetAdmin={handleSetAdmin}
                            onUnsetAdmin={handleUnsetAdmin}
                            submitting={adminSubmitting}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminView;
