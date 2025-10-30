
function initInteractions() {
    if (typeof animate === 'undefined' && !window.Motion?.animate) {
        setTimeout(initInteractions, 100);
        return;
    }

    const animateFunc = typeof animate !== 'undefined' ? animate : window.Motion?.animate;
    const inViewFunc = typeof inView !== 'undefined' ? inView : window.Motion?.inView;
    
    if (!inViewFunc || !animateFunc) {
        return;
    }
    
    const elements = document.querySelectorAll('[data-interactions]');

    elements.forEach((element) => {

        const interactionsData = element.getAttribute('data-interactions');
        let interactions = [];
        
        try {
            interactions = JSON.parse(interactionsData);
        } catch (error) {
            return;
        }

        interactions.forEach(() => {
            try {
                inViewFunc(element, () => {
                    
                    animateFunc(element, { 
                        opacity: [0, 1], 
                        x: [-100, 0] 
                    }, { duration: 1, easing: 'ease-in-out' });
                    
                    
                    return () => {}
                
                }, { 
                    root: null, 
                    amount: 0.1 
                });
            } catch (error) {
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