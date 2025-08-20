import html2canvas from 'html2canvas';
import { sendMessage } from '../../src/utils/Messaging';
import { MessageType } from '../../Types/Utils/Messages';

/**
 * Captures a screenshot of the current slide presentation and sends it back
 * @param slideIndex - The index of the current slide being captured
 * @param totalSlides - Total number of slides to capture
 */
export async function takeScreenshot(slideIndex: number, totalSlides: number): Promise<void> {
  try {
    // Wait a bit for the slide to fully load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Find the main content area (usually the presentation container)
    const presentationContainer = document.querySelector('[role="main"]') ||
                                 document.querySelector('.slide') ||
                                 document.querySelector('.presentation') ||
                                 document.body;

    if (!presentationContainer) {
      throw new Error('Could not find presentation container');
    }

    // Configure html2canvas options for optimal PDF capture
    const canvas = await html2canvas(presentationContainer as HTMLElement, {
      width: 1920,
      height: 1080,
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      removeContainer: true,
      imageTimeout: 5000,
      logging: false
    });

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        }
      }, 'image/png', 0.9);
    });

    if (!blob) {
      throw new Error('Failed to create image blob');
    }

    // Convert blob to base64 for message passing
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      
      // Send the screenshot back to background script
      sendMessage({
        type: MessageType.SCREENSHOT_RESPONSE,
        payload: {
          slideIndex,
          totalSlides,
          imageData: base64Data,
          width: canvas.width,
          height: canvas.height
        }
      });
    };
    reader.readAsDataURL(blob);

  } catch (error) {
    console.error('Error taking screenshot:', error);
    
    // Send error response
    sendMessage({
      type: MessageType.SCREENSHOT_RESPONSE,
      payload: {
        slideIndex,
        totalSlides,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}

/**
 * Navigates to the next slide in the presentation
 * @returns Promise that resolves when navigation is complete
 */
export async function navigateToNextSlide(): Promise<boolean> {
  try {
    // Common selectors for next slide buttons
    const nextSelectors = [
      '[aria-label*="next"]',
      '[aria-label*="Next"]',
      '.next-slide',
      '.slide-next',
      '[data-testid*="next"]',
      'button[title*="next"]',
      'button[title*="Next"]'
    ];

    let nextButton: HTMLElement | null = null;

    // Try to find next button
    for (const selector of nextSelectors) {
      nextButton = document.querySelector(selector) as HTMLElement;
      if (nextButton) break;
    }

    // If no button found, try keyboard navigation
    if (!nextButton) {
      // Try arrow key navigation
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        code: 'ArrowRight',
        bubbles: true
      }));
      
      // Wait for potential slide change
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    }

    // Click the next button
    nextButton.click();
    
    // Wait for slide transition
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;

  } catch (error) {
    console.error('Error navigating to next slide:', error);
    return false;
  }
}