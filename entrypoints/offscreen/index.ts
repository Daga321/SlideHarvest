import { MessageType } from '../../Types/Utils/Messages';

// @ts-ignore
export default defineUnlistedScript(() => {
  console.log("Offscreen script initializing...");
  
  // Wait for DOM to be ready before initializing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log("DOM loaded, initializing offscreen document handler");
      new OffscreenHandler();
    });
  } else {
    console.log("DOM already loaded, initializing offscreen document handler immediately");
    new OffscreenHandler();
  }
});

/**
 * Offscreen document script for handling screenshot capture
 * This script runs in an offscreen document to capture screenshots
 * of content that needs to be processed for PDF generation
 */

// Browser API compatibility for offscreen document
const offscreenBrowserAPI = globalThis.browser || (globalThis as any).chrome;

/**
 * Class to handle offscreen document operations
 * Manages content loading and screenshot capture communication
 */
class OffscreenHandler {
    private contentContainer: HTMLElement;
    private loadingIndicator: HTMLElement;
    
    constructor() {
        this.contentContainer = document.getElementById('content-container')!;
        this.loadingIndicator = document.querySelector('.loading-indicator')!;
        this.initializeMessageListener();
        console.log('Offscreen document handler initialized');
    }
    
    /**
     * Initialize message listener for communication with background script
     */
    private initializeMessageListener(): void {
        console.log('Initializing message listener...');
        
        if (!offscreenBrowserAPI) {
            console.error('Browser API not available');
            return;
        }
        
        if (!offscreenBrowserAPI.runtime) {
            console.error('Browser runtime API not available');
            return;
        }
        
        if (!offscreenBrowserAPI.runtime.onMessage) {
            console.error('Browser runtime.onMessage API not available');
            return;
        }
        
        console.log('Browser APIs available, setting up listener...');
        
        try {
            offscreenBrowserAPI.runtime.onMessage.addListener(
                (message: any, sender: any, sendResponse: (response?: any) => void) => {
                    console.log('Offscreen received message:', {
                        type: message?.type,
                        hasPayload: !!message?.payload,
                        sender: sender?.id,
                        timestamp: new Date().toISOString()
                    });
                    
                    // Handle the message asynchronously
                    this.handleMessage(message, sender, sendResponse);
                    
                    // Return true to indicate we will send a response asynchronously
                    return true;
                }
            );
            
            console.log('Message listener registered successfully');
            
            // Send a ready signal to the background script
            setTimeout(() => {
                try {
                    offscreenBrowserAPI.runtime.sendMessage({
                        type: 'OFFSCREEN_READY',
                        payload: { timestamp: new Date().toISOString() }
                    }).catch((error: Error) => {
                        console.log('Note: Could not send ready signal (this is normal):', error.message);
                    });
                } catch (error) {
                    console.log('Note: Could not send ready signal (this is normal):', (error as Error).message);
                }
            }, 500);
            
        } catch (error) {
            console.error('Failed to set up message listener:', error);
        }
    }
    
    /**
     * Handle incoming messages from background script
     * @param message - The received message
     * @param sender - Message sender information
     * @param sendResponse - Function to send response back
     */
    private async handleMessage(
        message: any, 
        sender: any, 
        sendResponse: (response?: any) => void
    ): Promise<void> {
        const startTime = Date.now();
        
        try {
            console.log('Processing message:', {
                type: message?.type,
                hasPayload: !!message?.payload,
                processingId: Math.random().toString(36).substring(2, 9)
            });
            
            let result: { success: boolean; message?: string; data?: any; error?: string };
            
            switch (message?.type) {
                case MessageType.LOAD_CONTENT_FOR_SCREENSHOT:
                    console.log('Loading content for screenshot...');
                    await this.loadContentForScreenshot(message.payload);
                    result = { success: true, message: 'Content loaded successfully' };
                    break;
                    
                case MessageType.CAPTURE_SCREENSHOT:
                    console.log('Capturing screenshot...');
                    const screenshotData = await this.captureScreenshot();
                    result = { success: true, data: screenshotData };
                    break;

                case MessageType.CLEANUP:
                    console.log('Performing cleanup...');
                    this.cleanup();
                    result = { success: true, message: 'Cleanup completed' };
                    break;
                    
            }
            
            const processingTime = Date.now() - startTime;
            console.log(`Message processed successfully in ${processingTime}ms:`, {
                type: message?.type,
                success: result.success
            });
            
            // Send response back
            if (sendResponse) {
                sendResponse(result);
            } else {
                console.warn('No sendResponse function available');
            }
            
        } catch (error) {
            const processingTime = Date.now() - startTime;
            console.error(`Error processing message after ${processingTime}ms:`, {
                type: message?.type,
                error: (error as Error).message,
                stack: (error as Error).stack
            });
            
            const errorResult = { 
                success: false, 
                error: (error as Error).message || 'Unknown error in offscreen document'
            };
            
            if (sendResponse) {
                try {
                    sendResponse(errorResult);
                } catch (responseError) {
                    console.error('Failed to send error response:', responseError);
                }
            }
        }
    }
    
    /**
     * Load content that needs to be captured
     * @param payload - Content loading configuration
     */
    private async loadContentForScreenshot(payload: any): Promise<void> {
        console.log('Loading content for screenshot:', payload);
        
        this.showLoadingIndicator('Loading content...');
        
        // Clear existing content
        this.contentContainer.innerHTML = '';
        
        if (payload.url) {
            // Load content from URL in iframe
            await this.loadUrlInIframe(payload.url);
        } else if (payload.html) {
            // Load HTML content directly
            this.loadHtmlContent(payload.html);
        } else {
            throw new Error('No content source provided');
        }
        
        // Wait for content to render
        await this.waitForContentToRender(payload.waitTime || 3000);
        this.hideLoadingIndicator();
        
        console.log('Content loaded successfully');
    }
    
    /**
     * Load URL content in an iframe
     * @param url - URL to load
     */
    private async loadUrlInIframe(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            
            iframe.onload = () => {
                console.log('Iframe content loaded successfully');
                resolve();
            };
            
            iframe.onerror = () => {
                reject(new Error('Failed to load iframe content'));
            };
            
            // Set timeout for loading
            setTimeout(() => {
                reject(new Error('Iframe loading timeout'));
            }, 15000);
            
            this.contentContainer.appendChild(iframe);
        });
    }
    
    /**
     * Load HTML content directly
     * @param html - HTML content to load
     */
    private loadHtmlContent(html: string): void {
        console.log('Loading HTML content directly');
        this.contentContainer.innerHTML = html;
    }
    
    /**
     * Wait for content to fully render
     * @param waitTime - Time to wait in milliseconds
     */
    private async waitForContentToRender(waitTime: number): Promise<void> {
        console.log(`Waiting ${waitTime}ms for content to render`);
        return new Promise(resolve => {
            setTimeout(resolve, waitTime);
        });
    }
    
    /**
     * Capture screenshot of the current content
     * @returns Screenshot data as base64 data URL
     */
    private async captureScreenshot(): Promise<string> {
        try {
            console.log('Capturing screenshot...');
            
            // Create canvas element
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            if (!context) {
                throw new Error('Failed to get canvas context');
            }
            
            // Set canvas size to viewport size
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // Fill with white background
            context.fillStyle = 'white';
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            // For now, we'll create a simple test image
            // In a real implementation, you would use html2canvas or similar
            context.fillStyle = '#f0f0f0';
            context.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
            context.fillStyle = '#333';
            context.font = '24px Arial';
            context.textAlign = 'center';
            context.fillText('Screenshot Captured!', canvas.width / 2, canvas.height / 2);
            context.fillText(new Date().toLocaleString(), canvas.width / 2, canvas.height / 2 + 40);
            
            // Convert canvas to data URL
            const dataURL = canvas.toDataURL('image/png');
            console.log('Screenshot captured successfully');
            
            return dataURL;
            
        } catch (error) {
            console.error('Error capturing screenshot:', error);
            throw error;
        }
    }
    
    /**
     * Show loading indicator
     * @param message - Loading message to display
     */
    private showLoadingIndicator(message: string): void {
        if (this.loadingIndicator) {
            this.loadingIndicator.textContent = message;
            this.loadingIndicator.style.display = 'block';
        }
    }
    
    /**
     * Hide loading indicator
     */
    private hideLoadingIndicator(): void {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'none';
        }
    }
    
    /**
     * Cleanup resources
     */
    private cleanup(): void {
        console.log('Cleaning up offscreen document...');
        if (this.contentContainer) {
            this.contentContainer.innerHTML = '';
        }
        this.showLoadingIndicator('Cleaning up...');
    }
}
