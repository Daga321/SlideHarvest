/**
 * Options for screenshot capture
 */
export interface ScreenshotCaptureOptions {
    /** Image format (png, jpeg) */
    format: 'png' | 'jpeg';
    /** Image quality for jpeg (0-100) */
    quality: number;
}