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
 * Sends a message to a specific tab
 * @param tabId - ID of the target tab
 * @param message - The message to send
 */
export function sendMessageToTab<T>(tabId: number, message: Message<T>): void {
  if (browserAPI?.tabs?.sendMessage) {
    browserAPI.tabs.sendMessage(tabId, message).catch((error: Error) => {
      console.warn('Error sending message to tab:', error);
    });
  } else {
    console.warn('Browser API not available for sending messages to tabs');
  }
}

/**
 * Sends a message to offscreen document and waits for response
 * @param message - The message to send
 * @param timeout - Timeout in milliseconds (default: 30000)
 * @returns Promise that resolves to the response
 */
export function sendMessageToOffscreen<T, R = any>(
  message: Message<T>, 
  timeout: number = 30000
): Promise<R> {
  return new Promise((resolve, reject) => {  
    if (!browserAPI?.runtime?.sendMessage) {
      const error = new Error('Browser API not available for sending messages');
      console.error('Browser API check failed:', error);
      reject(error);
      return;
    }

    const timeoutId = setTimeout(() => {
      const timeoutError = new Error(`Offscreen message timeout after ${timeout}ms for message type: ${message.type}`);
      console.error('Message timeout:');
      reject(timeoutError);
    }, timeout);

    try {
      browserAPI.runtime.sendMessage(message, (response: R) => {
        clearTimeout(timeoutId);

        if (browserAPI.runtime.lastError) {
          const runtimeError = new Error(browserAPI.runtime.lastError.message);
          console.error('Runtime error in sendMessage:');
          reject(runtimeError);
          return;
        }
        
        if (!response) {
          const noResponseError = new Error(`No response received for message type: ${message.type}`);
          console.error('No response received:');
          reject(noResponseError);
          return;
        }
        
        resolve(response);
      });
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Exception in sendMessage:');
      reject(error);
    }
  });
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