console.log('🚀 Simple interactions handler loaded');

function initInteractions() {
    // Wait for Motion.js animate function
    if (typeof animate === 'undefined' && !window.Motion?.animate) {
        console.log('⏳ Waiting for animate function...');
        setTimeout(initInteractions, 100);
        return;
    }

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

    const elements = document.querySelectorAll('[data-interactions]');

    elements.forEach((element, index) => {
        console.log(`🎬 Setting up element ${index} for scroll animation`);
        
        // Parse the data-interactions attribute
        const interactionsData = element.getAttribute('data-interactions');
        let interactions = [];
        
        try {
            interactions = JSON.parse(interactionsData);
            console.log(`📋 Parsed interactions for element ${index}:`, interactions);
        } catch (error) {
            console.error(`❌ Failed to parse interactions data for element ${index}:`, error);
            return;
        }

        // Process each interaction
        interactions.forEach((interaction, interactionIndex) => {
            const animationType = interaction.animation;
            console.log(`🎭 Processing animation type: ${animationType}`);

            // Get animation keyframes based on type
            const keyframes = getAnimationKeyframes(animationType);
            
            if (!keyframes) {
                console.warn(`⚠️ Unknown animation type: ${animationType}`);
                return;
            }

            try {
                inViewFunc(element, () => {
                    console.log(`🎬 Animating ${animationType} for element ${index}, interaction ${interactionIndex}`);
                    
                    // Apply the animation with hardcoded options
                    animateFunc(element, keyframes, { duration: 1, easing: 'ease-in-out' });
                    
                    // Return cleanup function for when element exits viewport
                    return () => {
                        console.log(`🎬 Element ${index} exiting viewport`);
                        // You can add exit animations here if needed
                    };
                }, { 
                    root: null, // Relative to viewport
                    amount: 0.1 // Trigger when 10% visible
                });
            } catch (error) {
                console.error(`❌ Inview failed for element ${index}, interaction ${interactionIndex}:`, error);
            }
        });
    });
}

/**
 * Get animation keyframes based on animation type
 * @param {string} animationType - The type of animation (e.g., 'fade-in-left')
 * @returns {Object|null} Animation keyframes object
 */
function getAnimationKeyframes(animationType) {
    const animations = {
        'fade-in-left': { 
            opacity: [0, 1], 
            x: [-100, 0] 
        }
        // Add more animation types here as needed
        // 'fade-in-right': { opacity: [0, 1], x: [100, 0] },
        // 'fade-in-up': { opacity: [0, 1], y: [50, 0] }
    };

    return animations[animationType] || null;
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInteractions);
} else {
    initInteractions();
}