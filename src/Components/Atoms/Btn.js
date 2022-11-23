export default function Button() {
    function reload() {
        window.location.reload();
    }
    return(
        <button id="refresh-btn" className="button-85" onClick={reload}>Load New File</button>
    )
}