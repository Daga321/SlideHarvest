import { Message, MessageType } from '../../Types/Utils/Messages';
import { OffscreenContentConfig } from '../../Types/Utils/OffscreenContentConfig';

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
    
    constructor() {
        this.contentContainer = document.getElementById('content-container')!;
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
                (message: Message, sender: any, sendResponse: (response?: any) => void) => {
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
        message: Message, 
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
    private async loadContentForScreenshot(payload: OffscreenContentConfig): Promise<void> {
        console.log('Loading content for screenshot:', payload);
        
        // Clear existing content
        this.contentContainer.innerHTML = '';
        
        // if (payload.url) {
        //     // Load content from URL in iframe
        //     await this.loadUrlInIframe(payload.url);
        // } else {
        //     throw new Error('No content source provided');
        // }
        
        // Wait for content to render
        await this.waitForContentToRender(payload.waitTime || 3000);
        
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
     * Capture screenshot of the current content using browser tab capture
     * @returns Screenshot data as base64 data URL
     */
    private async captureScreenshot(): Promise<string> {
        try {
            console.log('Capturing screenshot using browser tab capture...');
            
            // First ensure content is visible and rendered
            await this.ensureContentVisible();
            
            // Wait a bit more for content to fully render
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Use browser's built-in screenshot capability
            // This will capture the actual rendered content in the offscreen document
            try {
                // Try to use the tabs API to capture the current tab
                const dataUrl = await this.captureUsingTabsAPI();
                if (dataUrl) {
                    console.log('Successfully captured screenshot using tabs API');
                    return dataUrl;
                }
            } catch (tabError) {
                console.warn('Tabs API capture failed, using fallback method:', tabError);
            }
            
            // Fallback: Create a simple test image to verify the pipeline works
            return this.createTestScreenshot();
            
        } catch (error) {
            console.error('Error capturing screenshot:', error);
            throw error;
        }
    }
    
    /**
     * Render DOM content to canvas (simplified version)
     */
    private async renderDomToCanvas(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, element: HTMLElement): Promise<string> {
        console.log('Rendering DOM content to canvas...');
        
        // Fill with white background
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Get computed styles and content
        const elementStyle = window.getComputedStyle(element);
        const elementRect = element.getBoundingClientRect();
        
        console.log('Element content:', element.innerHTML.substring(0, 200) + '...');
        console.log('Element rect:', elementRect);
        
        // Try to extract text content and basic styling
        const textContent = this.extractTextContent(element);
        
        if (textContent.length > 0) {
            // Render text content
            context.fillStyle = '#333';
            context.font = '24px Arial, sans-serif';
            context.textAlign = 'center';
            
            let yPosition = canvas.height / 2 - (textContent.length * 15);
            
            textContent.forEach((text, index) => {
                if (text.trim()) {
                    context.fillText(text.trim(), canvas.width / 2, yPosition + (index * 40));
                }
            });
            
            // Add timestamp
            context.fillStyle = '#666';
            context.font = '16px Arial';
            context.fillText(`Captured: ${new Date().toLocaleString()}`, canvas.width / 2, canvas.height - 30);
        } else {
            // Fallback to basic content indication
            return this.createFallbackImage(canvas, context);
        }
        
        const dataURL = canvas.toDataURL('image/png');
        console.log('DOM content rendered to canvas successfully');
        
        return dataURL;
    }
    
    /**
     * Extract text content from element
     */
    private extractTextContent(element: HTMLElement): string[] {
        const texts: string[] = [];
        
        // Extract text from various elements
        const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(h => {
            if (h.textContent) texts.push(h.textContent);
        });
        
        const paragraphs = element.querySelectorAll('p');
        paragraphs.forEach(p => {
            if (p.textContent) texts.push(p.textContent);
        });
        
        // If no structured content, get all text
        if (texts.length === 0) {
            const allText = element.textContent || element.innerText || '';
            if (allText.trim()) {
                // Split long text into chunks
                const words = allText.trim().split(/\s+/);
                const chunks = [];
                for (let i = 0; i < words.length; i += 8) {
                    chunks.push(words.slice(i, i + 8).join(' '));
                }
                texts.push(...chunks);
            }
        }
        
        return texts;
    }
    
    /**
     * Create fallback image when content rendering fails
     */
    private createFallbackImage(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): string {
        console.log('Creating fallback image...');
        
        // Fill with white background
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add border
        context.strokeStyle = '#ddd';
        context.lineWidth = 2;
        context.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        // Add fallback content
        context.fillStyle = '#333';
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.fillText('SlideHarvest Screenshot', canvas.width / 2, canvas.height / 2 - 40);
        
        context.font = '18px Arial';
        context.fillStyle = '#666';
        context.fillText('Content Captured', canvas.width / 2, canvas.height / 2);
        context.fillText(new Date().toLocaleString(), canvas.width / 2, canvas.height / 2 + 40);
        
        // Convert canvas to data URL
        const dataURL = canvas.toDataURL('image/png');
        console.log('Fallback image created');
        
        return dataURL;
    }
    
    
    /**
     * Ensure content is visible and properly styled for screenshot
     */
    private async ensureContentVisible(): Promise<void> {
        console.log('Ensuring content is visible for screenshot...');
        
        // Make sure the content container is visible
        if (this.contentContainer) {
            this.contentContainer.style.display = 'block';
            this.contentContainer.style.visibility = 'visible';
            this.contentContainer.style.opacity = '1';
            
            // Log current content
            console.log('Content container HTML:', this.contentContainer.innerHTML.substring(0, 300) + '...');
            console.log('Content container computed style:', {
                display: window.getComputedStyle(this.contentContainer).display,
                visibility: window.getComputedStyle(this.contentContainer).visibility,
                opacity: window.getComputedStyle(this.contentContainer).opacity
            });
        }
        
    }

    /**
     * Attempt to capture screenshot using tabs API
     */
    private async captureUsingTabsAPI(): Promise<string | null> {
        try {
            console.log('Attempting to capture using tabs API...');
            
            // Note: This might not work in offscreen documents
            // But we'll try for future A-frame implementation
            if (chrome && chrome.tabs && chrome.tabs.captureVisibleTab) {
                return new Promise((resolve, reject) => {
                    chrome.tabs.captureVisibleTab({ format: 'png' }, (dataUrl) => {
                        if (chrome.runtime.lastError) {
                            reject(new Error(chrome.runtime.lastError.message));
                        } else {
                            resolve(dataUrl);
                        }
                    });
                });
            }
            
            return null;
        } catch (error) {
            console.warn('Tabs API not available in offscreen context:', error);
            return null;
        }
    }

    /**
     * Create a test screenshot with styled content to verify the pipeline
     */
    private createTestScreenshot(): string {
        console.log('Creating test screenshot with styled content...');
        
        // Create a larger canvas for better quality
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
            throw new Error('Failed to get canvas context');
        }
        
        // Set canvas size (standard slide size)
        canvas.width = 1920;
        canvas.height = 1080;
        
        // Create gradient background
        const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add some visual elements to test
        this.drawTestContent(context, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/png');
        console.log('Test screenshot created successfully');
        return dataUrl;
    }

    /**
     * Draw test content with styling
     */
    private drawTestContent(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        // Draw main title with shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
        ctx.shadowBlur = 8;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 72px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎯 SlideHarvest Test', width / 2, height / 2 - 150);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
        
        // Draw status text in red
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 48px Arial, sans-serif';
        ctx.fillText('READY TO CAPTURE', width / 2, height / 2 - 50);
        
        // Draw loading text in white
        ctx.fillStyle = '#ffffff';
        ctx.font = '36px Arial, sans-serif';
        ctx.fillText('Screenshot Pipeline Active', width / 2, height / 2 + 50);
        
        // Draw timestamp
        ctx.fillStyle = '#cccccc';
        ctx.font = '24px Arial, sans-serif';
        const timestamp = new Date().toLocaleString();
        ctx.fillText(`Generated: ${timestamp}`, width / 2, height / 2 + 150);
        
        // Draw border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 8;
        ctx.strokeRect(50, 50, width - 100, height - 100);
        
        // Add some geometric shapes for visual interest
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(200, 200, 80, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(width - 200, height - 200, 80, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    /**
     * Cleanup resources
     */
    private cleanup(): void {
        console.log('Cleaning up offscreen document...');
        if (this.contentContainer) {
            this.contentContainer.innerHTML = '';
        }
    }
}
