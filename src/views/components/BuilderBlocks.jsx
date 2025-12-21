import React, { useMemo } from "react";

/* ---------- UI блоки: builder (категории/стили) ---------- */

function CategoryChip({ category, onDelete, onSelect, isActive }) {
    const labelGender = category.gender === "female" ? "Ж" : "М";

    function handleClick() {
        onSelect(category);
    }

    function handleDeleteClick(event) {
        event.stopPropagation();
        onDelete(category.id);
    }

    const className = isActive ? "admin-chip admin-chip--active" : "admin-chip";

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

export function AdminCategoriesBlock({
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
                <p className="admin-section__hint">Категорий пока нет. Создай первую выше.</p>
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
                    {deletingId !== null && <span className="admin-chips-row__status">Удаляем…</span>}
                </div>
            )}
        </section>
    );
}

export function AdminStylesBlock({
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

            {hasCategorySelected && loading && <p className="admin-section__hint">Загружаю стили…</p>}

            {hasCategorySelected && !loading && styles.length === 0 && (
                <p className="admin-section__hint">В выбранной категории пока нет стилей.</p>
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
                            <div key={style.id} className={itemClassName} onClick={handleClick}>
                                <div className="admin-style-item__row">
                                    <div className="admin-style-item__main">
                                        <div className="admin-style-item__title">{style.title}</div>
                                        {style.description && (
                                            <div className="admin-style-item__description">{style.description}</div>
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
                                    <span className="admin-style-item__badge">#{style.id}</span>
                                    <span className="admin-style-item__badge">
                    {style.gender === "female" ? "Женская категория" : "Мужская категория"}
                  </span>
                                    {style.is_new && (
                                        <span className="admin-style-item__badge admin-style-item__badge--accent">
                      NEW
                    </span>
                                    )}
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

export function CategoryForm({
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
                Категория объединяет несколько стилей. Например: «Vogue», «Dubai», «Аниме».
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
                <select className="admin-select" value={gender} onChange={(e) => onChangeGender(e.target.value)}>
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
                            onChangeFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)
                        }
                    />
                    {file && <span className="admin-file-name">{file.name}</span>}
                </div>
                <p className="admin-hint">
                    JPEG / PNG / WEBP, до 5&nbsp;МБ. Показывается в боте при выборе категории.
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

export function StyleForm({
                              title,
                              description,
                              prompt,
                              categoryId,
                              isNew,
                              file,
                              categories,
                              onChangeTitle,
                              onChangeDescription,
                              onChangePrompt,
                              onChangeCategoryId,
                              onChangeIsNew,
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
                label: cat.gender === "female" ? `${cat.title} · Ж` : `${cat.title} · М`,
            })),
        [categories]
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
            <p className="admin-box__hint">Стиль относится к выбранной категории и наследует её пол.</p>

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
                    Этот текст используется только для AI-генерации, пользователю не показывается.
                </p>
            </div>

            <div className="admin-field">
                <label className="admin-label">Категория стиля</label>
                {!hasCategories && <p className="admin-hint">Сначала создай хотя бы одну категорию.</p>}
                {hasCategories && (
                    <select
                        className="admin-select"
                        value={categoryId || ""}
                        onChange={(e) => onChangeCategoryId(e.target.value ? Number(e.target.value) : null)}
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
                <label className="admin-label">Пометка NEW</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input type="checkbox" checked={Boolean(isNew)} onChange={(e) => onChangeIsNew(e.target.checked)} />
                    <span>Показывать стиль как новый</span>
                </div>
                <p className="admin-hint">Если включено — фронт/бот смогут выделять стиль бейджем NEW.</p>
            </div>

            <div className="admin-field">
                <label className="admin-label">Картинка примера</label>
                <div className="admin-file-row">
                    <input
                        type="file"
                        accept="image/*"
                        className="admin-file-input"
                        onChange={(e) =>
                            onChangeFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)
                        }
                    />
                    {file && <span className="admin-file-name">{file.name}</span>}
                </div>
                <p className="admin-hint">Картинка будет показана в карусели стилей в боте.</p>
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