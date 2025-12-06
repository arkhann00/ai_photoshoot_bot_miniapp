// src/views/PhotoshootView.jsx

import React, { useEffect, useState, useMemo } from "react";
import {
    fetchStyleCategories,
    fetchStylesForCategory,
    createPhotoshoot,
} from "../api.js";

function GenderToggle({ gender, onChange, disabled }) {
    return (
        <div className="segmented-control">
            <button
                type="button"
                className={
                    gender === "female"
                        ? "segmented-control__btn segmented-control__btn--active"
                        : "segmented-control__btn"
                }
                disabled={disabled}
                onClick={() => onChange("female")}
            >
                👩 Женский
            </button>
            <button
                type="button"
                className={
                    gender === "male"
                        ? "segmented-control__btn segmented-control__btn--active"
                        : "segmented-control__btn"
                }
                disabled={disabled}
                onClick={() => onChange("male")}
            >
                👨 Мужской
            </button>
        </div>
    );
}

export default function PhotoshootView({ me }) {
    const [gender, setGender] = useState("female");

    const [categories, setCategories] = useState([]);
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);

    const [styles, setStyles] = useState([]);
    const [currentStyleIndex, setCurrentStyleIndex] = useState(0);
    const [isLoadingStyles, setIsLoadingStyles] = useState(false);

    const [selectedFile, setSelectedFile] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateError, setGenerateError] = useState(null);
    const [generatedPhotoUrl, setGeneratedPhotoUrl] = useState(null);

    const currentCategory = useMemo(() => {
        if (!categories.length) return null;
        if (currentCategoryIndex < 0 || currentCategoryIndex >= categories.length) {
            return categories[0];
        }
        return categories[currentCategoryIndex];
    }, [categories, currentCategoryIndex]);

    const currentStyle = useMemo(() => {
        if (!styles.length) return null;
        if (currentStyleIndex < 0 || currentStyleIndex >= styles.length) {
            return styles[0];
        }
        return styles[currentStyleIndex];
    }, [styles, currentStyleIndex]);

    useEffect(() => {
        let isMounted = true;

        async function loadCategories() {
            setIsLoadingCategories(true);
            setCategories([]);
            setCurrentCategoryIndex(0);
            setStyles([]);
            setCurrentStyleIndex(0);
            setGeneratedPhotoUrl(null);
            setGenerateError(null);
            setSelectedFile(null);

            try {
                const data = await fetchStyleCategories(gender);
                if (!isMounted) return;
                setCategories(data || []);
            } catch (e) {
                if (!isMounted) return;
                console.error("Ошибка загрузки категорий:", e);
            } finally {
                if (isMounted) {
                    setIsLoadingCategories(false);
                }
            }
        }

        loadCategories();

        return () => {
            isMounted = false;
        };
    }, [gender]);

    async function handleSelectCategory() {
        if (!currentCategory) return;
        setIsLoadingStyles(true);
        setStyles([]);
        setCurrentStyleIndex(0);
        setGeneratedPhotoUrl(null);
        setGenerateError(null);
        setSelectedFile(null);

        try {
            const data = await fetchStylesForCategory(currentCategory.id, gender);
            setStyles(data || []);
        } catch (e) {
            console.error("Ошибка загрузки стилей:", e);
        } finally {
            setIsLoadingStyles(false);
        }
    }

    function handlePrevCategory() {
        if (!categories.length) return;
        setStyles([]);
        setCurrentStyleIndex(0);
        setGeneratedPhotoUrl(null);
        setGenerateError(null);
        setSelectedFile(null);

        setCurrentCategoryIndex((prev) =>
            prev === 0 ? categories.length - 1 : prev - 1
        );
    }

    function handleNextCategory() {
        if (!categories.length) return;
        setStyles([]);
        setCurrentStyleIndex(0);
        setGeneratedPhotoUrl(null);
        setGenerateError(null);
        setSelectedFile(null);

        setCurrentCategoryIndex((prev) =>
            prev === categories.length - 1 ? 0 : prev + 1
        );
    }

    function handlePrevStyle() {
        if (!styles.length) return;
        setGeneratedPhotoUrl(null);
        setGenerateError(null);

        setCurrentStyleIndex((prev) =>
            prev === 0 ? styles.length - 1 : prev - 1
        );
    }

    function handleNextStyle() {
        if (!styles.length) return;
        setGeneratedPhotoUrl(null);
        setGenerateError(null);

        setCurrentStyleIndex((prev) =>
            prev === styles.length - 1 ? 0 : prev + 1
        );
    }

    function handleFileChange(e) {
        const file = e.target.files && e.target.files[0];
        setSelectedFile(file || null);
        setGeneratedPhotoUrl(null);
        setGenerateError(null);
    }

    async function handleGenerate() {
        if (!currentStyle || !selectedFile) {
            setGenerateError("Сначала выбери стиль и загрузи селфи.");
            return;
        }

        setIsGenerating(true);
        setGenerateError(null);
        setGeneratedPhotoUrl(null);

        try {
            const result = await createPhotoshoot({
                styleId: currentStyle.id,
                file: selectedFile,
            });

            if (result && result.image_url) {
                setGeneratedPhotoUrl(result.image_url);
            } else {
                setGenerateError("Сервис вернул неожиданный ответ.");
            }
        } catch (e) {
            setGenerateError(e.message || "Ошибка генерации фотосессии.");
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <div className="screen">
            <section className="card card--hero">
                <h2 className="card__title">Фотосессия из селфи</h2>
                <p className="card__text">
                    1. Выбери пол и категорию. 2. Выбери стиль. 3. Загрузите селфи.
                </p>

                <GenderToggle
                    gender={gender}
                    onChange={(value) => {
                        if (isLoadingCategories || isLoadingStyles || isGenerating) return;
                        setGender(value);
                    }}
                    disabled={isLoadingCategories || isLoadingStyles || isGenerating}
                />
            </section>

            <section className="card">
                <h3 className="card__subtitle">Категория</h3>

                {isLoadingCategories && (
                    <p className="card__text">Загружаю категории…</p>
                )}

                {!isLoadingCategories && !categories.length && (
                    <p className="card__text">
                        Для этого пола пока нет категорий стилей.
                    </p>
                )}

                {!isLoadingCategories && currentCategory && (
                    <>
                        <div className="carousel-card">
                            <div className="carousel-card__image-wrapper">
                                <img
                                    src={currentCategory.image_url}
                                    alt={currentCategory.title}
                                    className="carousel-card__image"
                                />
                            </div>
                            <div className="carousel-card__body">
                                <h4 className="carousel-card__title">
                                    {currentCategory.title}
                                </h4>
                                <p className="carousel-card__description">
                                    {currentCategory.description}
                                </p>
                                <p className="carousel-card__meta">
                                    {currentCategoryIndex + 1} из {categories.length}
                                </p>
                            </div>
                        </div>

                        <div className="carousel-controls">
                            <button
                                type="button"
                                className="btn btn--ghost"
                                onClick={handlePrevCategory}
                                disabled={isLoadingStyles || isGenerating}
                            >
                                ◀
                            </button>
                            <button
                                type="button"
                                className="btn btn--primary"
                                onClick={handleSelectCategory}
                                disabled={isLoadingStyles || isGenerating}
                            >
                                Выбрать
                            </button>
                            <button
                                type="button"
                                className="btn btn--ghost"
                                onClick={handleNextCategory}
                                disabled={isLoadingStyles || isGenerating}
                            >
                                ▶
                            </button>
                        </div>
                    </>
                )}
            </section>

            <section className="card">
                <h3 className="card__subtitle">Стиль</h3>

                {isLoadingStyles && (
                    <p className="card__text">Загружаю стили…</p>
                )}

                {!isLoadingStyles && currentCategory && !styles.length && (
                    <p className="card__text">
                        Выбери категорию, чтобы увидеть стили.
                    </p>
                )}

                {!isLoadingStyles && styles.length > 0 && currentStyle && (
                    <>
                        <div className="carousel-card">
                            <div className="carousel-card__image-wrapper">
                                <img
                                    src={currentStyle.image_url}
                                    alt={currentStyle.title}
                                    className="carousel-card__image"
                                />
                            </div>
                            <div className="carousel-card__body">
                                <h4 className="carousel-card__title">
                                    {currentStyle.title}
                                </h4>
                                <p className="carousel-card__description">
                                    {currentStyle.description}
                                </p>
                                <p className="carousel-card__meta">
                                    {currentStyleIndex + 1} из {styles.length}
                                </p>
                            </div>
                        </div>

                        <div className="carousel-controls">
                            <button
                                type="button"
                                className="btn btn--ghost"
                                onClick={handlePrevStyle}
                                disabled={isGenerating}
                            >
                                ◀
                            </button>
                            <button
                                type="button"
                                className="btn btn--ghost"
                                onClick={handleNextStyle}
                                disabled={isGenerating}
                            >
                                ▶
                            </button>
                        </div>
                    </>
                )}
            </section>

            <section className="card">
                <h3 className="card__subtitle">Селфи</h3>

                <p className="card__text">
                    Лицо прямо, нейтральный фон, без сильных фильтров.
                </p>

                <label className="file-input">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isGenerating || !currentStyle}
                    />
                </label>

                <button
                    type="button"
                    className="btn btn--primary btn--full"
                    disabled={isGenerating || !currentStyle || !selectedFile}
                    onClick={handleGenerate}
                >
                    {isGenerating ? "Генерирую…" : "Сделать фотосессию"}
                </button>

                {generateError && (
                    <p className="error-text error-text--small">{generateError}</p>
                )}

                {generatedPhotoUrl && (
                    <div className="generated-photo">
                        <h4 className="generated-photo__title">Результат</h4>
                        <img
                            src={generatedPhotoUrl}
                            alt="Сгенерированная фотосессия"
                            className="generated-photo__image"
                        />
                    </div>
                )}
            </section>
        </div>
    );
}
