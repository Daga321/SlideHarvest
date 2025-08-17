import { useEffect, useState } from 'react';
import SlidesCard from '../../src/components/SlidesCard/SlidesCard';
import './App.css';
import LoadingSpinner from '../../src/components/LoadingSpinner/LoadingSpinner';
import { sendMessageToActiveTab, listen } from '../../src/utils/Messaging';
import { Message, MessageType } from '../../Types/Utils/Messages';

/**
 * Main App component for the SlideHarvest extension popup
 * Manages the display of presentation slides found on the current page
 * @returns JSX element containing the main application interface
 */
export default function App() {
  // useState declarations
  const [iframeUrls, setIframeUrls] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);

  // useEffect for message listening
  useEffect(() => {
    const removeListener = listen<string[][]>((message: Message<string[][]>) => {
      handleMessage(message, setIframeUrls, setLoading);
    });
    
    sendMessageToActiveTab({
      type: MessageType.REQUEST_PRESENTATION_IFRAMES
    });

    return () => {
      removeListener();
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
            iframeUrls.map(([id, url], idx) => (
              <SlidesCard
                key={idx}
                id={id}
                title={`Presentation #${idx + 1}`}
                link={url}
              />
            ))
          )
        )}
      </div>
    </div>
  );
}

/**
 * Handles incoming messages from the content script
 * @param message - The message received from the content script
 * @param setIframeUrls - State setter for iframe URLs array
 * @param setLoading - State setter for loading state
 */
const handleMessage = (
  message: Message<string[][]>, 
  setIframeUrls: React.Dispatch<React.SetStateAction<string[][]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (message.type === MessageType.PRESENTATION_IFRAMES) {
    setIframeUrls(message.payload || []);
    setLoading(false);
  }
};
