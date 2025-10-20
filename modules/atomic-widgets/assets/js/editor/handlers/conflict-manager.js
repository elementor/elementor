// handlers/conflict-manager.js
import { animate } from 'motion';

export class ConflictManager {
    constructor(element) {
        this.element = element;
        this.originalStyles = {};
        this.conflictingProperties = [];
        this.useCSSVariables = false;
        
        this.captureOriginalStyles();
        this.identifyConflicts();
        this.setupConflictResolution();
    }
    
    captureOriginalStyles() {
        const computed = getComputedStyle(this.element);
        
        this.originalStyles = {
            opacity: computed.opacity !== '1' ? computed.opacity : null,
            transform: computed.transform !== 'none' ? computed.transform : null,
            filter: computed.filter !== 'none' ? computed.filter : null
        };
        
        console.log('Captured original styles:', this.originalStyles);
    }
    
    identifyConflicts() {
        // Check for potential conflicts
        if (this.originalStyles.opacity) {
            this.conflictingProperties.push('opacity');
        }
        
        if (this.originalStyles.transform) {
            this.conflictingProperties.push('transform');
        }
        
        console.log('Identified conflicting properties:', this.conflictingProperties);
    }
    
    setupConflictResolution() {
        // Use CSS variables for better performance if many conflicts
        this.useCSSVariables = this.conflictingProperties.length > 1;
        
        if (this.useCSSVariables) {
            this.setupCSSVariables();
        }
    }
    
    setupCSSVariables() {
        const style = this.element.style;
        
        // Set up CSS custom properties
        style.setProperty('--motion-opacity-multiplier', '1');
        style.setProperty('--motion-x', '0px');
        style.setProperty('--motion-y', '0px');
        style.setProperty('--motion-scale', '1');
        style.setProperty('--motion-rotate', '0deg');
        
        // Update element's CSS to use variables
        if (this.conflictingProperties.includes('opacity')) {
            const baseOpacity = this.originalStyles.opacity || '1';
            style.opacity = `calc(${baseOpacity} * var(--motion-opacity-multiplier))`;
        }
        
        if (this.conflictingProperties.includes('transform')) {
            const baseTransform = this.originalStyles.transform || '';
            style.transform = `${baseTransform} translateX(var(--motion-x)) translateY(var(--motion-y)) scale(var(--motion-scale)) rotate(var(--motion-rotate))`;
        }
    }
    
    applyMotionStyles(motionStyles, options = {}) {
        if (this.useCSSVariables) {
            this.applyCSSVariableStyles(motionStyles, options);
        } else {
            this.applyDirectStyles(motionStyles, options);
        }
    }
    
    applyCSSVariableStyles(motionStyles, options) {
        const updates = {};
        
        if ('opacity' in motionStyles) {
            updates['--motion-opacity-multiplier'] = motionStyles.opacity;
        }
        
        if ('transform' in motionStyles) {
            const transforms = this.parseTransformFunctions(motionStyles.transform);
            
            if (transforms.translateX) updates['--motion-x'] = transforms.translateX;
            if (transforms.translateY) updates['--motion-y'] = transforms.translateY;
            if (transforms.scale) updates['--motion-scale'] = transforms.scale;
            if (transforms.rotate) updates['--motion-rotate'] = transforms.rotate;
        }
        
        // Apply CSS variable updates
        Object.entries(updates).forEach(([property, value]) => {
            this.element.style.setProperty(property, value);
        });
    }
    
    applyDirectStyles(motionStyles, options) {
        const finalStyles = { ...motionStyles };
        
        // Handle opacity conflicts
        if ('opacity' in motionStyles && this.conflictingProperties.includes('opacity')) {
            const motionOpacity = parseFloat(motionStyles.opacity);
            const originalOpacity = parseFloat(this.originalStyles.opacity || '1');
            finalStyles.opacity = (motionOpacity * originalOpacity).toString();
        }
        
        // Handle transform conflicts
        if ('transform' in motionStyles && this.conflictingProperties.includes('transform')) {
            finalStyles.transform = this.combineTransforms(
                this.originalStyles.transform,
                motionStyles.transform
            );
        }
        
        // Apply styles
        if (options.duration) {
            animate(this.element, finalStyles, {
                duration: options.duration,
                ease: options.ease || "linear"
            });
        } else {
            Object.assign(this.element.style, finalStyles);
        }
    }
    
    combineTransforms(existingTransform, motionTransform) {
        if (!existingTransform) return motionTransform;
        if (!motionTransform) return existingTransform;
        
        const existingFunctions = this.parseTransformFunctions(existingTransform);
        const motionFunctions = this.parseTransformFunctions(motionTransform);
        
        // Motion functions override existing ones of the same type
        const combined = { ...existingFunctions, ...motionFunctions };
        
        return Object.entries(combined)
            .map(([func, value]) => `${func}(${value})`)
            .join(' ');
    }
    
    parseTransformFunctions(transformString) {
        const functions = {};
        const regex = /(\w+)\(([^)]+)\)/g;
        let match;
        
        while ((match = regex.exec(transformString)) !== null) {
            functions[match[1]] = match[2];
        }
        
        return functions;
    }
    
    getOriginalStyle(property) {
        return this.originalStyles[property];
    }
    
    onEntranceAnimationComplete() {
        // Restore original styles after entrance animation
        if (this.useCSSVariables) {
            // Reset CSS variables to neutral values
            this.element.style.setProperty('--motion-opacity-multiplier', '1');
            this.element.style.setProperty('--motion-x', '0px');
            this.element.style.setProperty('--motion-y', '0px');
            this.element.style.setProperty('--motion-scale', '1');
            this.element.style.setProperty('--motion-rotate', '0deg');
        } else {
            // Remove inline styles to let CSS classes take over
            if (this.conflictingProperties.includes('opacity')) {
                this.element.style.removeProperty('opacity');
            }
            
            if (this.conflictingProperties.includes('transform')) {
                this.element.style.removeProperty('transform');
            }
        }
    }
    
    resetElement() {
        // Reset all motion styles
        if (this.useCSSVariables) {
            this.element.style.setProperty('--motion-opacity-multiplier', '1');
            this.element.style.setProperty('--motion-x', '0px');
            this.element.style.setProperty('--motion-y', '0px');
            this.element.style.setProperty('--motion-scale', '1');
            this.element.style.setProperty('--motion-rotate', '0deg');
        } else {
            this.element.style.removeProperty('opacity');
            this.element.style.removeProperty('transform');
            this.element.style.removeProperty('filter');
        }
    }
}


