import { getPresentationIframes } from './fetchIframe';
import { debounce } from '../../src/utils/Debounce';
import { sendMessage, listen } from '../../src/utils/Messaging';
import { MessageType, Message } from '../../Types/Utils/Messages';

// @ts-ignore
export default defineContentScript({
  matches: ["*://*/*", "file://*/*"],
  main() {
    // Function to send the current presentation iframes
    const sendPresentationIframes = () => {
      const urls = getPresentationIframes();
      sendMessage({
        type: MessageType.PRESENTATION_IFRAMES,
        payload: urls,
      });
    };

    // Initial send
    sendPresentationIframes();

    // Setup MutationObserver with debounce
    const debouncedSend = debounce(sendPresentationIframes, 500);
    const observer = new MutationObserver(debouncedSend);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: false,
    });

    // Listen for messages to request iframes
    const removeListener = listen<void>((msg: Message, sender) => {
      console.log('Content script received message:', msg);
      if (msg.type === MessageType.REQUEST_PRESENTATION_IFRAMES) {
        console.log('Content script processing REQUEST_PRESENTATION_IFRAMES');
        sendPresentationIframes();
      }
    });

    // Cleanup function (optional, for when the content script is deactivated)
    return () => {
      observer.disconnect();
      removeListener();
    };

  },
});
