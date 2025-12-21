import { API_BASE } from "./config";

/* ---------- API helpers ---------- */

export async function adminGetCategories() {
    const res = await fetch(`${API_BASE}/admin/style-categories`, {
        credentials: "include",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ошибка загрузки категорий: ${res.status} ${text}`);
    }

    return res.json();
}

export async function adminUpdateCategory({ id, title, description, gender, file }) {
    const form = new FormData();

    if (title !== undefined && title !== null) form.append("title", title);
    if (description !== undefined && description !== null) form.append("description", description);
    if (gender !== undefined && gender !== null) form.append("gender", gender);
    if (file) form.append("image", file);

    const res = await fetch(`${API_BASE}/admin/style-categories/${id}`, {
        method: "PUT",
        body: form,
        credentials: "include",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ошибка обновления категории: ${res.status} ${text}`);
    }

    return res.json();
}

export async function adminCreateCategory({ title, description, gender, file }) {
    const form = new FormData();
    form.append("title", title);
    form.append("description", description);
    form.append("gender", gender);
    if (file) form.append("image", file);

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

export async function adminDeleteCategory(categoryId) {
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

export async function adminGetStyles() {
    const res = await fetch(`${API_BASE}/admin/styles`, {
        credentials: "include",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ошибка загрузки стилей: ${res.status} ${text}`);
    }

    return res.json();
}

export async function adminCreateStyle({ title, description, prompt, categoryId, isNew, file }) {
    const form = new FormData();
    form.append("title", title);
    form.append("description", description);
    form.append("prompt", prompt);
    form.append("category_id", String(categoryId));
    form.append("is_new", String(Boolean(isNew)));

    if (file) form.append("image", file);

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

export async function adminUpdateStyle({ id, title, description, prompt, categoryId, isNew, file }) {
    const form = new FormData();

    if (title !== undefined && title !== null) form.append("title", title);
    if (description !== undefined && description !== null) form.append("description", description);
    if (prompt !== undefined && prompt !== null) form.append("prompt", prompt);
    if (categoryId !== undefined && categoryId !== null) form.append("category_id", String(categoryId));
    if (isNew !== undefined && isNew !== null) form.append("is_new", String(Boolean(isNew)));
    if (file) form.append("image", file);

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

export async function adminDeleteStyle(styleId) {
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
 */
export async function adminGetUserStats() {
    const res = await fetch(`${API_BASE}/admin/users/stats`, {
        credentials: "include",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ошибка загрузки статистики пользователей: ${res.status} ${text}`);
    }

    return res.json();
}

export async function adminClearUserStats({ clearLogs = true } = {}) {
    const res = await fetch(`${API_BASE}/admin/users/stats/clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            confirm: "CLEAR",
            clear_logs: Boolean(clearLogs),
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ошибка очистки статистики: ${res.status} ${text}`);
    }

    return res.json();
}

/**
 * Админы:
 * GET  /api/admin/admins
 * POST /api/admin/users/{telegram_id}/admin-flag { is_admin: bool }
 */
export async function adminGetAdmins() {
    const res = await fetch(`${API_BASE}/admin/admins`, {
        credentials: "include",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ошибка загрузки списка админов: ${res.status} ${text}`);
    }

    return res.json();
}

export async function adminSetAdminFlag({ telegramId, isAdmin }) {
    const res = await fetch(`${API_BASE}/admin/users/${telegramId}/admin-flag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_admin: isAdmin }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ошибка изменения прав админа: ${res.status} ${text}`);
    }

    return res.json();
}

/**
 * Рефералы:
 * GET  /api/admin/referrals
 * POST /api/admin/users/referral-flag
 * { telegram_id: int, is_referral: bool }
 */
export async function adminGetReferrals() {
    const res = await fetch(`${API_BASE}/admin/referrals`, {
        credentials: "include",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ошибка загрузки рефералов: ${res.status} ${text}`);
    }

    return res.json();
}

export async function adminSetReferralFlag({ telegramId, isReferral }) {
    const payload = { telegram_id: telegramId, is_referral: isReferral };

    const res = await fetch(`${API_BASE}/admin/users/referral-flag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ошибка изменения флага реферала: ${res.status} ${text}`);
    }

    return res.json();
}

// import { API_BASE } from "./config";

/**
 * Промокоды:
 * GET    /api/admin/promo-codes
 * POST   /api/admin/promo-codes                { code, generations, is_active }
 * PUT    /api/admin/promo-codes/{code}         { generations, is_active }
 * DELETE /api/admin/promo-codes/{code}
 */

export async function adminGetPromoCodes() {
    const res = await fetch(`${API_BASE}/admin/promo-codes`, {
        credentials: "include",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ошибка загрузки промокодов: ${res.status} ${text}`);
    }

    return res.json();
}

export async function adminCreatePromoCode({ code, generations, isActive }) {
    const payload = {
        code,
        generations,
        is_active: Boolean(isActive),
    };

    const res = await fetch(`${API_BASE}/admin/promo-codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ошибка создания промокода: ${res.status} ${text}`);
    }

    return res.json();
}

export async function adminUpdatePromoCode({ code, generations, isActive }) {
    const payload = {
        generations,
        is_active: Boolean(isActive),
    };

    const res = await fetch(
        `${API_BASE}/admin/promo-codes/${encodeURIComponent(code)}`,
        {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
        }
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ошибка обновления промокода: ${res.status} ${text}`);
    }

    return res.json();
}

export async function adminDeletePromoCode({ code }) {
    const res = await fetch(
        `${API_BASE}/admin/promo-codes/${encodeURIComponent(code)}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ошибка удаления промокода: ${res.status} ${text}`);
    }

    return res.json();
}