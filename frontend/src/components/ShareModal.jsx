import React from "react";
import "../styles/ShareModal.css";

export default function ShareModal({ url, onClose }) {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Jaa suosikkilista</h3>
                <input type="text" value={url} readOnly onClick={(e) => e.target.select()} />
                <div className="modal-buttons">
                    <button onClick={() => navigator.clipboard.writeText(url)}>
                        Kopioi leikepöydälle
                    </button>
                    <button onClick={onClose}>Sulje</button>
                </div>
            </div>
        </div>
    );
}