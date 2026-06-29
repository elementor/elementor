import { Alpine } from '@alpinejs/csp';

export function init() {
	document.addEventListener(
		'DOMContentLoaded',
		() => {
			Alpine.start();
		},
		{ once: true }
	);
}
