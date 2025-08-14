//entrypoints/content/Hello.ts
export function hello() {
  const h1 = document.createElement("h1");
    h1.textContent = "Hello content.";
    h1.style.position = "fixed";
    h1.style.top = "20px";
    h1.style.left = "20px";
    h1.style.zIndex = "9999";
    h1.style.background = "white";
    h1.style.color = "black";
    h1.style.padding = "10px";
    h1.style.border = "2px solid black";
    h1.style.fontFamily = "sans-serif";
    document.body.appendChild(h1);
}
