const OGPreviewBoard = ({ ogData }) => {
    if (!ogData || !ogData.image) return null;

    return (
        <div style={{ marginTop: "4px", borderRadius: "4px", overflow: "hidden", width: "100%", textAlign: "center" }}>
            <img
                src={ogData.image}
                alt="OG Thumbnail"
                style={{
                    width: "100%",
                    height: "40px",
                    objectFit: "cover",
                    borderRadius: "4px",
                }}
            />
        </div>
    );
};

export default OGPreviewBoard;