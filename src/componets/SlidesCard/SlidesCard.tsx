import { useState } from "react";
import { SlidesCardProps } from "../../../Types/componets/SlidesCardProps";
import "./SlidesCard.css";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import { sendMessageToActiveTab } from "../../utils/Messaging";
import { MessageType } from "../../../Types/Utils/Messages";

// Helper to detect slide source
function getSlideSource(url: string): string {
  if (url.includes("canva.com")) return "Canva";
  if (url.includes("docs.google.com")) return "Google Slides";
  if (url.includes("prezi.com")) return "Prezi";
  if (url.includes("1drv.ms") || url.includes("onedrive.live.com")) return "OneDrive";
  return "Other";
}


export default function SlidesCard({ id, title, link }: SlidesCardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const source = getSlideSource(link);

  // Assign color class by source
  const sourceClass = `slides-card__source-label slides-card__source-label--${source.replace(/\s+/g, '').toLowerCase()}`;

  return (
    <div className="slides-card">
      <div className="slides-card__content">
        {/* Header  */}
        <div className="slides-card__title-row">
          <h3 className="slides-card__title">{title}</h3>
          <span className={sourceClass}>{source}</span>
        </div>
      </div>
      {/* Iframe */}
      <div className="slides-card__preview-container">
        <div
          className="slides-card__preview"
          tabIndex={0}
        >
          {loading && !error && (
            <LoadingSpinner/>
          )}
          {error && (
            <div className="slides-card__error">Preview could not be loaded.</div>
          )}
          <iframe
            src={link}
            title={title}
            className="slides-card__iframe"
            onLoad={() => {
              setLoading(false);
            }}
            onError={() => { setLoading(false); setError(true); }}
            loading="lazy"
            allowFullScreen
          ></iframe>
          {/* Overlay for focus/see action */}
          <div className="slides-card__iframe-overlay" onClick={() => focusIframe(id)}>
            <span className="slides-card__eye-icon" title="Focus/See">
              {/* SVG eye icon */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></svg>
            </span>
          </div>
        </div>
      </div>
      {/* Bottom buttons */}
      <div className="slides-card__content">
        <button
          className="slides-card__download-btn"
          onClick={downloadPDF}
        >
          Download PDF
        </button>
        <a href={link} target="_blank" rel="noopener noreferrer" className="slides-card__external-link">
          View presentation
          <span style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '0.35em' }}>
            {/* External link icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 17L17 7M17 7V17M17 7H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </a>
      </div>
    </div>
  );
};

function focusIframe(id: string){
  sendMessageToActiveTab({
    type: MessageType.FOCUS_IFRAMES,
    payload: id 
  });
}

function downloadPDF() {
  // TODO: Implement PDF download logic
}