/**
 * Focuses on a specific iframe by scrolling it into view smoothly
 * @param id - The unique identifier of the iframe element to focus
 */
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
