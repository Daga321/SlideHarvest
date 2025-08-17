
/**
 * Finds all iframes in the page and returns the data of those that are presentations (Google Slides, PowerPoint, etc).
 * @returns string[][] Array of [id, src] pairs for presentation iframes
 */
export function getPresentationIframes(): string[][] {
	let iframes = Array.from(document.querySelectorAll('iframe'));
	
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
	
	// Filter iframes to only those that match the presentation patterns
	iframes = iframes.filter(iframe => patterns.some(pattern => pattern.test(iframe.src)));

	// Assign unique IDs to iframes that don't have them
	iframes.forEach(iframe => {
		if (!iframe.id) {
			iframe.id = "presentation-iframe-" + Math.random().toString(36).substring(2, 9);
		}
	});
	
	// Return array of [id, src] pairs
	return iframes.map(iframe => [iframe.id, iframe.src]);
}