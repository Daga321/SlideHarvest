import { getPresentationIframes } from './fetchIframe';
import { focusIframe } from './focusIframe';
import { debounce } from '../../src/utils/Debounce';
import { sendMessage, listen } from '../../src/utils/Messaging';
import { MessageType, Message } from '../../Types/Utils/Messages';

/**
 * Content script for SlideHarvest extension
 * Detects presentation iframes on web pages and handles communication with the popup
 */
// @ts-ignore
export default defineContentScript({
  matches: ["*://*/*", "file://*/*"],
  main() {
    /**
     * Sends the current presentation iframes data to the popup
     */
    const sendPresentationIframes = () => {
      const iframesData = getPresentationIframes();
      sendMessage({
        type: MessageType.PRESENTATION_IFRAMES,
        payload: iframesData,
      });
    };

    // Initial send
    sendPresentationIframes();

    // Setup MutationObserver with debounce to detect DOM changes
    const debouncedSend = debounce(sendPresentationIframes, 500);
    const observer = new MutationObserver(debouncedSend);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: false,
    });

    // Listen for messages requesting iframe data
    const removerRequestIframesListener = listen<void>((msg: Message, sender) => {
      if (msg.type === MessageType.REQUEST_PRESENTATION_IFRAMES) {
        sendPresentationIframes();
      }
    });

    // Listen for focus iframe requests
    const removeFocusIframeListener = listen<void>((msg: Message, sender) => {
      if (msg.type === MessageType.FOCUS_IFRAMES) {
        focusIframe(msg.payload);
      }
    });

    /**
     * Cleanup function for when the content script is deactivated
     * Removes observers and listeners to prevent memory leaks
     */
    return () => {
      observer.disconnect();
      removerRequestIframesListener();
      removeFocusIframeListener()
    };

  },
});
