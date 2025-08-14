import { hello } from "./Hello";

// @ts-ignore
export default defineContentScript({
  matches: ["*://*/*"],
  main() {
    hello();
  },
});
