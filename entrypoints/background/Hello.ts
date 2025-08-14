// entrypoints/background/Hello.ts
export function hello() {
  console.log("Hello background!", { id: browser.runtime.id });
}
