export type Message<T = any> = {
  type: string;
  payload?: T;
};

// Enum for message types
export enum MessageType {
  PRESENTATION_IFRAMES = "PRESENTATION_IFRAMES",
  REQUEST_PRESENTATION_IFRAMES = "REQUEST_PRESENTATION_IFRAMES",
  FOCUS_IFRAMES = "FOCUS_IFRAMES"
}