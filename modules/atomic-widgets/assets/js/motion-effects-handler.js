/**
 * Simple Motion Effects Handler
 * Adds dummy bounce animation to elements with data-motion-effects attribute
 */
class SimpleMotionEffectsHandler {
    constructor() {
        this.init();
    }

    init() {
        console.log('🎬 SimpleMotionEffectsHandler initializing...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.findAndInitElements());
        } else {
            this.findAndInitElements();
        }
    }

    findAndInitElements() {
        const elements = document.querySelectorAll('[data-motion-effects="enabled"]');
        console.log(`🔍 Found ${elements.length} elements with motion effects`);

        elements.forEach((element, index) => {
            console.log(`📦 Element ${index}:`, element);
            this.applyDummyAnimation(element);
        });
    }

    applyDummyAnimation(element) {
        console.log('🎭 Applying dummy bounce animation');
        
        // Add dummy CSS animation directly
        element.style.animationName = 'bounce';
        element.style.animationDuration = '2s';
        element.style.animationFillMode = 'both';
        element.style.animationTimingFunction = 'ease-in-out';
        element.style.animationIterationCount = '1';
        
        console.log('✅ Dummy animation applied');
    }
}

// Initialize when script loads
console.log('🎬 Simple Motion Effects Handler script loaded');
new SimpleMotionEffectsHandler();
