import DownloadFile from "../../src/utils/DownloadFile";
import GeneratePdf from "../../src/utils/GeneratePdf";
import type { OffscreenContentConfig } from '../../Types/Utils/OffscreenContentConfig';
import getOffscreenManager from '../../src/utils/OffscreenManager';

/**
 * Configuration interface for screenshot capture process
 */
interface ScreenshotProcessConfig {
    /** Array of content configurations to capture */
    contentConfig: OffscreenContentConfig;
    /** Output PDF filename */
    filename?: string;
}

/**
 * Main class for handling slide screenshot capture and PDF generation
 * Manages the entire process from content loading to PDF download
 */
export class SlideScreenshotProcessor {
    private offscreenManager = getOffscreenManager();
    private capturedScreenshots: Blob[] = [];
    private isProcessing: boolean = false;
    
    /**
     * Process slides by capturing screenshots and generating PDF
     * @param config - Configuration for the screenshot process
     */
    public async processSlides(config: ScreenshotProcessConfig): Promise<void> {
        if (this.isProcessing) {
            throw new Error('Screenshot process is already running');
        }
        
        this.isProcessing = true;
        
        try {
            console.log('Starting slide screenshot process...');
            
            // Step 1: Ensure offscreen document is ready
            console.log('Initializing offscreen document...');
            await this.offscreenManager.ensureOffscreenDocument();
            
            // Step 2: Load content in offscreen document
            console.log('Loading content for screenshot...');
            await this.offscreenManager.loadContentForScreenshot(config.contentConfig);
            
            // Step 3: Capture screenshot
            console.log('Capturing screenshot...');
            const screenshotDataUrl = await this.offscreenManager.captureScreenshot();
            
            // Step 4: Convert to blob and store
            console.log('Converting screenshot to blob...');
            const screenshotBlob = this.offscreenManager.dataUrlToBlob(screenshotDataUrl);
            this.capturedScreenshots.push(screenshotBlob);
            
            if (this.capturedScreenshots.length === 0) {
                throw new Error('No screenshots were captured successfully');
            }
            
            console.log(`Successfully captured ${this.capturedScreenshots.length} screenshots`);
            
            // Step 5: Generate PDF from captured screenshots
            console.log('Generating PDF from screenshots...');
            const pdfArrayBuffer = await GeneratePdf(this.capturedScreenshots);
            
            // Step 6: Download the generated PDF
            console.log('Initiating PDF download...');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = config.filename || `slides-${timestamp}.pdf`;
            await DownloadFile(pdfArrayBuffer, filename);

            console.log('Slide screenshot process completed successfully');
            
        } catch (error) {
            console.error('Error in slide screenshot process:', error);
            throw error; // Re-throw the error instead of masking it
        } finally {
            this.isProcessing = false;
            
            // Always attempt cleanup, but don't mask the original error
            try {
                await this.CleanUp();
            } catch (cleanupError) {
                console.error('Error during cleanup:', cleanupError);
                // Don't throw cleanup errors, just log them
            }
        }
    }

   /**
    * Clean up resources used during the screenshot process
    */
   public async CleanUp(): Promise<void> {
        try {
            console.log('Cleaning up screenshot processor resources...');
            await this.offscreenManager.cleanup();
            this.capturedScreenshots = [];
            console.log('Screenshot processor cleanup completed');
        } catch (error) {
            console.error('Error during screenshot processor cleanup:', error);
            // Don't throw cleanup errors, just log them
        }
    }
    
}

/**
 * Legacy function for backward compatibility
 * Creates a simple screenshot process with a single URL
 * @param url - URL to capture (optional, for future iframe implementation)
 */
export default async function processIframe(url?: string): Promise<void> {
    const processor = new SlideScreenshotProcessor();
    
    // For now, create a simple test configuration
    // In the future, this will process actual iframe content
    const testConfig: ScreenshotProcessConfig = {
        contentConfig: {
            html: `
                <div style="width: 100vw; height: 100vh; background: linear-gradient(45deg, #667eea 0%, #764ba2 100%); 
                        display: flex; justify-content: center; align-items: center; color: white; font-size: 48px; font-family: Arial;">
                    <div style="text-align: center;">
                        <h1>SlideHarvest Test</h1>
                        <p style="font-size: 24px;">Screenshot Capture Working!</p>
                        <p style="font-size: 18px;">${new Date().toLocaleString()}</p>
                    </div>
                </div>
            `,
            waitTime: 2000,
            captureOptions: {
                format: 'png',
                quality: 90
            }
        },
        filename: 'test-slides.pdf'
    };
    
    await processor.processSlides(testConfig);
}
