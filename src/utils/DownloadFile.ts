export default async function DownloadFile(arrayBuffer: ArrayBuffer, filename: string, mimeType?: string) {
  try {
    // Determine MIME type based on file extension if not provided
    let contentType = mimeType;
    if (!contentType) {
      const extension = filename.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'pdf':
          contentType = 'application/pdf';
          break;
        default:
          contentType = 'application/octet-stream';
      }
    }

    // Convert to base64 data URL
    const uint8Array = new Uint8Array(arrayBuffer);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64 = btoa(binaryString);
    const dataUrl = `data:${contentType};base64,${base64}`;
    
    // Use Browser Downloads API to download the file
    const downloadId = await browser.downloads.download({
      url: dataUrl,
      filename: filename,
      saveAs: true // This will show the save dialog
    });
    
    console.log(`Download started for ${filename} with ID:`, downloadId);
    
  } catch (error) {
    console.error(`Error downloading ${filename}:`, error);
    throw error;
  }
}
