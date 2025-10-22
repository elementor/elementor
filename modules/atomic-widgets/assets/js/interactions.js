console.log('🚀 Simple interactions handler loaded');

function initInteractions() {
    // Wait for Motion.js animate function
    if (typeof animate === 'undefined' && !window.Motion?.animate) {
        console.log('⏳ Waiting for animate function...');
        setTimeout(initInteractions, 100);
        return;
    }

    // Get the animate function
    const animateFunc = typeof animate !== 'undefined' ? animate : window.Motion?.animate;
    const inViewFunc = typeof inView !== 'undefined' ? inView : window.Motion?.inView;
    if (!inViewFunc) {
        console.error('❌ No inview function found');
        return;
    }
    
    if (!animateFunc) {
        console.error('❌ No animate function found');
        return;
    }

    console.log('✅ Animate function ready');

    // Find all elements with data-interactions attribute
    const elements = document.querySelectorAll('[data-interactions]');
    console.log(`🔍 Found ${elements.length} elements with data-interactions`);

    // Animate each element
    elements.forEach((element, index) => {
        console.log(`🎬 Setting up element ${index} for scroll animation`);
        
        // Set initial state
        element.style.opacity = '0';
        
        try {
            inViewFunc(element, () => {
                console.log(`🎬 Animating in view ${index}`);
                // Animate in
                animateFunc(element, { opacity: [0, 1] }, { duration: 1, easing: 'ease-in-out' });
                
                // Return cleanup function for when element exits viewport
                return () => {
                    console.log(`🎬 Element ${index} exiting viewport`);
                    // Reset to initial state for next entrance
                    animateFunc(element, { opacity: [1, 0] }, { duration: 0.5, easing: 'ease-in-out' });
                };
            }, { 
                root: null, // Relative to viewport
                amount: 0.1 // Trigger when 10% visible
            });
        } catch (error) {
            console.error(`❌ Inview failed for element ${index}:`, error);
        }
    });
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInteractions);
} else {
    initInteractions();
}