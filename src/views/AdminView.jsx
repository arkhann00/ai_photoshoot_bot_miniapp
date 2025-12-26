import React, { useEffect, useState, useMemo } from "react";
import "./AdminView.css";

import {
    adminGetCategories,
    adminUpdateCategory,
    adminCreateCategory,
    adminDeleteCategory,
    adminGetStyles,
    adminCreateStyle,
    adminUpdateStyle,
    adminDeleteStyle,
    adminGetUserStats,
    adminClearUserStats,
    adminGetAdmins,
    adminSetAdminFlag,
    adminGetReferrals,
    adminSetReferralFlag,
    adminGetPromoCodes,
    adminCreatePromoCode,
    adminDeletePromoCode,
    adminSetPromoCodeActive,
    adminGetAllUsers,
    adminClearUserBalance,
    adminSearchUsers

} from "../api.js";

import { formatDateTime } from "../utils.js"

import {
    CategoryForm,
    StyleForm,
    AdminCategoriesBlock,
    AdminStylesBlock,
} from "./components/BuilderBlocks";

import { AdminUsersStatsBlock } from "./components/StatsBlock";
import { AdminsBlock } from "./components/AdminsBlock";
import { ReferralsBlock } from "./components/ReferralsBlock";
import { PromoCodesBlock } from "./components/PromoCodesBlock.jsx";
import { PromoCodeForm } from "./components/PromoCodeForm.jsx";
import { UsersAllBlock } from "./components/UsersAllBlock";

/* ---------- Главный компонент ---------- */

function AdminView() {
    const [section, setSection] = useState("builder"); // "builder" | "stats" | "referrals" | "admins"
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
    const [styleIsNew, setStyleIsNew] = useState(false);
    const [styleFile, setStyleFile] = useState(null);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [statsItems, setStatsItems] = useState([]);
    const [statsPage, setStatsPage] = useState(0);
    const [statsPageSize] = useState(20);
    const [statsTotal, setStatsTotal] = useState(0);
    const [loadingStats, setLoadingStats] = useState(false);
    const [clearingStats, setClearingStats] = useState(false);

    const [admins, setAdmins] = useState([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);
    const [adminTelegramIdInput, setAdminTelegramIdInput] = useState("");
    const [adminSubmitting, setAdminSubmitting] = useState(false);

    const [referrals, setReferrals] = useState([]);
    const [loadingReferrals, setLoadingReferrals] = useState(false);
    const [referralTelegramIdInput, setReferralTelegramIdInput] = useState("");
    const [referralSubmitting, setReferralSubmitting] = useState(false);

    const [promoCodes, setPromoCodes] = useState([]);
    const [loadingPromoCodes, setLoadingPromoCodes] = useState(false);
    const [promoSubmitting, setPromoSubmitting] = useState(false);
    const [deletingPromoId, setDeletingPromoId] = useState(null);

    const [selectedPromoId, setSelectedPromoId] = useState(null); // ✅ int id
    const [promoCodeValue, setPromoCodeValue] = useState("");
    const [promoGenerations, setPromoGenerations] = useState(1);
    const [promoIsActive, setPromoIsActive] = useState(true);

    const [allUsers, setAllUsers] = useState([]);
    const [loadingAllUsers, setLoadingAllUsers] = useState(false);
    const [usersQuery, setUsersQuery] = useState("");
    const [clearingBalanceTelegramId, setClearingBalanceTelegramId] = useState(null);

    useEffect(() => {
  loadCategories();
  loadStyles();
  loadUserStats();
  loadAdmins();
  loadReferrals();
  loadPromoCodes();
  loadAllUsers("");
}, []);

    useEffect(() => {
  const t = setTimeout(() => {
    loadAllUsers(usersQuery);
  }, 250);

  return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [usersQuery]);

    async function loadAllUsers(qOverride) {
  const q = String(qOverride ?? usersQuery ?? "").trim();

  try {
    setLoadingAllUsers(true);
    setError("");

    const data = q
      ? await adminSearchUsers({ q, limit: 50 })
      : await adminGetAllUsers();

    setAllUsers(Array.isArray(data) ? data : []);
  } catch (e) {
    setError(String(e.message || e));
  } finally {
    setLoadingAllUsers(false);
  }
}
async function handleClearUserBalance(userRow) {
  const telegramId = Number(userRow?.telegram_id);
  if (!Number.isFinite(telegramId) || telegramId <= 0) return;

  const label = userRow?.username ? `@${userRow.username}` : `ID ${telegramId}`;
  if (!window.confirm(`Сбросить баланс пользователю ${label}?`)) return;

  try {
    setClearingBalanceTelegramId(telegramId);
    setError("");
    setSuccess("");

    const updated = await adminClearUserBalance({ telegramId }); // AdminUserResponse

    setAllUsers((prev) =>
      prev.map((u) =>
        Number(u.telegram_id) === telegramId ? { ...u, ...updated } : u
      )
    );

    setSuccess("Баланс сброшен.");
  } catch (e) {
    setError(String(e.message || e));
  } finally {
    setClearingBalanceTelegramId(null);
    setTimeout(() => setSuccess(""), 2200);
  }
}

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

    async function loadPromoCodes() {
        try {
            setLoadingPromoCodes(true);
            setError("");
            const data = await adminGetPromoCodes();
            setPromoCodes(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(String(e.message || e));
        } finally {
            setLoadingPromoCodes(false);
        }
    }

    function resetPromoSelection() {
        setSelectedPromoId(null);
        setPromoCodeValue("");
        setPromoGenerations(1);
        setPromoIsActive(true);
    }

    function selectPromo(p) {
        setSelectedPromoId(Number(p.id));
        setPromoCodeValue(String(p.code || ""));
        setPromoGenerations(Number(p.generations || 1));
        setPromoIsActive(Boolean(p.is_active));
    }

    async function handleSubmitPromoCode() {
        const code = String(promoCodeValue || "").trim();
        const gens = Number(promoGenerations);

        if (!selectedPromoId) {
            // CREATE
            if (!code) {
                setError("Укажи код промокода.");
                return;
            }
            if (!Number.isFinite(gens) || gens <= 0) {
                setError("Генераций должно быть > 0.");
                return;
            }

            try {
                setPromoSubmitting(true);
                setError("");
                setSuccess("");

                const created = await adminCreatePromoCode({
                    code,
                    generations: gens,
                    isActive: promoIsActive,
                });

                setPromoCodes((prev) => [created, ...prev]);
                setSuccess("Промокод создан");
                resetPromoSelection();
            } catch (e) {
                setError(String(e.message || e));
            } finally {
                setPromoSubmitting(false);
                setTimeout(() => setSuccess(""), 2200);
            }
            return;
        }

        // EDIT: бэк умеет только active toggle
        try {
            setPromoSubmitting(true);
            setError("");
            setSuccess("");

            const updated = await adminSetPromoCodeActive({
                promoId: selectedPromoId,
                isActive: promoIsActive,
            });

            setPromoCodes((prev) =>
                prev.map((p) => (Number(p.id) === Number(updated.id) ? updated : p))
            );

            setSuccess("Статус промокода обновлён");
        } catch (e) {
            setError(String(e.message || e));
        } finally {
            setPromoSubmitting(false);
            setTimeout(() => setSuccess(""), 2200);
        }
    }

    async function handleDeletePromoCode(promoId) {
        const id = Number(promoId);
        if (!Number.isFinite(id) || id <= 0) return;

        if (!window.confirm("Удалить промокод?")) return;

        try {
            setDeletingPromoId(id);
            setError("");

            await adminDeletePromoCode({ promoId: id });

            setPromoCodes((prev) => prev.filter((p) => Number(p.id) !== id));
            if (selectedPromoId === id) resetPromoSelection();
        } catch (e) {
            setError(String(e.message || e));
        } finally {
            setDeletingPromoId(null);
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

    async function loadReferrals() {
        try {
            setLoadingReferrals(true);
            setError("");
            const data = await adminGetReferrals();
            setReferrals(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(String(e.message || e));
        } finally {
            setLoadingReferrals(false);
        }
    }

    async function handleClearStats() {
        if (clearingStats || loadingStats) return;

        const ok1 = window.confirm(
            "Внимание!\n\nЭто действие необратимо: будет очищена статистика пользователей.\nПродолжить?"
        );
        if (!ok1) return;

        const phrase = window.prompt("Для подтверждения введи слово: ОЧИСТИТЬ");
        if (phrase !== "ОЧИСТИТЬ") {
            setError("Очистка отменена: неверное подтверждение.");
            return;
        }

        try {
            setClearingStats(true);
            setError("");
            setSuccess("");

            await adminClearUserStats({ clearLogs: true });

            setSuccess("Статистика очищена.");
            await loadUserStats(0);
        } catch (e) {
            setError(String(e.message || e));
        } finally {
            setClearingStats(false);
            setTimeout(() => setSuccess(""), 2200);
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

                setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
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
                if (styleCategoryId === null) setStyleCategoryId(created.id);

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
        if (!window.confirm("Удалить категорию и все её стили?")) return;

        try {
            setDeletingCategoryId(id);
            setError("");
            await adminDeleteCategory(id);
            setCategories((prev) => prev.filter((c) => c.id !== id));
            setStyles((prev) => prev.filter((s) => s.category_id !== id));
            if (styleCategoryId === id) setStyleCategoryId(null);
            if (selectedCategoryId === id) handleResetCategorySelection();
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
        setStyleCategoryId(null);
        setStyleIsNew(false);
        setStyleFile(null);
    }

    function handleSelectStyle(style) {
        setSelectedStyleId(style.id);
        setStyleTitle(style.title || "");
        setStyleDescription(style.description || "");
        setStylePrompt(style.prompt || "");
        setStyleCategoryId(style.category_id || null);
        setStyleIsNew(Boolean(style.is_new));
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
                    isNew: styleIsNew,
                    file: styleFile,
                });

                setStyles((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
                setSuccess("Стиль обновлён");
                setStyleFile(null);
            } else {
                const created = await adminCreateStyle({
                    title: styleTitle.trim(),
                    description: styleDescription.trim(),
                    prompt: stylePrompt.trim(),
                    categoryId: styleCategoryId,
                    isNew: styleIsNew,
                    file: styleFile,
                });

                setStyles((prev) => [...prev, created]);
                setStyleTitle("");
                setStyleDescription("");
                setStylePrompt("");
                setStyleIsNew(false);
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
        if (!window.confirm("Удалить этот стиль?")) return;

        try {
            setDeletingStyleId(id);
            setError("");
            await adminDeleteStyle(id);
            setStyles((prev) => prev.filter((s) => s.id !== id));
            if (selectedStyleId === id) handleResetStyleSelection();
        } catch (e) {
            setError(String(e.message || e));
        } finally {
            setDeletingStyleId(null);
        }
    }

    function handleStatsPrevPage() {
        if (statsPage <= 0 || loadingStats) return;
        loadUserStats(statsPage - 1);
    }

    function handleStatsNextPage() {
        if (loadingStats) return;
        const totalPages = Math.max(1, Math.ceil(statsTotal / statsPageSize));
        if (statsPage + 1 >= totalPages) return;
        loadUserStats(statsPage + 1);
    }

    async function handleSetAdmin() {
        const value = adminTelegramIdInput.trim();
        if (!value) return;

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
        if (!value) return;

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

    async function handleAddReferral() {
        const idValue = referralTelegramIdInput.trim();
        if (!idValue) {
            setError("Укажи Telegram ID реферала.");
            return;
        }

        const num = Number(idValue);
        if (!Number.isFinite(num) || num <= 0) {
            setError("Telegram ID должен быть положительным числом.");
            return;
        }

        const telegramId = num;

        try {
            setReferralSubmitting(true);
            setError("");
            setSuccess("");
            await adminSetReferralFlag({ telegramId, isReferral: true });
            setSuccess("Пользователь добавлен в рефералы.");
            await loadReferrals();
        } catch (e) {
            setError(String(e.message || e));
        } finally {
            setReferralSubmitting(false);
            setTimeout(() => setSuccess(""), 2200);
        }
    }

    async function handleRemoveReferral() {
        const idValue = referralTelegramIdInput.trim();
        if (!idValue) {
            setError("Укажи Telegram ID реферала.");
            return;
        }

        const num = Number(idValue);
        if (!Number.isFinite(num) || num <= 0) {
            setError("Telegram ID должен быть положительным числом.");
            return;
        }

        const telegramId = num;

        try {
            setReferralSubmitting(true);
            setError("");
            setSuccess("");
            await adminSetReferralFlag({ telegramId, isReferral: false });
            setSuccess("Пользователь убран из рефералов.");
            await loadReferrals();
        } catch (e) {
            setError(String(e.message || e));
        } finally {
            setReferralSubmitting(false);
            setTimeout(() => setSuccess(""), 2200);
        }
    }

    const stylesForSelectedCategory = useMemo(() => {
        if (!styleCategoryId) return [];
        return styles.filter((s) => s.category_id === styleCategoryId);
    }, [styles, styleCategoryId]);

    const hasCategorySelected = !!styleCategoryId;

    return (
        <div className="admin-page">
            <div className="admin-shell">
                <header className="admin-header">
                    <div>
                        <h1 className="admin-header__title">Админка</h1>
                        <p className="admin-header__subtitle">Управляй стилями, статистикой и правами админов.</p>
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
                            section === "users"
                            ? "admin-main-tabs__btn admin-main-tabs__btn--active"
                            : "admin-main-tabs__btn"
                        }
                        onClick={() => setSection("users")}
                        >
                        Пользователи
                </button>
                    <button
                        type="button"
                        className={
                            section === "referrals"
                                ? "admin-main-tabs__btn admin-main-tabs__btn--active"
                                : "admin-main-tabs__btn"
                        }
                        onClick={() => setSection("referrals")}
                    >
                        Рефералы
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

                    <button
                        type="button"
                        className={
                            section === "promocodes"
                                ? "admin-main-tabs__btn admin-main-tabs__btn--active"
                                : "admin-main-tabs__btn"
                        }
                        onClick={() => setSection("promocodes")}
                    >
                        Промокоды
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

                        {(error || success || loadingCategories || submitting) && (
                            <div className="admin-status">
                                {error && <div className="admin-status__item admin-status__item--error">{error}</div>}
                                {success && (
                                    <div className="admin-status__item admin-status__item--success">{success}</div>
                                )}
                                {loadingCategories && !submitting && (
                                    <div className="admin-status__item admin-status__item--info">Загружаю категории…</div>
                                )}
                                {submitting && (
                                    <div className="admin-status__item admin-status__item--info">Сохраняю изменения…</div>
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
                                        isNew={styleIsNew}
                                        file={styleFile}
                                        categories={categories}
                                        onChangeTitle={setStyleTitle}
                                        onChangeDescription={setStyleDescription}
                                        onChangePrompt={setStylePrompt}
                                        onChangeCategoryId={setStyleCategoryId}
                                        onChangeIsNew={setStyleIsNew}
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

                {section === "users" && (
  <div className="admin-box admin-box--stats">
    {(error || success) && (
      <div className="admin-status">
        {error && <div className="admin-status__item admin-status__item--error">{error}</div>}
        {success && <div className="admin-status__item admin-status__item--success">{success}</div>}
      </div>
    )}

    <UsersAllBlock
      users={allUsers}
      loading={loadingAllUsers}
      onReload={() => loadAllUsers(usersQuery)}
      query={usersQuery}
      onChangeQuery={setUsersQuery}
      onClearBalance={handleClearUserBalance}
      clearingTelegramId={clearingBalanceTelegramId}
      formatDateTime={formatDateTime}
    />
  </div>
)}

                {section === "stats" && (
                    <div className="admin-box admin-box--stats">
                        {(error || success) && (
                            <div className="admin-status">
                                {error && <div className="admin-status__item admin-status__item--error">{error}</div>}
                                {success && (
                                    <div className="admin-status__item admin-status__item--success">{success}</div>
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
                            onClear={handleClearStats}
                            clearing={clearingStats}
                        />
                    </div>
                )}

                {section === "referrals" && (
                    <div className="admin-box admin-box--stats">
                        {(error || success) && (
                            <div className="admin-status">
                                {error && <div className="admin-status__item admin-status__item--error">{error}</div>}
                                {success && (
                                    <div className="admin-status__item admin-status__item--success">{success}</div>
                                )}
                            </div>
                        )}

                        <ReferralsBlock
                            referrals={referrals}
                            loading={loadingReferrals}
                            onReload={loadReferrals}
                            telegramIdInput={referralTelegramIdInput}
                            onChangeTelegramIdInput={setReferralTelegramIdInput}
                            onAddReferral={handleAddReferral}
                            onRemoveReferral={handleRemoveReferral}
                            submitting={referralSubmitting}
                        />
                    </div>
                )}

                {section === "admins" && (
                    <div className="admin-box admin-box--stats">
                        {(error || success) && (
                            <div className="admin-status">
                                {error && <div className="admin-status__item admin-status__item--error">{error}</div>}
                                {success && (
                                    <div className="admin-status__item admin-status__item--success">{success}</div>
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

                {section === "promocodes" && (
                    <div className="admin-box admin-box--stats">
                        {(error || success || loadingPromoCodes || promoSubmitting) && (
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
                                {loadingPromoCodes && !promoSubmitting && (
                                    <div className="admin-status__item admin-status__item--info">
                                        Загружаю промокоды…
                                    </div>
                                )}
                                {promoSubmitting && (
                                    <div className="admin-status__item admin-status__item--info">
                                        Сохраняю промокод…
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="admin-forms">
                            <section className="admin-section">
                                <PromoCodeForm
                                    code={promoCodeValue}
                                    generations={promoGenerations}
                                    isActive={promoIsActive}
                                    onChangeCode={setPromoCodeValue}
                                    onChangeGenerations={setPromoGenerations}
                                    onChangeIsActive={setPromoIsActive}
                                    onSubmit={handleSubmitPromoCode}
                                    submitting={promoSubmitting}
                                    isEdit={Boolean(selectedPromoId)}
                                    onResetSelection={resetPromoSelection}
                                />
                            </section>

                            <PromoCodesBlock
                                promoCodes={promoCodes}
                                loading={loadingPromoCodes}
                                onReload={loadPromoCodes}
                                onDeletePromoCode={handleDeletePromoCode}
                                deletingId={deletingPromoId}
                                selectedId={selectedPromoId}
                                onSelectPromoCode={selectPromo}
                                formatDateTime={formatDateTime}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminView;