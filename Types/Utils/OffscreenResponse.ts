/**
 * Response structure for offscreen document operations
 */
export interface OffscreenResponse {
    /** Indicates if the operation was successful */
    success: boolean;
    /** Optional data payload */
    data?: any;
    /** Success or error message */
    message?: string;
    /** Error details if operation failed */
    error?: string;
    /** Screenshot data in base64 format */
    screenshot?: string;
}
