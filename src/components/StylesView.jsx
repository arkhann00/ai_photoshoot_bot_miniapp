import React, { useEffect, useState } from "react";
import { fetchStyles, generatePhotoshoot } from "../api.js";

export default function StylesView({ onError, onGlobalLoadingChange }) {
    const [styles, setStyles] = useState([]);
    const [loadingStyles, setLoadingStyles] = useState(true);
    const [selectedStyleId, setSelectedStyleId] = useState(null);
    const [file, setFile] = useState(null);
    const [generationLoading, setGenerationLoading] = useState(false);
    const [resultUrl, setResultUrl] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function loadStyles() {
            setLoadingStyles(true);
            onGlobalLoadingChange(true);
            try {
                const data = await fetchStyles();
                if (!cancelled) {
                    setStyles(data || []);
                    if (data && data.length > 0) {
                        setSelectedStyleId(data[0].id);
                    }
                }
            } catch (e) {
                if (!cancelled) {
                    onError(e.message || "Не удалось загрузить стили");
                }
            } finally {
                if (!cancelled) {
                    setLoadingStyles(false);
                    onGlobalLoadingChange(false);
                }
            }
        }

        loadStyles();

        return () => {
            cancelled = true;
        };
    }, [onError, onGlobalLoadingChange]);

    const handleFileChange = (e) => {
        const f = e.target.files?.[0] || null;
        setFile(f);
        setResultUrl(null);
    };

    const handleGenerate = async () => {
        if (!selectedStyleId) {
            onError("Выбери стиль перед генерацией");
            return;
        }
        if (!file) {
            onError("Выбери селфи для загрузки");
            return;
        }

        setGenerationLoading(true);
        onGlobalLoadingChange(true);
        setResultUrl(null);

        try {
            const { url } = await generatePhotoshoot(selectedStyleId, file);
            setResultUrl(url);
        } catch (e) {
            onError(e.message || "Ошибка при генерации фотосессии");
        } finally {
            setGenerationLoading(false);
            onGlobalLoadingChange(false);
        }
    };

    return (
        <div className="screen screen--home">
            <section className="card card--glass">
                <h2 className="card__title">Выбери стиль</h2>
                {loadingStyles ? (
                    <div className="loader">Загружаем стили…</div>
                ) : styles.length === 0 ? (
                    <p className="card__text">
                        Стили пока не настроены. Попробуй позже или обратись в поддержку.
                    </p>
                ) : (
                    <div className="styles-scroll">
                        {styles.map((style) => (
                            <button
                                key={style.id}
                                type="button"
                                className={
                                    "style-card" +
                                    (selectedStyleId === style.id ? " style-card--active" : "")
                                }
                                onClick={() => setSelectedStyleId(style.id)}
                            >
                                <div className="style-card__image-wrapper">
                                    <img
                                        src={style.image_url}
                                        alt={style.title}
                                        className="style-card__image"
                                    />
                                </div>
                                <div className="style-card__body">
                                    <h3 className="style-card__title">{style.title}</h3>
                                    <p className="style-card__description">
                                        {style.description}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            <section className="card card--glass">
                <h2 className="card__title">Загрузи селфи</h2>
                <p className="card__text">
                    Лицо прямо, хорошее освещение, без сильных фильтров и очков. Чем
                    лучше исходное фото — тем круче результат ✨
                </p>

                <label className="file-input">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <span className="file-input__button">
            {file ? "Выбрано другое фото" : "Выбрать селфи"}
          </span>
                    {file && <span className="file-input__filename">{file.name}</span>}
                </label>

                <button
                    type="button"
                    className="primary-button"
                    onClick={handleGenerate}
                    disabled={generationLoading || !selectedStyleId || !file}
                >
                    {generationLoading ? "Генерируем…" : "Сделать фотосессию"}
                </button>
            </section>

            {resultUrl && (
                <section className="card card--result">
                    <h2 className="card__title">Готово! 🎉</h2>
                    <p className="card__text">
                        Сохрани это фото себе или сделай ещё одну фотосессию с другим
                        стилем.
                    </p>
                    <div className="result-image-wrapper">
                        <img src={resultUrl} alt="Результат фотосессии" />
                    </div>
                </section>
            )}
        </div>
    );
}
