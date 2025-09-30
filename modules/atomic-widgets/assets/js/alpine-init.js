import Alpine from '@alpinejs/csp';
import { init } from '@elementor/frontend-handlers';

// Initialize Alpine.js
window.Alpine = Alpine;
Alpine.start();

// Initialize the frontend handlers system
init();
