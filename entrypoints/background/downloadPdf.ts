
export default async function downloadPdf() {
  try {
    // Get the extension's URL for the PDF file
    const pdfUrl = browser.runtime.getURL('assets/test.pdf');
    
    // Fetch the PDF file as array buffer
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    
    // Convert to base64 data URL
    const uint8Array = new Uint8Array(arrayBuffer);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64 = btoa(binaryString);
    const dataUrl = `data:application/pdf;base64,${base64}`;
    
    // Use Chrome Downloads API to download the file
    const downloadId = await browser.downloads.download({
      url: dataUrl,
      filename: 'test.pdf',
      saveAs: true // This will show the save dialog
    });
    
  } catch (error) {
    console.error('Error downloading PDF:', error);
  }
}