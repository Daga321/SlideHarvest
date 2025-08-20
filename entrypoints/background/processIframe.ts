import DownloadFile from "../../src/utils/DownloadFile";
import GeneratePdf from "../../src/utils/GeneratePdf";
import { listen, sendMessage } from '../../src/utils/Messaging';
import { Message, MessageType } from '../../Types/Utils/Messages';
import type { CaptureTabResponse } from '../../Types/Utils/CaptureTabResponse';
import type { OffscreenDocument } from '../../Types/Utils/OffscreenDocument';


export default async function processIframe(): Promise<void> {
    try {
        // URL for the iframe to capture
        const iframeUrl = 'https://www.canva.com/design/DADj-4dm8eI/lqfBhzaWxbygT5b4HvZPGQ/view?embed';

        console.log('Starting iframe processing for URL:', iframeUrl);
        
        // Debug: Check what APIs are available
        console.log('Available APIs:', {
            chrome: !!(globalThis as any).chrome,
            browser: !!(globalThis as any).browser,
            chromeTabs: !!(globalThis as any).chrome?.tabs,
            browserTabs: !!(globalThis as any).browser?.tabs
        });

        // Create a visible tab for testing
        const tab = await createVisibleTab(iframeUrl);

        // Wait for the tab to load
        await waitForTabToLoad(tab.id);

        // Capture screenshots and convert to blobs
        const imageBlobs: Blob[] = await captureTabScreenshots(tab.id);

        console.log(`Captured ${imageBlobs.length} images for PDF generation`);

        if (imageBlobs.length === 0) {
            throw new Error('No images were captured from the tab');
        }

        // Generate PDF from captured images
        const pdfArrayBuffer = await GeneratePdf(imageBlobs);

        // Download the generated PDF
        await DownloadFile(pdfArrayBuffer, 'slides.pdf');

        console.log('PDF generation and download completed successfully');

        // Close the tab after processing
        await (globalThis as any).browser?.tabs?.remove(tab.id);

    } catch (error) {
        console.error('Error processing iframe:', error);
    }
}

async function createVisibleTab(url: string): Promise<any> {
    try {
        console.log('Creating visible tab for URL:', url);
        
        // Try chrome API first, then browser API
        let tabsAPI = (globalThis as any).chrome?.tabs;
        let apiType = 'chrome';
        
        if (!tabsAPI) {
            tabsAPI = (globalThis as any).browser?.tabs;
            apiType = 'browser';
        }
        
        if (!tabsAPI) {
            throw new Error('Neither chrome.tabs nor browser.tabs API is available');
        }
        
        console.log(`Using ${apiType} tabs API, creating tab...`);
        
        // Wrap in Promise for compatibility
        const tab = await new Promise((resolve, reject) => {
            const result = tabsAPI.create({
                url: url,
                active: false // Don't focus the tab to avoid interrupting user
            });
            
            // Handle both callback and promise styles
            if (result && typeof result.then === 'function') {
                result.then(resolve).catch(reject);
            } else if (result) {
                resolve(result);
            } else {
                // If no result and no promise, it might be callback style
                setTimeout(() => {
                    reject(new Error('Tab creation timeout'));
                }, 5000);
            }
        });

        if (!tab) {
            throw new Error('Failed to create tab - no tab returned');
        }

        console.log('Created tab with ID:', (tab as any).id);
        return tab;
        
    } catch (error) {
        console.error('Error creating visible tab:', error);
        throw new Error(`Failed to create tab: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

async function waitForTabToLoad(tabId: number): Promise<void> {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error('Tab loading timeout'));
        }, 15000); // 15 second timeout

        const checkTabStatus = async () => {
            try {
                const tab = await (globalThis as any).browser?.tabs?.get(tabId);
                
                if (tab.status === 'complete') {
                    clearTimeout(timeoutId);
                    console.log('Tab loaded successfully');
                    // Wait additional time for content to render
                    setTimeout(resolve, 3000);
                } else {
                    // Check again in 500ms
                    setTimeout(checkTabStatus, 500);
                }
            } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        };

        checkTabStatus();
    });
}

async function captureTabScreenshots(tabId: number): Promise<Blob[]> {
    try {
        console.log('Capturing screenshot for tab ID:', tabId);
        
        // Capture the tab
        const dataUrl = await (globalThis as any).browser?.tabs?.captureTab(tabId, {
            format: 'png',
            quality: 90
        });

        if (!dataUrl) {
            throw new Error('Failed to capture tab screenshot');
        }

        console.log('Screenshot captured successfully');
        
        // Convert data URL to blob
        const blob = dataURLToBlob(dataUrl);
        
        return [blob];
        
    } catch (error) {
        console.error('Error capturing tab screenshot:', error);
        throw error;
    }
}

// Helper function to convert data URL to Blob
function dataURLToBlob(dataURL: string): Blob {
    const base64 = dataURL.split(',')[1];
    const mimeType = dataURL.split(',')[0].split(':')[1].split(';')[0];

    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}

// OFFSCREEN FUNCTIONS (Commented out for now - using visible tab for testing)
/*
async function ensureOffscreenDocument(): Promise<void> {
    // ... offscreen code
}

async function captureIframeScreenshots(url: string): Promise<Blob[]> {
    // ... offscreen code
}

const removeTabCaptureListener = listen<void>((message: Message<void>) => {
    // ... offscreen code
});

async function handleTabCaptureRequest(): Promise<void> {
    // ... offscreen code
}

async function captureOffscreenTab(): Promise<string> {
    // ... offscreen code
}
*/
