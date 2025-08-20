import { listen, sendMessage } from '../../src/utils/Messaging';
import { Message, MessageType } from '../../Types/Utils/Messages';
import type { CaptureTabResponse } from '../../Types/Utils/CaptureTabResponse';
import type { OffscreenResponse } from '../../Types/Utils/OffscreenResponse';


// Offscreen script for capturing iframe screenshots
let currentIframe: HTMLIFrameElement | null = null;

// Listen for messages from the background script
const removeListener = listen<string>((message: Message<string>, sender) => {
  console.log('Offscreen received message:', message.type, message.payload);
  if (message.type === MessageType.TAKE_SCREENSHOT) {
    handleMessage(message, sender);
  }
});

async function handleMessage(message: Message<string>, sender: any): Promise<void> {
    try {
      console.log('Handling screenshot message for URL:', message.payload);
      if (message.payload) {
        await loadIframe(message.payload);
        console.log('Iframe loaded, capturing screenshot...');
        const screenshot = await captureScreenshot();
        console.log('Screenshot captured, sending response...');
        
        // Send the captured screenshot back
        sendMessage<string>({
          type: MessageType.SCREENSHOT_RESPONSE,
          payload: screenshot
        });
        console.log('Screenshot response sent');
      } else {
        throw new Error('No URL provided for iframe loading');
      }
    } catch (error) {
      console.error('Error in offscreen process:', error);
      sendMessage<OffscreenResponse>({
        type: MessageType.SCREENSHOT_RESPONSE,
        payload: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      });
    }
}

async function loadIframe(url: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const iframe = document.getElementById('slide-iframe') as HTMLIFrameElement;
    
    if (!iframe) {
      reject(new Error('Iframe element not found in offscreen document'));
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error('Iframe loading timeout'));
    }, 10000); // 10 second timeout

    iframe.onload = () => {
      clearTimeout(timeoutId);
      console.log('Iframe loaded successfully');
      // Wait for content to fully render
      setTimeout(resolve, 2000);
    };
    
    iframe.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error('Failed to load iframe'));
    };
    
    iframe.src = url;
    currentIframe = iframe;
  });
}

async function captureScreenshot(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Screenshot capture timeout'));
    }, 5000); // 5 second timeout

    // Send message requesting tab capture
    sendMessage<void>({
      type: MessageType.REQUEST_CAPTURE_TAB
    });

    // Listen for the response
    const removeResponseListener = listen<CaptureTabResponse>((message: Message<CaptureTabResponse>) => {
      if (message.type === MessageType.CAPTURE_TAB_RESPONSE) {
        clearTimeout(timeoutId);
        removeResponseListener();
        
        if (message.payload?.success && message.payload.dataUrl) {
          resolve(message.payload.dataUrl);
        } else {
          reject(new Error(message.payload?.error || 'Failed to capture screenshot'));
        }
      }
    });
  });
}

console.log('Offscreen script loaded and ready');
