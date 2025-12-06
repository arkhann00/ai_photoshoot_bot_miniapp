import { useEffect, useState } from "react";

export function useTelegram() {
    const [tg, setTg] = useState(null);

    useEffect(() => {
        const webApp = window.Telegram?.WebApp || null;

        if (webApp) {
            try {
                webApp.ready();
                webApp.expand();
            } catch (e) {
                console.warn("Telegram WebApp ready/expand error:", e);
            }

            // Применяем цвета темы
            try {
                document.body.style.backgroundColor =
                    webApp.backgroundColor || "#05060a";
                document.body.style.color = webApp.textColor || "#ffffff";
            } catch (e) {
                console.warn("Apply theme error:", e);
            }
            setTg(webApp);
        } else {
            // Фоллбек для браузера вне Telegram
            document.body.style.backgroundColor = "#05060a";
            document.body.style.color = "#ffffff";
        }
    }, []);

    const initData = tg?.initData || window.Telegram?.WebApp?.initData || "";

    return { tg, initData };
}
