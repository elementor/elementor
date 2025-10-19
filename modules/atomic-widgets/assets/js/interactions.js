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
        console.log(`🎬 Animating element ${index}`);
        
        try {
            animateFunc(element, { opacity: [0, 1] }, { duration: 1, easing: 'ease-in-out' });
            console.log(`✅ Animation applied to element ${index}`);
        } catch (error) {
            console.error(`❌ Animation failed for element ${index}:`, error);
        }
    });
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInteractions);
} else {
    initInteractions();
}