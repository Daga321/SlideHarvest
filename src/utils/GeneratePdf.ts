import jsPDF from "jspdf";

export default async function GeneratePdf(imageBlobs: Blob[]): Promise<ArrayBuffer> {
  try {
    // Create a new PDF document
    const pdf = new jsPDF({
      orientation: 'landscape', // or 'portrait' depending on your slides
      unit: 'px',
      format: [1920, 1080] // Adjust size as needed
    });

    for (let i = 0; i < imageBlobs.length; i++) {
      const blob = imageBlobs[i];
      
      // Convert blob to base64
      const base64 = await blobToBase64(blob);
      
      // Add new page for each image except the first one
      if (i > 0) {
        pdf.addPage();
      }
      
      // Add image to PDF
      pdf.addImage(
        base64,
        'JPEG', // or 'PNG' depending on your image format
        0, 0,
        1920, 1080, // Full page size
        undefined,
        'FAST'
      );
    }

    // Generate PDF as ArrayBuffer
    const pdfArrayBuffer = pdf.output('arraybuffer');
    return pdfArrayBuffer;
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

// Helper function to convert blob to base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}