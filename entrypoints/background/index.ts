import processIframe, { SlideScreenshotProcessor } from './processIframe';
import { listen } from '../../src/utils/Messaging';
import { MessageType, Message } from '../../Types/Utils/Messages';
import type { OffscreenContentConfig } from '../../Types/Utils/OffscreenContentConfig';

// Global instance of the screenshot processor
let screenshotProcessor: SlideScreenshotProcessor | null = null;

// @ts-ignore
export default defineBackground(() => {
  console.log('SlideHarvest background script initialized');

  // Initialize screenshot processor
  screenshotProcessor = new SlideScreenshotProcessor();

  /**
   * Handle PDF download requests
   */
  const removePdfDownloadListener = listen<void>((msg: Message<void>, sender) => {
    if (msg.type === MessageType.DOWNLOAD_PDF) {
      console.log('PDF download request received');
      handlePdfDownloadRequest();
    }
  });

  
  /**
   * Handle PDF download request (legacy support)
   */
  async function handlePdfDownloadRequest(): Promise<void> {
    try {
      console.log('Processing PDF download request...');
      await processIframe();
    } catch (error) {
      console.error('Error processing PDF download:', error);
    }
  }

 

  // Cleanup function
  return () => {
    console.log('Background script cleanup');
    removePdfDownloadListener();
    
    // Cleanup screenshot processor
    if (screenshotProcessor) {
      screenshotProcessor.CleanUp().catch(console.error);
      screenshotProcessor = null;
    }
  };
});
