// src/api.js

const API_BASE_URL = "https://api.aiphotostudio.ru/api";
// const API_BASE_URL = "http://0.0.0.0:8000/api";

async function apiFetch(path, options = {}) {
    const url = `${API_BASE_URL}${path}`;

    const resp = await fetch(url, {
        credentials: "include",
        ...options,
    });

    // 204 — нормальный пустой ответ (например, при DELETE)
    if (resp.status === 204) {
        return resp;
    }

    if (!resp.ok) {
        let message = `HTTP ${resp.status}`;
        try {
            const data = await resp.json();
            if (data && data.detail) {
                message = data.detail;
            }
        } catch {
            // тело не json — оставляем статус
        }
        throw new Error(message);
    }

    return resp;
}

// ---------- общий пользователь ----------

export async function fetchMe() {
    const res = await apiFetch("/me", { method: "GET" });
    return res.json();
}

export async function fetchStyleCategories(gender) {
    const params = new URLSearchParams();
    if (gender) {
        params.set("gender", gender);
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await apiFetch(`/style-categories${query}`, { method: "GET" });
    return res.json();
}

export async function fetchStylesForCategory(categoryId, gender) {
    const params = new URLSearchParams();
    params.set("category_id", String(categoryId));
    params.set("gender", gender);

    const res = await apiFetch(`/styles?${params.toString()}`, {
        method: "GET",
    });
    return res.json();
}

export async function createPhotoshoot({ styleId, file }) {
    const formData = new FormData();
    formData.append("style_id", String(styleId)); // backend ждёт style_id: Form(...)
    formData.append("photo", file);               // backend ждёт photo: UploadFile = File(...)

    const res = await apiFetch("/photoshoots/generate", {
        method: "POST",
        body: formData,
    });
    return res.json();
}

// ---------- АДМИН: пользователи ----------

export async function adminFetchUsers({ page = 1, pageSize = 20, query = "" }) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("page_size", String(pageSize));
    if (query) {
        params.set("q", query);
    }

    const res = await apiFetch(`/admin/users?${params.toString()}`, {
        method: "GET",
    });
    return res.json();
}

export async function adminChangeUserCredits(telegramId, delta) {
    const res = await apiFetch(
        `/admin/users/${telegramId}/credits`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ delta }),
        }
    );
    return res.json();
}

export async function adminChangeUserBalance(telegramId, delta) {
    const res = await apiFetch(
        `/admin/users/${telegramId}/balance`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ delta }),
        }
    );
    return res.json();
}

export async function adminFetchReport(days = 7) {
    const params = new URLSearchParams();
    params.set("days", String(days));

    const res = await apiFetch(`/admin/report?${params.toString()}`, {
        method: "GET",
    });
    return res.json();
}

// ---------- АДМИН: категории ----------

export async function adminFetchCategories() {
    const res = await apiFetch("/admin/style-categories", {
        method: "GET",
    });
    return res.json();
}

// export async function adminDeleteCategory(categoryId) {
//     await apiFetch(`/admin/style-categories/${categoryId}`, {
//         method: "DELETE",
//     });
// }
//
// // альтернативный метод, если где-то используется отдельно
// export async function adminGetCategories() {
//     const res = await fetch(`${API_BASE_URL}/admin/style-categories`, {
//         credentials: "include",
//     });
//     if (!res.ok) {
//         const text = await res.text();
//         throw new Error(`Ошибка загрузки категорий: ${res.status} ${text}`);
//     }
//     return await res.json();
// }
// export async function adminCreateCategory({ title, description, gender, file }) {
//     const form = new FormData();
//     form.append("title", title);
//     form.append("description", description);
//     form.append("gender", gender); // "male" или "female"
//     if (file) {
//         form.append("file", file);
//     }
//
//     const res = await fetch(`${API_BASE_URL}/admin/style-categories`, {
//         method: "POST",
//         body: form,
//         credentials: "include",
//     });
//     if (!res.ok) {
//         const text = await res.text();
//         throw new Error(`Ошибка создания категории: ${res.status} ${text}`);
//     }
//     return await res.json();
// }

// ---------- АДМИН: стили ----------

export async function adminFetchStyles(categoryId) {
    const params = new URLSearchParams();
    if (categoryId) {
        params.set("category_id", String(categoryId));
    }

    const res = await apiFetch(`/admin/styles?${params.toString()}`, {
        method: "GET",
    });
    return res.json();
}

// export async function adminDeleteStyle(styleId) {
//     await apiFetch(`/admin/styles/${styleId}`, {
//         method: "DELETE",
//     });
// }
//
// export async function adminCreateStyle({ title, description, prompt, categoryId, file }) {
//     const form = new FormData();
//     form.append("title", title);
//     form.append("description", description);
//     form.append("prompt", prompt);
//     form.append("category_id", String(categoryId));
//     if (file) {
//         // backend ждёт image: UploadFile = File(...)
//         form.append("image", file);
//     }
//
//     const res = await fetch(`${API_BASE_URL}/admin/styles`, {
//         method: "POST",
//         body: form,
//         credentials: "include",
//     });
//     if (!res.ok) {
//         const text = await res.text();
//         throw new Error(`Ошибка создания стиля: ${res.status} ${text}`);
//     }
//     return await res.json();
// }

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
// --- ПРОМОКОДЫ ---

export async function adminGetPromoCodes() {
    const res = await apiFetch("/admin/promo-codes", { method: "GET" });
    return res.json();
}

export async function adminCreatePromoCode({ code, generations, isActive }) {
    const payload = {
        code: String(code || "").trim(),
        generations: Number(generations),
        is_active: Boolean(isActive),
    };

    const res = await apiFetch("/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    return res.json();
}

// ✅ вместо PUT: используем реальный эндпоинт бэка
export async function adminSetPromoCodeActive({ promoId, isActive }) {
    const payload = { is_active: Boolean(isActive) };

    const res = await apiFetch(`/admin/promo-codes/${promoId}/active`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    return res.json();
}

// ✅ delete по promo_id (int), а не по code (string)
export async function adminDeletePromoCode({ promoId }) {
    const res = await apiFetch(`/admin/promo-codes/${promoId}`, {
        method: "DELETE",
    });

    // бэк возвращает JSONResponse({"status":"ok"}), поэтому:
    return res.json();
}

// ---------- АДМИН: все пользователи + сброс баланса ----------

export async function adminGetAllUsers() {
  const res = await fetch(`${API_BASE}/admin/users/all`, {
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ошибка загрузки пользователей: ${res.status} ${text}`);
  }

  return res.json();
}

export async function adminClearUserBalance({ telegramId }) {
  const res = await fetch(`${API_BASE}/admin/users/${telegramId}/balance/clear`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ошибка сброса баланса: ${res.status} ${text}`);
  }

  return res.json(); // AdminUserResponse
}