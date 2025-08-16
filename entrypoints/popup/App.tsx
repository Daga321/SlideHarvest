import { useEffect, useState } from 'react';
import SlidesCard from '../../src/componets/SlidesCard/SlidesCard';
import './App.css';
import LoadingSpinner from '../../src/componets/LoadingSpinner/LoadingSpinner';
// Message to request the iframes list
const REQUEST_IFRAMES = "REQUEST_PRESENTATION_IFRAMES";

function App() {

  const [iframeUrls, setIframeUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const listener = (msg: any, sender: any) => {
      if (msg.type === "PRESENTATION_IFRAMES") {
        setIframeUrls(msg.payload);
        setLoading(false);
      }
    };

    browser.runtime.onMessage.addListener(listener);

    // Request iframes list when opening the popup
    browser.tabs && browser.tabs.query({ active: true, currentWindow: true }).then((tabs: any) => {
      if (tabs[0]?.id) {
        browser.tabs.sendMessage(tabs[0].id, { type: REQUEST_IFRAMES });
      }
    }).catch(() => { setLoading(false); });
    return () => {
      browser.runtime.onMessage.removeListener(listener);
    };
  }, []);

  return (
    <div className="app">
      <h1 className="popup-title">SlideHarvest</h1>
      <hr style={{ border: 'none', borderTop: '1.5px solid #e0e0e0', margin: '0.5em 0 1.5em 0' }} />
      <div className="slides-list">
        {loading ? (
          <LoadingSpinner/>
        ) : (
          iframeUrls.length === 0 ? (
            <div>No presentations found on this page.</div>
          ) : (
            iframeUrls.map((url, idx) => (
              <SlidesCard
                key={idx}
                title={`Presentation #${idx + 1}`}
                description={url}
                link={url}
              />
            ))
          )
        )}
      </div>
    </div>
  );
}

export default App;
