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
  DOWNLOAD_PDF = "DOWNLOAD_PDF"
}