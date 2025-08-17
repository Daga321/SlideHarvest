export function focusIframe(id: string) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({
            behavior: "smooth", 
            block: "center",    
            inline: "nearest"
        });
  }
}
