const OGPreview = ({ ogData }) => {
    // console.log("OgData in OGPreview: ",ogData);
    // return <div>OGPreview content</div>;
    if (!ogData) return <p>Нет данных</p>;
    return (
        <div style={{ marginTop: "12px", border: "1px solid #ccc", borderRadius: "8px", padding: "8px",height:"50%" }}>
            {ogData ? (
                <>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <img
                            src={ogData.image || ""}
                            alt="No pict"
                            style={{
                                width: "40px",
                                height: "60%",
                                marginRight: "8px",
                                objectFit: "cover",
                            }}
                        />
                        <div>
                            <div style={{fontSize: "0.8rem", fontWeight: "bold"}}>{ogData.title}</div>
                            <div style={{fontSize: "0.8rem", color: "#666"}}>{ogData.description}</div>
                        </div>
                    </div>
                    <div style={{marginTop: "8px", fontSize: "0.7rem"}}>
                        <p>{ogData.description}</p>
                        <a href={ogData.url} target="_blank" rel="noopener noreferrer">
                            Перейти на сайт (в новой вкладке)
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