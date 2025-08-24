import { ScreenshotCaptureOptions } from "./ScreenshotCaptureOptions";

/**
 * Configuration for loading content in offscreen document
 */
export interface OffscreenContentConfig {
    /** URL to load in iframe (optional) */
    url?: string;
    /** HTML content to load directly (optional) */
    html?: string;
    /** Time to wait for content to render (milliseconds) */
    waitTime: number;
    /** Screenshot capture options */
    captureOptions: ScreenshotCaptureOptions;
}