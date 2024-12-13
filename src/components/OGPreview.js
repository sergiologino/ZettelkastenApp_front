import React, { useState, useEffect } from "react";

const OGPreview = ({ url }) => {
    const [ogData, setOgData] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        // Запрос для получения данных Open Graph
        const fetchOGData = async () => {
            try {
                const response = await fetch(`/api/get-og-data?url=${encodeURIComponent(url)}`);
                const data = await response.json();
                setOgData(data);
            } catch (error) {
                console.error("Ошибка при получении OG данных:", error);
            }
        };

        fetchOGData();
    }, [url]);

    return (
        <div style={{ marginTop: "8px", border: "1px solid #ccc", borderRadius: "4px", padding: "8px" }}>
            {ogData ? (
                <>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                        }}
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <img
                            src={ogData.image || ""}
                            alt=""
                            style={{
                                width: "50px",
                                height: "50px",
                                marginRight: "8px",
                                objectFit: "cover",
                            }}
                        />
                        <div>
                            <div style={{ fontWeight: "bold" }}>{ogData.title}</div>
                            <div style={{ fontSize: "0.8rem", color: "#666" }}>{ogData.site_name}</div>
                        </div>
                    </div>
                    {isExpanded && (
                        <div style={{ marginTop: "8px", fontSize: "0.9rem" }}>
                            <p>{ogData.description}</p>
                            <a href={url} target="_blank" rel="noopener noreferrer">
                                Перейти на сайт
                            </a>
                        </div>
                    )}
                </>
            ) : (
                <p>Загрузка...</p>
            )}
        </div>
    );
};

export default OGPreview;
