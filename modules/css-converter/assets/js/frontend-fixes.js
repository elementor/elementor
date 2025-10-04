/**
 * Frontend fixes for Elementor CSS Converter
 * 
 * This file patches Elementor's frontend JavaScript to fix bugs that prevent
 * proper HTML attribute handling in atomic widgets.
 */

(function($) {
    'use strict';

    // Wait for Elementor to be loaded
    $(document).ready(function() {
        // Check if we're in the Elementor editor
        if (typeof elementor === 'undefined' || !elementor.config) {
            return;
        }

        // Wait for Elementor modules to be loaded
        elementor.hooks.addAction('panel/open_editor/widget', function() {
            patchAtomicElementBaseView();
        });

        // Also try to patch immediately if already loaded
        setTimeout(patchAtomicElementBaseView, 1000);
    });

    function patchAtomicElementBaseView() {
        // Find all atomic element views and patch their attributes method
        if (typeof elementor.modules === 'undefined' || 
            typeof elementor.modules.elements === 'undefined') {
            return;
        }

        // Look for atomic element views in the modules
        Object.keys(elementor.modules.elements).forEach(function(moduleName) {
            const module = elementor.modules.elements[moduleName];
            
            if (module && module.prototype && module.prototype.attributes) {
                patchAttributesMethod(module.prototype, moduleName);
            }
        });

        console.log('CSS Converter: Applied frontend patches for attribute handling');
    }

    function patchAttributesMethod(prototype, moduleName) {
        // Store the original attributes method
        const originalAttributes = prototype.attributes;
        
        console.log(`CSS Converter: Attempting to patch ${moduleName} attributes method`);
        
        // Override the attributes method with our fixed version
        prototype.attributes = function() {
            console.log(`CSS Converter: Patched attributes method called for ${moduleName}`);
            const attr = originalAttributes.call(this);
            const local = {};
            const cssId = this.model.getSetting('_cssid');
            const customAttributes = this.model.getSetting('attributes')?.value ?? [];
            const initialAttributes = this?.model?.config?.initial_attributes ?? {};

            if (cssId) {
                local.id = cssId.value;
            }

            const href = this.getHref && this.getHref();
            if (href) {
                local.href = href;
            }

            // Process custom attributes safely - handle both array and object structures
            if (customAttributes) {
                if (customAttributes._css_converter_safe && customAttributes.value) {
                    // Handle our safe object structure with string keys
                    Object.keys(customAttributes.value).forEach(function(attrKey) {
                        const attribute = customAttributes.value[attrKey];
                        const key = attribute.value?.key?.value;
                        const value = attribute.value?.value?.value;

                        if (key && value && isValidAttributeName(key)) {
                            local[key] = value;
                        }
                    });
                } else if (Array.isArray(customAttributes)) {
                    // Handle standard array structure (fallback)
                    customAttributes.forEach(function(attribute) {
                        const key = attribute.value?.key?.value;
                        const value = attribute.value?.value?.value;

                        if (key && value && isValidAttributeName(key)) {
                            local[key] = value;
                        }
                    });
                }
            }

            // FIXED: Return without spreading customAttributes to prevent numeric keys
            return {
                ...attr,
                ...initialAttributes,
                // Removed ...customAttributes spread - this was causing the bug
                ...local,
            };
        };

        console.log(`CSS Converter: Patched attributes method for ${moduleName}`);
    }

    function isValidAttributeName(name) {
        // Basic validation for HTML attribute names
        return typeof name === 'string' && 
               name.length > 0 && 
               /^[a-zA-Z][a-zA-Z0-9\-_]*$/.test(name);
    }

})(jQuery);
