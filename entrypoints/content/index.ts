import { getPresentationIframes } from './fetchIframe';
// @ts-ignore
export default defineContentScript({
  matches: ["*://*/*", "file://*/*"],
  main() {
    // Helper debounce function
    function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
      let timer: ReturnType<typeof setTimeout> | null = null;
      return function(this: any, ...args: any[]) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
      } as T;
    }

    // Function to send the current presentation iframes
    const sendPresentationIframes = () => {
      const urls = getPresentationIframes();
      window.postMessage({ type: 'PRESENTATION_IFRAMES', payload: urls }, '*');
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

  },
});
