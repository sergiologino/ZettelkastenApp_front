const OGPreview = ({ ogData }) => {
    return (
        <div style={{ marginTop: "8px", border: "1px solid #ccc", borderRadius: "4px", padding: "8px" }}>
            {ogData ? (
                <>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <img
                            src={ogData.image || ""}
                            alt=""
                            style={{
                                width: "40px",
                                height: "40px",
                                marginRight: "8px",
                                objectFit: "cover",
                            }}
                        />
                        <div>
                            <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{ogData.title}</div> {/* Шрифт уменьшен */}
                            <div style={{ fontSize: "0.7rem", color: "#666" }}>{ogData.site_name}</div> {/* Было 0.8rem */}
                        </div>
                    </div>
                    <div style={{ marginTop: "8px", fontSize: "0.9rem" }}>
                        <p>{ogData.description}</p>
                        <a href={ogData.url} target="_blank" rel="noopener noreferrer">
                            Перейти на сайт
                        </a>
                    </div>
                </>
            ) : (
                <p>Данные OpenGraph недоступны.</p>
            )}
        </div>
    );
};

export default OGPreview;