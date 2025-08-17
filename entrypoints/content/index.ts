import { getPresentationIframes } from './fetchIframe';
import { focusIframe } from './focusIframe';
import { debounce } from '../../src/utils/Debounce';
import { sendMessage, listen } from '../../src/utils/Messaging';
import { MessageType, Message } from '../../Types/Utils/Messages';

// @ts-ignore
export default defineContentScript({
  matches: ["*://*/*", "file://*/*"],
  main() {
    // Function to send the current presentation iframes
    const sendPresentationIframes = () => {
      const iframesData = getPresentationIframes();
      sendMessage({
        type: MessageType.PRESENTATION_IFRAMES,
        payload: iframesData,
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
    const removerRequestIframesListener = listen<void>((msg: Message, sender) => {
      if (msg.type === MessageType.REQUEST_PRESENTATION_IFRAMES) {
        sendPresentationIframes();
      }
    });

    // Listen for focus iframes request
    const removeFocusIframeListener = listen<void>((msg: Message, sender) => {
      if (msg.type === MessageType.FOCUS_IFRAMES) {
        focusIframe(msg.payload);
      }
    });

    // Cleanup function (optional, for when the content script is deactivated)
    return () => {
      observer.disconnect();
      removerRequestIframesListener();
      removeFocusIframeListener()
    };

  },
});
