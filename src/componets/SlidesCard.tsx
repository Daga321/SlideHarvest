import { useState } from "react";
import { SlidesCardProps } from "../../Types/SlidesCardProps";
import "./SlidesCard.css";

// Helper to detect slide source
function getSlideSource(url: string): string {
  if (url.includes("canva.com")) return "Canva";
  if (url.includes("docs.google.com")) return "Google Slides";
  if (url.includes("prezi.com")) return "Prezi";
  if (url.includes("1drv.ms") || url.includes("onedrive.live.com")) return "OneDrive";
  return "Other";
}


const SlidesCard: React.FC<SlidesCardProps> = ({ title, link }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const source = getSlideSource(link);

  // Asignar clase de color según la fuente
  const sourceClass = `slides-card__source slides-card__source--${source.replace(/\s+/g, '').toLowerCase()}`;

  return (
    <div className="slides-card">
      <div className="slides-card__preview">
        {loading && !error && (
          <div className="slides-card__spinner">
            <div className="spinner"></div>
          </div>
        )}
        {error && (
          <div className="slides-card__error">Preview could not be loaded.</div>
        )}
        <iframe
          src={link}
          title={title}
          className="slides-card__iframe"
          style={{ display: loading || error ? "none" : "block" }}
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
          loading="lazy"
          allowFullScreen
        ></iframe>
      </div>
      <div className="slides-card__content">
        <h3 className="slides-card__title">{title}</h3>
        <div className="slides-card__meta">
          <span className={sourceClass}>{source}</span>
          <button
            className="slides-card__focus-btn"
            // TODO: Define logic in content script to focus the corresponding iframe
            onClick={() => {/* ToDo: Scroll to iframe in page */}}
          >
            Focus
          </button>
          <button
            className="slides-card__download-btn"
            // TODO: Define logic to download PDF
            onClick={() => {/* ToDo: Download PDF */}}
          >
            Download PDF
          </button>
        </div>
        <a href={link} target="_blank" rel="noopener noreferrer" className="slides-card__external-link">
          View presentation
        </a>
      </div>
    </div>
  );
};

export default SlidesCard;
