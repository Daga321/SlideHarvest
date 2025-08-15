
/**
 * Finds all iframes in the page and returns the URLs of those that are presentations (Google Slides, PowerPoint, etc).
 * @returns string[] Array of presentation iframe URLs
 */
export function getPresentationIframes(): string[] {
	const iframes = Array.from(document.querySelectorAll('iframe'));
	// Expanded patterns for presentations
	const patterns = [
		/docs\.google\.com\/(presentation|embed)/i, // Google Slides
		/office\.com\/embed\/powerpoint/i, // PowerPoint Online
		/onedrive\.live\.com\/embed/i, // OneDrive embed
		/1drv\.ms\/p\/c\//i, // OneDrive short URL
		/prezi\.com\/(p\/embed|view)\//i, // Prezi embed/view
		/slideshare\.net\/slideshow\/embed_code/i, // SlideShare
		/canva\.com\/design\//i // Canva
	];
	return iframes
		.map(iframe => iframe.src)
		.filter(src => patterns.some(pattern => pattern.test(src)));
}