// console.log('🚀 atomic-motion-effects.js loaded');

// // Simple version without ES6 imports
// class AtomicMotionEffects {
//     constructor() {
//         console.log('🎬 AtomicMotionEffects constructor called');
//         this.init();
//     }

//     init() {
//         console.log('🔍 Checking for Motion.js...');
        
//         // Wait for Motion.js to be available
//         if (typeof motion === 'undefined') {
//             console.log('⏳ Motion.js not ready, waiting...');
//             setTimeout(() => this.init(), 100);
//             return;
//         }

//         console.log('✅ Motion.js is available:', motion);
//         this.findAndInitElements();
//     }

//     findAndInitElements() {
//         // Find all atomic widgets
//         const atomicWidgets = document.querySelectorAll('[class*="elementor-widget-e-"]');
//         console.log(`🔍 Found ${atomicWidgets.length} atomic widgets`);

//         atomicWidgets.forEach((element, index) => {
//             console.log(`📦 Widget ${index}:`, element.className);
            
//             // Add scroll effects to e-heading widgets
//             if (element.classList.contains('elementor-widget-e-heading')) {
//                 console.log('🎯 Found e-heading widget, adding scroll effect');
//                 this.createScrollEffect(element);
//             }
//         });

//         // Also check for data attributes
//         const elementsWithData = document.querySelectorAll('[data-motion-effects]');
//         console.log(`📊 Found ${elementsWithData.length} elements with motion-effects data`);
        
//         elementsWithData.forEach(element => {
//             try {
//                 const settings = JSON.parse(element.dataset.motionEffects);
//                 if (settings.scroll && settings.scroll.enabled) {
//                     this.createScrollEffect(element);
//                 }
//             } catch (error) {
//                 console.error('Error parsing motion effects:', error);
//             }
//         });
//     }

//     createScrollEffect(element) {
//         console.log('🌊 Creating scroll effect for:', element);
        
//         try {
//             // Simple scroll animation
//             motion.scroll(
//                 motion.animate(element, {
//                     opacity: [0.3, 1, 0.3],
//                     y: [-50, 0, 50]
//                 }),
//                 {
//                     target: element,
//                     offset: ["start end", "center center", "end start"]
//                 }
//             );
            
//             console.log('✅ Scroll effect created successfully');
//         } catch (error) {
//             console.error('❌ Error creating scroll effect:', error);
//         }
//     }
// }

// // Initialize when ready
// console.log('🚀 Starting AtomicMotionEffects...');

// function initMotionEffects() {
//     new AtomicMotionEffects();
// }

// // Try multiple initialization methods
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', initMotionEffects);
// } else {
//     initMotionEffects();
// }

// // Also try after a short delay for safety
// setTimeout(initMotionEffects, 500);

console.log('🚀 atomic-motion-effects.js loaded');

// Motion Effects Handler for new repeater data structure
class MotionEffectsHandler {
    constructor() {
        this.init();
    }

    init() {
        console.log('🎬 MotionEffectsHandler initializing...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.processMotionEffects());
        } else {
            this.processMotionEffects();
        }
    }

    processMotionEffects() {
        console.log('🔍 Processing motion effects...');
        
        // Find all elements with motion effects data
        const elementsWithMotionEffects = document.querySelectorAll('[data-motion-effects]');
        console.log(`📊 Found ${elementsWithMotionEffects.length} elements with motion effects data`);
        
        elementsWithMotionEffects.forEach((element, index) => {
            try {
                const motionEffectsData = JSON.parse(element.dataset.motionEffects);
                console.log(`🎯 Processing element ${index}:`, motionEffectsData);
                
                if (Array.isArray(motionEffectsData) && motionEffectsData.length > 0) {
                    this.applyMotionEffects(element, motionEffectsData);
                }
            } catch (error) {
                console.error(`❌ Error parsing motion effects for element ${index}:`, error);
        }
    });
}

    applyMotionEffects(element, motionEffects) {
        console.log('🎭 Applying motion effects:', motionEffects);
        
        motionEffects.forEach((effect, index) => {
            console.log(`🎬 Applying effect ${index}:`, effect);
            
            // Validate effect structure
            if (!this.isValidMotionEffect(effect)) {
                console.warn(`⚠️ Invalid motion effect at index ${index}:`, effect);
                return;
            }
            
            // Apply the effect based on trigger
            if (effect.trigger === 'scroll-into-view') {
                this.createScrollIntoViewEffect(element, effect);
            } else if (effect.trigger === 'scroll-out-of-view') {
                this.createScrollOutOfViewEffect(element, effect);
            }
        });
    }

    isValidMotionEffect(effect) {
        const requiredFields = ['trigger', 'animation', 'type', 'direction'];
        return requiredFields.every(field => effect.hasOwnProperty(field));
    }

    createScrollIntoViewEffect(element, effect) {
        console.log('🌊 Creating scroll into view effect:', effect);
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                    console.log('👁️ Element in view, triggering animation:', effect);
                    this.triggerAnimation(element, effect);
                    observer.unobserve(element); // Only trigger once
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        observer.observe(element);
    }

    createScrollOutOfViewEffect(element, effect) {
        console.log('🌊 Creating scroll out of view effect:', effect);
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    console.log('👁️ Element out of view, triggering animation:', effect);
                    this.triggerAnimation(element, effect);
            }
        });
    }, {
            threshold: 0.1,
            rootMargin: '50px'
    });
    
    observer.observe(element);
}

    triggerAnimation(element, effect) {
        console.log('🎬 Triggering animation:', effect);
        
        // Create animation based on effect properties
        const animationConfig = this.getAnimationConfig(effect);
        
        if (window.Motion && window.Motion.animate) {
            // Use Motion.js if available
            try {
                window.Motion.animate(element, animationConfig.keyframes, animationConfig.options);
                console.log('✅ Motion.js animation applied');
            } catch (error) {
                console.error('❌ Motion.js animation failed:', error);
                this.applyFallbackAnimation(element, animationConfig);
            }
        } else {
            // Use fallback Web Animations API
            this.applyFallbackAnimation(element, animationConfig);
        }
    }

    getAnimationConfig(effect) {
        const { animation, type, direction } = effect;
        
        let keyframes = [];
        let options = {
            duration: 1000,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            fill: 'forwards'
        };
        
        // Define keyframes based on animation type and direction
        if (animation === 'fade') {
            keyframes = type === 'in' 
                ? [{ opacity: 0 }, { opacity: 1 }]
                : [{ opacity: 1 }, { opacity: 0 }];
        } else if (animation === 'scale') {
            keyframes = type === 'in'
                ? [{ transform: 'scale(0.8)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }]
                : [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0.8)', opacity: 0 }];
        } else if (animation === 'slide') {
            const translateValue = this.getSlideDirection(direction, type);
            keyframes = type === 'in'
                ? [{ transform: translateValue, opacity: 0 }, { transform: 'translate(0, 0)', opacity: 1 }]
                : [{ transform: 'translate(0, 0)', opacity: 1 }, { transform: translateValue, opacity: 0 }];
        }
        
        return { keyframes, options };
    }

    getSlideDirection(direction, type) {
        const distance = '50px';
        const multiplier = type === 'in' ? -1 : 1;
        
        switch (direction) {
            case 'up':
                return `translate(0, ${multiplier * parseInt(distance)}px)`;
            case 'down':
                return `translate(0, ${multiplier * -parseInt(distance)}px)`;
            case 'left':
                return `translate(${multiplier * parseInt(distance)}px, 0)`;
            case 'right':
                return `translate(${multiplier * -parseInt(distance)}px, 0)`;
            default:
                return `translate(0, ${multiplier * parseInt(distance)}px)`;
        }
    }

    applyFallbackAnimation(element, animationConfig) {
        console.log('🔧 Applying fallback animation');
        
        try {
            const animation = element.animate(animationConfig.keyframes, animationConfig.options);
            animation.play();
            console.log('✅ Fallback animation applied');
        } catch (error) {
            console.error('❌ Fallback animation failed:', error);
        }
    }
}

// Initialize the motion effects handler
new MotionEffectsHandler();

console.log('📝 Motion Effects Handler initialized');