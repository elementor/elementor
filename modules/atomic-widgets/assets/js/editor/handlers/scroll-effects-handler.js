console.log('🚀 Atomic Motion Effects v2.1 - Safe Version Loading...');

/**
 * Main orchestrator for Motion Effects on Atomic Widgets
 * SAFE VERSION - Does not modify existing CSS classes or styles
 */
class AtomicMotionEffects {
    constructor() {
        this.motion = null;
        this.scrollHandler = null;
        this.conflictManager = null;
        this.initialized = false;
        
        console.log('🎬 AtomicMotionEffects constructor called');
        this.init();
    }

    async init() {
        console.log('🔍 Initializing Motion Effects...');
        
        // Wait for Motion.js library
        if (!await this.waitForMotion()) {
            console.error('❌ Motion.js library not available');
            return;
        }
        
        // Initialize handlers (safely)
        this.initializeHandlers();
        
        // Find and process atomic widgets (safely)
        this.processAtomicWidgets();
        
        this.initialized = true;
        console.log('✅ AtomicMotionEffects fully initialized');
    }

    waitForMotion(maxAttempts = 50) {
        return new Promise((resolve) => {
            let attempts = 0;
            
            const checkMotion = () => {
                attempts++;
                console.log(`🔍 Checking for Motion.js (attempt ${attempts})`);
                
                // Check different possible locations
                if (typeof animate !== 'undefined') {
                    this.motion = { animate };
                    console.log('✅ Found global animate function');
                    resolve(true);
                    return;
                }
                
                if (window.Motion && window.Motion.animate) {
                    this.motion = window.Motion;
                    console.log('✅ Found Motion.js in window.Motion');
                    resolve(true);
                    return;
                }
                
                if (window.motion && window.motion.animate) {
                    this.motion = window.motion;
                    console.log('✅ Found Motion.js in window.motion');
                    resolve(true);
                    return;
                }
                
                if (attempts >= maxAttempts) {
                    console.error('❌ Motion.js not found after maximum attempts');
                    resolve(false);
                    return;
                }
                
                setTimeout(checkMotion, 100);
            };
            
            checkMotion();
        });
    }

    initializeHandlers() {
        console.log('🔧 Initializing handlers safely...');
        
        try {
            // Initialize scroll handler if available
            if (typeof ScrollEffectsHandler !== 'undefined') {
                this.scrollHandler = new ScrollEffectsHandler(this.motion);
                console.log('✅ ScrollEffectsHandler initialized');
            } else {
                console.warn('⚠️ ScrollEffectsHandler not found - using fallback');
            }
            
            // Initialize conflict manager if available
            if (typeof ConflictManager !== 'undefined') {
                this.conflictManager = new ConflictManager();
                console.log('✅ ConflictManager initialized');
            } else {
                console.warn('⚠️ ConflictManager not found - skipping conflict resolution');
            }
            
        } catch (error) {
            console.error('❌ Error initializing handlers:', error);
        }
    }

    processAtomicWidgets() {
        console.log('🔍 Looking for atomic widgets with motion effects...');
        
        // Find atomic widgets with motion effects data
        const atomicWidgets = this.findAtomicWidgetsWithMotion();
        console.log(`🎯 Found ${atomicWidgets.length} atomic widgets with motion effects`);
        
        if (atomicWidgets.length === 0) {
            console.log('ℹ️ No atomic widgets with motion effects found');
            // Let's also check what we do have for debugging
            this.debugAvailableElements();
            return;
        }
        
        // Process each widget SAFELY
        atomicWidgets.forEach((element, index) => {
            this.processElementSafely(element, index);
        });
    }

    findAtomicWidgetsWithMotion() {
        // Look for atomic widgets (class contains elementor-widget-e-) with motion data
        const selector = '[class*="elementor-widget-e-"][data-motion-effects]';
        const elements = document.querySelectorAll(selector);
        
        console.log(`🔍 Selector used: ${selector}`);
        console.log(`📊 Raw results: ${elements.length} elements`);
        
        // If no elements found with data attributes, let's check without data attributes for debugging
        if (elements.length === 0) {
            const atomicElements = document.querySelectorAll('[class*="elementor-widget-e-"]');
            console.log(`🔍 Total atomic widgets found: ${atomicElements.length}`);
            
            atomicElements.forEach((el, i) => {
                console.log(`📦 Atomic widget ${i}:`, {
                    classes: el.className,
                    hasMotionData: !!el.dataset.motionEffects,
                    dataAttributes: Object.keys(el.dataset)
                });
            });
        }
        
        return Array.from(elements);
    }

    debugAvailableElements() {
        console.log('🔍 Debug: Checking all available elements...');
        
        // Check for any elements with motion data
        const elementsWithData = document.querySelectorAll('[data-motion-effects]');
        console.log(`📊 Elements with motion data: ${elementsWithData.length}`);
        
        // Check for atomic widgets
        const atomicWidgets = document.querySelectorAll('[class*="elementor-widget-e-"]');
        console.log(`📦 Total atomic widgets: ${atomicWidgets.length}`);
        
        // List first few atomic widgets
        atomicWidgets.forEach((element, index) => {
            if (index < 5) {
                console.log(`📦 Atomic widget ${index}:`, {
                    classes: element.className,
                    hasMotionData: !!element.dataset.motionEffects,
                    allDataAttributes: Object.keys(element.dataset)
                });
            }
        });
    }

    processElementSafely(element, index) {
        console.log(`🎯 Processing atomic widget ${index} SAFELY:`, {
            element: element,
            classes: element.className,
            hasData: !!element.dataset.motionEffects
        });
        
        try {
            // SAFETY CHECK: Store original styles before any modifications
            const originalClasses = element.className;
            const originalStyle = element.getAttribute('style') || '';
            
            console.log(`💾 Storing original state for element ${index}:`, {
                classes: originalClasses,
                style: originalStyle
            });
            
            // Parse motion effects data
            const motionData = this.parseMotionData(element);
            if (!motionData) {
                console.warn(`⚠️ No valid motion data for element ${index}`);
                return;
            }
            
            console.log(`📊 Motion data for element ${index}:`, motionData);
            
            // Check device compatibility
            if (!this.isDeviceCompatible(motionData)) {
                console.log(`📱 Element ${index} not compatible with current device`);
                return;
            }
            
            // SAFE: Only resolve conflicts if conflict manager exists and is safe
            if (this.conflictManager && this.conflictManager.isSafe) {
                this.conflictManager.resolveConflicts(element, motionData);
            } else {
                console.log(`⚠️ Skipping conflict resolution for safety`);
            }
            
            // Create animations without modifying existing styles
            this.createSafeAnimations(element, motionData, index);
            
            // SAFETY CHECK: Verify element integrity
            if (element.className !== originalClasses) {
                console.error(`❌ Classes were modified! Restoring...`);
                element.className = originalClasses;
            }
            
        } catch (error) {
            console.error(`❌ Error processing element ${index}:`, error);
            // Restore element if something went wrong
            this.restoreElement(element, index);
        }
    }

    createSafeAnimations(element, motionData, index) {
        console.log(`🎭 Creating SAFE animations for element ${index}`);
        
        // Handle scroll effects safely
        if (motionData.scroll) {
            if (this.scrollHandler && this.scrollHandler.createSafeScrollEffect) {
                console.log(`🌊 Creating SAFE scroll effects for element ${index}`);
                this.scrollHandler.createSafeScrollEffect(element, motionData.scroll, index);
            } else {
                console.log(`🌊 Creating fallback scroll effects for element ${index}`);
                this.createFallbackScrollEffect(element, motionData.scroll, index);
            }
        }
        
        // Handle entrance effects safely
        if (motionData.entrance && motionData.entrance.type) {
            console.log(`🎬 Creating SAFE entrance effect for element ${index}`);
            this.createSafeEntranceEffect(element, motionData.entrance, index);
        }
        
        // Mark element as processed (safely)
        element.setAttribute('data-motion-processed', 'true');
    }

    createFallbackScrollEffect(element, scrollData, index) {
        try {
            console.log(`🌊 Creating fallback scroll animation for element ${index}`);
            
            // Use Intersection Observer instead of direct style manipulation
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        console.log(`👁️ Element ${index} in view`);
                        
                        // Create animation without modifying existing styles
                        if (this.motion && this.motion.animate) {
                            this.motion.animate(element, {
                                opacity: [0.8, 1],
                                y: [10, 0]
                            }, {
                                duration: 0.8,
                                ease: 'easeOut'
                            });
                        }
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            });
            
            observer.observe(element);
            console.log(`✅ Fallback scroll observer created for element ${index}`);
            
        } catch (error) {
            console.error(`❌ Fallback scroll effect failed for element ${index}:`, error);
        }
    }

    createSafeEntranceEffect(element, entranceData, index) {
        try {
            console.log(`🎬 Creating SAFE entrance animation: ${entranceData.type}`);
            
            if (this.motion && this.motion.animate) {
                this.motion.animate(element, {
                    opacity: [0.9, 1],
                    scale: [0.98, 1]
                }, {
                    duration: entranceData.duration || 0.6,
                    delay: (entranceData.delay || 0) + (index * 0.1),
                    ease: 'easeOut'
                });
            }
            
            console.log(`✅ Safe entrance animation created for element ${index}`);
            
        } catch (error) {
            console.error(`❌ Safe entrance animation failed for element ${index}:`, error);
        }
    }

    parseMotionData(element) {
        try {
            const rawData = element.dataset.motionEffects;
            if (!rawData) {
                return null;
            }
            
            const motionData = JSON.parse(rawData);
            console.log('📋 Parsed motion data:', motionData);
            
            return motionData;
        } catch (error) {
            console.error('❌ Error parsing motion data:', error);
            return null;
        }
    }

    isDeviceCompatible(motionData) {
        if (!motionData.devices || !Array.isArray(motionData.devices)) {
            return true; // Default to compatible
        }
        
        const currentDevice = this.detectDevice();
        const isCompatible = motionData.devices.includes(currentDevice);
        
        console.log(`📱 Device check: ${currentDevice}, Compatible: ${isCompatible}`);
        return isCompatible;
    }

    detectDevice() {
        const width = window.innerWidth;
        
        if (width <= 767) return 'mobile';
        if (width <= 1024) return 'tablet';
        return 'desktop';
    }

    restoreElement(element, index) {
        console.log(`🔧 Attempting to restore element ${index}`);
        // Add restoration logic if needed
    }

    refresh() {
        console.log('🔄 Refreshing atomic motion effects...');
        
        if (!this.initialized) {
            console.warn('⚠️ Not initialized yet, skipping refresh');
            return;
        }
        
        this.processAtomicWidgets();
    }

    getDebugInfo() {
        return {
            initialized: this.initialized,
            motionAvailable: !!this.motion,
            scrollHandlerAvailable: !!this.scrollHandler,
            conflictManagerAvailable: !!this.conflictManager,
            processedElements: document.querySelectorAll('[data-motion-processed]').length,
            totalAtomicWidgets: document.querySelectorAll('[class*="elementor-widget-e-"]').length,
            atomicWidgetsWithData: document.querySelectorAll('[class*="elementor-widget-e-"][data-motion-effects]').length
        };
    }
}

// Initialize when DOM is ready
function initializeAtomicMotionEffects() {
    console.log('🚀 Starting SAFE Atomic Motion Effects initialization...');
    
    // Create global instance
    window.AtomicMotionEffectsInstance = new AtomicMotionEffects();
    
    // Expose debug function globally
    window.debugMotionEffects = () => {
        console.table(window.AtomicMotionEffectsInstance.getDebugInfo());
    };
}

// Multiple initialization strategies
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAtomicMotionEffects);
} else {
    setTimeout(initializeAtomicMotionEffects, 100);
}

window.addEventListener('load', () => {
    if (!window.AtomicMotionEffectsInstance) {
        initializeAtomicMotionEffects();
    }
});

console.log('📝 SAFE Atomic Motion Effects script loaded');