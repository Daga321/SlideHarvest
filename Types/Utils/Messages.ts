/**
 * Generic message structure for communication between different parts of the extension
 * @template T - Type of the payload data
 */
export type Message<T = any> = {
  /** The type identifier of the message */
  type: string;
  /** Optional data payload attached to the message */
  payload?: T;
};

/**
 * Enumeration of all possible message types used in the extension
 */
export enum MessageType {
  /** Message type for sending presentation iframe data */
  PRESENTATION_IFRAMES = "PRESENTATION_IFRAMES",
  /** Message type for requesting presentation iframe data */
  REQUEST_PRESENTATION_IFRAMES = "REQUEST_PRESENTATION_IFRAMES",
  /** Message type for focusing on specific iframes */
  FOCUS_IFRAMES = "FOCUS_IFRAMES",
  /** Message type for requesting PDF download */
  DOWNLOAD_PDF = "DOWNLOAD_PDF",
  /** Message type for taking screenshots of slides */
  TAKE_SCREENSHOT = "TAKE_SCREENSHOT",
  /** Message type for screenshot response */
  SCREENSHOT_RESPONSE = "SCREENSHOT_RESPONSE",
  /** Message type for PDF generation completion */
  PDF_GENERATION_COMPLETE = "PDF_GENERATION_COMPLETE",
  /** Message type for requesting tab capture */
  REQUEST_CAPTURE_TAB = "REQUEST_CAPTURE_TAB",
  /** Message type for tab capture response */
  CAPTURE_TAB_RESPONSE = "CAPTURE_TAB_RESPONSE"
}