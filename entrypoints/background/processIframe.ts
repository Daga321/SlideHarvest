import DownloadFile from "../../src/utils/DownloadFile";
import GeneratePdf from "../../src/utils/GeneratePdf"

export default async function processIframe(){
    try {
        // Image paths
        const imagePaths = [
            'assets/test-page-1.jpg',
            'assets/test-page-2.jpg'
        ];

        // Fetch images as blobs
        const imageBlobs: Blob[] = [];
        for (const imagePath of imagePaths) {
            const imageUrl = browser.runtime.getURL(imagePath);
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${imagePath}`);
            }
            const blob = await response.blob();
            imageBlobs.push(blob);
        }

        console.log(`Fetched ${imageBlobs.length} images for PDF generation`);

        // Generate PDF from images
        const pdfArrayBuffer = await GeneratePdf(imageBlobs);
        
        // Download the PDF
        await DownloadFile(pdfArrayBuffer, 'slides.pdf');
        
        console.log('PDF generation and download completed successfully');
        
    } catch (error) {
        console.error('Error processing iframe:', error);
    }
}