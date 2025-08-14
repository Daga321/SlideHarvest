// entrypoints/background/index.ts
import { hello } from "./Hello";

// @ts-ignore
export default defineBackground(() => {
  hello(); // Llama aquí al módulo Hello
});
