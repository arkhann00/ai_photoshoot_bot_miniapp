// src/api.js

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

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

export async function adminDeleteCategory(categoryId) {
    await apiFetch(`/admin/style-categories/${categoryId}`, {
        method: "DELETE",
    });
}

// альтернативный метод, если где-то используется отдельно
export async function adminGetCategories() {
    const res = await fetch(`${API_BASE_URL}/admin/style-categories`, {
        credentials: "include",
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ошибка загрузки категорий: ${res.status} ${text}`);
    }
    return await res.json();
}
export async function adminCreateCategory({ title, description, gender, file }) {
    const form = new FormData();
    form.append("title", title);
    form.append("description", description);
    form.append("gender", gender); // "male" или "female"
    if (file) {
        form.append("file", file);
    }

    const res = await fetch(`${API_BASE_URL}/admin/style-categories`, {
        method: "POST",
        body: form,
        credentials: "include",
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ошибка создания категории: ${res.status} ${text}`);
    }
    return await res.json();
}

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

export async function adminDeleteStyle(styleId) {
    await apiFetch(`/admin/styles/${styleId}`, {
        method: "DELETE",
    });
}

export async function adminCreateStyle({ title, description, prompt, categoryId, file }) {
    const form = new FormData();
    form.append("title", title);
    form.append("description", description);
    form.append("prompt", prompt);
    form.append("category_id", String(categoryId));
    if (file) {
        // backend ждёт image: UploadFile = File(...)
        form.append("image", file);
    }

    const res = await fetch(`${API_BASE_URL}/admin/styles`, {
        method: "POST",
        body: form,
        credentials: "include",
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ошибка создания стиля: ${res.status} ${text}`);
    }
    return await res.json();
}
