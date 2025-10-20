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

// Check immediately what's available
console.log('🔍 Immediate check:');
console.log('typeof animate:', typeof animate);
console.log('window.animate:', window.animate);

// Wait for DOM and all scripts to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, checking again:');
    console.log('typeof animate:', typeof animate);
    console.log('window.animate:', window.animate);
    
    setTimeout(checkAndStart, 1000);
});

window.addEventListener('load', function() {
    console.log('🌍 Window loaded, final check:');
    console.log('typeof animate:', typeof animate);
    console.log('window.animate:', window.animate);
    
    checkAndStart();
});

function checkAndStart() {
    console.log('🧪 checkAndStart called');
    
    if (typeof animate !== 'undefined') {
        console.log('✅ Motion.js animate function found!');
        startAnimations();
    } else {
        console.log('❌ Motion.js animate function not found');
        // List all global functions that might be related
        const globals = Object.keys(window).filter(key => 
            key.includes('motion') || key.includes('animate') || key.includes('Motion')
        );
        console.log('🔍 Related globals found:', globals);

        console.log('🔍 Checking the Motion global:', window.Motion);
if (window.Motion) {
    console.log('Motion properties:', Object.keys(window.Motion));
    if (window.Motion.animate) {
        console.log('✅ Found Motion.animate!');
        window.animate = window.Motion.animate;
        startAnimations();
        return;
    }
}
        
        // Try fallback animation
        startFallbackAnimations();
    }
}

function startAnimations() {
    console.log('🎬 Starting Motion.js animations');
    
    const elements = document.querySelectorAll('h1, h2, h3, .elementor-widget-e-heading');
    console.log(`Found ${elements.length} elements to animate`);
    
    elements.forEach((element, index) => {
        if (index < 3) {
            console.log(`🎯 Animating element ${index}:`, element.tagName);
            
            try {
                const animation = animate(element, {
                    opacity: [0.5, 1],
                    transform: ['translateY(20px)', 'translateY(0px)']
                }, {
                    duration: 1,
                    delay: index * 0.2
                });
                
                console.log(`✅ Animation ${index} successful:`, animation);
            } catch (error) {
                console.error(`❌ Animation ${index} failed:`, error);
            }
        }
    });
}

function startFallbackAnimations() {
    console.log('🔧 Starting fallback Web Animations API');
    
    const elements = document.querySelectorAll('h1, h2, h3, .elementor-widget-e-heading');
    console.log(`Found ${elements.length} elements for fallback animation`);
    
    elements.forEach((element, index) => {
        if (index < 3) {
            try {
                const animation = element.animate([
                    { opacity: 0.5, transform: 'translateY(20px)' },
                    { opacity: 1, transform: 'translateY(0px)' }
                ], {
                    duration: 1000,
                    delay: index * 200,
                    fill: 'forwards'
                });
                
                console.log(`✅ Fallback animation ${index} created`);
                animation.play();
                
            } catch (error) {
                console.error(`❌ Fallback animation ${index} failed:`, error);
            }
        }
    });
}

console.log('📝 Script setup complete');

function startMotionAnimations(animateFunc) {
    console.log('🎬 Starting Motion.js animations');
    
    // Focus specifically on atomic e-heading widgets
    const eHeadings = document.querySelectorAll('.elementor-widget-e-heading');
    const regularHeadings = document.querySelectorAll('h1, h2, h3:not(.elementor-widget-e-heading h1, .elementor-widget-e-heading h2, .elementor-widget-e-heading h3)');
    
    console.log(`🎯 Found ${eHeadings.length} e-heading atomic widgets`);
    console.log(`📝 Found ${regularHeadings.length} regular headings`);
    
    // Animate e-heading widgets with dramatic effects
    eHeadings.forEach((element, index) => {
        console.log(`🚀 Creating dramatic scroll animation for e-heading ${index}:`, element);
        
        try {
            if (window.Motion.scroll) {
                console.log('🌊 Using Motion.js scroll for e-heading');
                
                // Create dramatic scroll-triggered animation for atomic widgets
                window.Motion.scroll(
                    animateFunc(element, {
                        opacity: [0, 1, 0],
                        y: [-100, 0, 100],
                        scale: [0.7, 1.2, 0.7],
                        rotate: [-10, 0, 10],
                        backgroundColor: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"]
                    }),
                    {
                        target: element,
                        offset: ["start end", "start start", "center center", "end end", "end start"]
                    }
                );
                
                console.log(`✅ Dramatic e-heading scroll animation ${index} created`);
                
                // Also add a secondary animation for the text inside
                const headingText = element.querySelector('h1, h2, h3, h4, h5, h6, .elementor-heading-title');
                if (headingText) {
                    window.Motion.scroll(
                        animateFunc(headingText, {
                            color: ["#333", "#ff0000", "#00ff00", "#0000ff", "#ff00ff"],
                            textShadow: [
                                "0 0 0px rgba(0,0,0,0)",
                                "2px 2px 4px rgba(0,0,0,0.3)",
                                "4px 4px 8px rgba(0,0,0,0.5)",
                                "2px 2px 4px rgba(0,0,0,0.3)",
                                "0 0 0px rgba(0,0,0,0)"
                            ]
                        }),
                        {
                            target: element,
                            offset: ["start end", "start center", "center center", "end center", "end start"]
                        }
                    );
                    
                    console.log(`✅ Text effects added for e-heading ${index}`);
                }
                
            } else {
                console.log('📱 Using fallback for e-heading');
                createDramaticFallback(element, index);
            }
            
        } catch (error) {
            console.error(`❌ E-heading animation ${index} failed:`, error);
            createDramaticFallback(element, index);
        }
    });
    
    // Add data attributes to e-headings for debugging
    eHeadings.forEach((element, index) => {
        element.setAttribute('data-motion-debug', `e-heading-${index}`);
        element.style.transition = 'all 0.3s ease'; // Smooth transitions
    });
}

function createDramaticFallback(element, index) {
    console.log(`🎭 Creating dramatic fallback for e-heading ${index}`);
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log(`🎬 E-heading ${index} in view - triggering dramatic animation`);
                
                const animation = element.animate([
                    { 
                        opacity: 0,
                        transform: 'translateY(-50px) scale(0.8) rotate(-5deg)',
                        backgroundColor: '#ff6b6b',
                        color: '#ffffff'
                    },
                    { 
                        opacity: 1,
                        transform: 'translateY(0px) scale(1.1) rotate(0deg)',
                        backgroundColor: '#4ecdc4',
                        color: '#333333'
                    },
                    { 
                        opacity: 1,
                        transform: 'translateY(0px) scale(1) rotate(0deg)',
                        backgroundColor: 'transparent',
                        color: 'inherit'
                    }
                ], {
                    duration: 2000,
                    delay: index * 200,
                    fill: 'forwards',
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
                });
                
                animation.play();
                console.log(`✅ Dramatic fallback animation ${index} playing`);
                
            } else {
                console.log(`👁️ E-heading ${index} out of view`);
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '100px'
    });
    
    observer.observe(element);
}

// Test function specifically for e-headings
function testEHeadingEffects() {
    console.log('🧪 Testing e-heading specific effects');
    
    const eHeadings = document.querySelectorAll('.elementor-widget-e-heading');
    console.log(`🎯 Testing ${eHeadings.length} e-heading widgets`);
    
    eHeadings.forEach((element, index) => {
        // Add visual indicators
        element.style.border = '2px solid #ff6b6b';
        element.style.padding = '10px';
        element.style.margin = '20px 0';
        
        console.log(`📍 E-heading ${index}:`, {
            element: element,
            classes: element.className,
            text: element.textContent?.substring(0, 50) + '...',
            position: element.getBoundingClientRect()
        });
    });
}

// Run the e-heading test
setTimeout(testEHeadingEffects, 3000);