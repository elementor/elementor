import { Alpine } from '@alpinejs/csp';

export function init() {
	document.addEventListener(
		'elementor/frontend/init',
		() => {
			Alpine.start();
		},
		{ once: true }
	);
}
