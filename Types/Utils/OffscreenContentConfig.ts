
/**
 * Configuration for loading content in offscreen document
 */
export interface OffscreenContentConfig {
    /** URL to load in iframe (optional) */
    url?: string;
    /** Time to wait for content to render (milliseconds) */
    waitTime: number;
    /** Filename for the generated PDF (optional) */
    filename?: string;
}