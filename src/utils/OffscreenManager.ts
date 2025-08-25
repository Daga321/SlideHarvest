import { Message, MessageType } from '../../Types/Utils/Messages';
import { OffscreenResponse } from '../../Types/Utils/OffscreenResponse';
import { OffscreenContentConfig } from '../../Types/Utils/OffscreenContentConfig';
import { sendMessageToOffscreen } from './Messaging';

// Browser API compatibility
const browserAPI = globalThis.browser || (globalThis as any).chrome;

/**
 * Utility class for managing offscreen documents
 * Handles creation, communication, and cleanup of offscreen documents
 */
export class OffscreenDocumentManager {
    private static instance: OffscreenDocumentManager;
    private isOffscreenDocumentCreated: boolean = false;
    private readonly offscreenUrl: string = 'offscreen.html';
    
    private constructor() {}
    
    /**
     * Get singleton instance of OffscreenDocumentManager
     */
    public static getInstance(): OffscreenDocumentManager {
        if (!OffscreenDocumentManager.instance) {
            OffscreenDocumentManager.instance = new OffscreenDocumentManager();
        }
        return OffscreenDocumentManager.instance;
    }
    
    /**
     * Ensure offscreen document is created and ready
     * @returns Promise that resolves when offscreen document is ready
     */
    public async ensureOffscreenDocument(): Promise<void> {
        try {
            if (this.isOffscreenDocumentCreated) {
                return;
            }
            
            // Check if offscreen document already exists
            const existingContexts = await browserAPI.runtime.getContexts({
                contextTypes: ['OFFSCREEN_DOCUMENT']
            });
            
            if (existingContexts.length > 0) {
                this.isOffscreenDocumentCreated = true;
                return;
            }
            
            // Create new offscreen document
            await browserAPI.offscreen.createDocument({
                url: this.offscreenUrl,
                reasons: ['DOM_SCRAPING'],
                justification: 'Create offscreen document for content screenshot capture'
            });
            
            this.isOffscreenDocumentCreated = true;
            console.log('Offscreen document created successfully');
            
            // Wait for the document to initialize and be ready
            await this.waitForOffscreenReady();
            
        } catch (error) {
            console.error('Error creating offscreen document:', error);
            this.isOffscreenDocumentCreated = false;
            throw new Error(`Failed to create offscreen document: ${error}`);
        }
    }
    
    /**
     * Wait for offscreen document to be ready
     */
    private async waitForOffscreenReady(): Promise<void> {
        return new Promise((resolve) => {
            // Give the offscreen document time to initialize
            setTimeout(resolve, 1000);
        });
    }
    
    /**
     * Load content in offscreen document for screenshot capture
     * @param config - Configuration for content loading
     * @returns Promise that resolves when content is loaded
     */
    public async loadContentForScreenshot(config: OffscreenContentConfig): Promise<void> {
        await this.ensureOffscreenDocument();
        
        const message: Message<OffscreenContentConfig> = {
            type: MessageType.LOAD_CONTENT_FOR_SCREENSHOT,
            payload: config
        };
        
        console.log('Sending LOAD_CONTENT_FOR_SCREENSHOT message...');
        const response = await sendMessageToOffscreen<OffscreenContentConfig, OffscreenResponse>(message);
        
        if (!response.success) {
            throw new Error(`Failed to load content: ${response.error}`);
        }
        
        console.log('Content loaded successfully in offscreen document');
    }
    
    /**
     * Capture screenshot from offscreen document
     * @returns Promise that resolves to screenshot data as base64 string
     */
    public async captureScreenshot(): Promise<string> {
        await this.ensureOffscreenDocument();
        
        const message: Message = {
            type: MessageType.CAPTURE_SCREENSHOT
        };

        console.log('Sending CAPTURE_SCREENSHOT message...');
        const response = await sendMessageToOffscreen<any, OffscreenResponse>(message);

        if (!response.success) {
            throw new Error(`Failed to capture screenshot: ${response.error}`);
        }
        
        console.log('Screenshot captured successfully from offscreen document');
        return response.data;
    }
    
    /**
     * Capture multiple screenshots with different content
     * @param contentConfigs - Array of content configurations
     * @returns Promise that resolves to array of screenshot data
     */
    public async captureMultipleScreenshots(contentConfigs: OffscreenContentConfig[]): Promise<string[]> {
        const screenshots: string[] = [];
        
        for (const config of contentConfigs) {
            await this.loadContentForScreenshot(config);
            const screenshot = await this.captureScreenshot();
            screenshots.push(screenshot);
        }
        
        return screenshots;
    }
    
    /**
     * Convert base64 data URL to Blob
     * @param dataUrl - Base64 data URL
     * @returns Blob object
     */
    public dataUrlToBlob(dataUrl: string): Blob {
        const base64 = dataUrl.split(',')[1];
        const mimeType = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    }
    
    /**
     * Cleanup offscreen document
     */
    public async cleanup(): Promise<void> {
        try {
            if (!this.isOffscreenDocumentCreated) {
                return;
            }
            
            // Send cleanup message (with shorter timeout since we're closing anyway)
            const message: Message = {
                type: MessageType.CLEANUP
            };

            try {
                console.log('Sending cleanup message to offscreen document...');
                await sendMessageToOffscreen<any, OffscreenResponse>(message, 5000); // 5 second timeout
            } catch (error) {
                console.warn('Failed to send cleanup message (document may already be closed):', (error as Error).message);
            }

            // Close offscreen document
            await browserAPI.offscreen.closeDocument();
            this.isOffscreenDocumentCreated = false;
            
            console.log('Offscreen document cleaned up successfully');
        } catch (error) {
            console.error('Error cleaning up offscreen document:', error);
        }
    }
    
    /**
     * Check if offscreen document is currently created
     */
    public isCreated(): boolean {
        return this.isOffscreenDocumentCreated;
    }
}

/**
 * Get singleton instance of OffscreenDocumentManager
 */
export default function getOffscreenManager(): OffscreenDocumentManager {
    return OffscreenDocumentManager.getInstance();
}
