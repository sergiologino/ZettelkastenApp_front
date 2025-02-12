const OGPreview = ({ ogData }) => {
    // console.log("OgData in OGPreview: ",ogData);
    // return <div>OGPreview content</div>;
    if (!ogData) return <p>Нет данных</p>;
    return (
        <div style={{ marginTop: "8px", border: "1px solid #ccc", borderRadius: "8px", padding: "8px" }}>
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
                            <div style={{ fontWeight: "bold" }}>{ogData.title}</div>
                            <div style={{fontSize: "0.8rem", color: "#666"}}>{ogData.description}</div>
                        </div>
                    </div>
                    <div style={{marginTop: "8px", fontSize: "0.9rem"}}>
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