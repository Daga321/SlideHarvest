/**
 * Offscreen document script for handling screenshot capture
 * This script runs in an offscreen document to capture screenshots
 * of content that needs to be processed for PDF generation
 */

// Browser API compatibility
const browserAPI = globalThis.browser || (globalThis as any).chrome;

/**
 * Class to handle offscreen document operations
 * Manages content loading and screenshot capture communication
 */
class OffscreenDocumentHandler {
    private contentContainer: HTMLElement;
    private loadingIndicator: HTMLElement;
    
    constructor() {
        this.contentContainer = document.getElementById('content-container')!;
        this.loadingIndicator = document.querySelector('.loading-indicator')!;
        this.initializeMessageListener();
    }
    
    /**
     * Initialize message listener for communication with background script
     */
    private initializeMessageListener(): void {
        if (browserAPI?.runtime?.onMessage) {
            browserAPI.runtime.onMessage.addListener(
                (message: any, sender: any, sendResponse: (response?: any) => void) => {
                    this.handleMessage(message, sender, sendResponse);
                    return true; // Indicates we will send a response asynchronously
                }
            );
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
        try {
            switch (message.type) {
                case 'LOAD_CONTENT_FOR_SCREENSHOT':
                    await this.loadContentForScreenshot(message.payload);
                    sendResponse({ success: true, message: 'Content loaded successfully' });
                    break;
                    
                case 'CAPTURE_SCREENSHOT':
                    const screenshotData = await this.captureScreenshot();
                    sendResponse({ success: true, data: screenshotData });
                    break;
                    
                case 'CLEANUP':
                    this.cleanup();
                    sendResponse({ success: true, message: 'Cleanup completed' });
                    break;
                    
                default:
                    sendResponse({ success: false, error: 'Unknown message type' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error' 
            });
        }
    }
    
    /**
     * Load content that needs to be captured
     * @param payload - Content loading configuration
     */
    private async loadContentForScreenshot(payload: any): Promise<void> {
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
        this.contentContainer.innerHTML = html;
    }
    
    /**
     * Wait for content to fully render
     * @param waitTime - Time to wait in milliseconds
     */
    private async waitForContentToRender(waitTime: number): Promise<void> {
        return new Promise(resolve => {
            setTimeout(resolve, waitTime);
        });
    }
    
    /**
     * Capture screenshot of the current content
     * @returns Screenshot data as blob
     */
    private async captureScreenshot(): Promise<string> {
        try {
            // Use html2canvas or similar library to capture the content
            // For now, we'll use the browser's capture API through messaging
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            if (!context) {
                throw new Error('Failed to get canvas context');
            }
            
            // Set canvas size to viewport size
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // This is a placeholder - in a real implementation, you would use
            // html2canvas or similar library to capture the DOM content
            // For now, we'll return a placeholder or use browser capture API
            
            // Convert canvas to blob
            return new Promise((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (blob) {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    } else {
                        reject(new Error('Failed to create blob from canvas'));
                    }
                }, 'image/png');
            });
            
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
        this.loadingIndicator.textContent = message;
        this.loadingIndicator.style.display = 'block';
    }
    
    /**
     * Hide loading indicator
     */
    private hideLoadingIndicator(): void {
        this.loadingIndicator.style.display = 'none';
    }
    
    /**
     * Cleanup resources
     */
    private cleanup(): void {
        this.contentContainer.innerHTML = '';
        this.showLoadingIndicator('Cleaning up...');
    }
}

// Initialize the offscreen document handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OffscreenDocumentHandler();
});

console.log('Offscreen document script loaded successfully');
