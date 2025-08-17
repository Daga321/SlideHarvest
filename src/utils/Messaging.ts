import { Message } from '../../Types/Utils/Messages';

// Common interface compatible with Chrome and Firefox
const browserAPI = globalThis.browser || (globalThis as any).chrome;

/**
 * Sends a generic message
 * @param message - The message to send
 */
export function sendMessage<T>(message: Message<T>): void {
  if (browserAPI?.runtime?.sendMessage) {
    browserAPI.runtime.sendMessage(message).catch((error: Error) => {
      console.warn('Error sending message:', error);
    });
  } else {
    console.warn('Browser API not available for sending messages');
  }
}

/**
 * Sends a message to the content script of the active tab
 * @param message - The message to send
 */
export function sendMessageToActiveTab<T>(message: Message<T>): void {
  if (browserAPI?.tabs) {
    browserAPI.tabs.query({ active: true, currentWindow: true })
      .then((tabs: any) => {
        if (tabs[0]?.id) {
          browserAPI.tabs.sendMessage(tabs[0].id, message);
        }
      })
      .catch((error: Error) => {
        console.warn('Error sending message to active tab:', error);
      });
  } else {
    console.warn('Browser API not available for sending messages to tabs');
  }
}

/**
 * Listens for incoming messages
 * @param callback - Callback function that executes when a message arrives
 * @returns Function to remove the listener
 */
export function listen<T>(
  callback: (message: Message<T>, sender?: any) => void
): () => void {
  if (!browserAPI?.runtime?.onMessage) {
    console.warn('Browser API not available for listening to messages');
    return () => {};
  }

  const listener = (
    message: Message<T>,
    sender: any,
    sendResponse: (response?: any) => void
  ) => {
    callback(message, sender);
  };

  browserAPI.runtime.onMessage.addListener(listener);

  // Returns function to remove the listener
  return () => {
    if (browserAPI?.runtime?.onMessage?.removeListener) {
      browserAPI.runtime.onMessage.removeListener(listener);
    }
  };
}