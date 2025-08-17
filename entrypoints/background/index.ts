// entrypoints/background/index.ts
import { hello } from "./Hello";

// @ts-ignore
export default defineBackground(() => {
  hello(); // Call the Hello module here
});
