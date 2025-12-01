/**
 * CSS Converter Base Styles Override
 *
 * Removes base classes from CSS converter widgets in the editor by:
 * 1. Overriding getAtomicWidgetBaseStyles to return empty object for widget containers
 * 2. Clearing htmlCache to force re-render of inner elements without base classes
 *
 * This ensures both widget containers and inner elements (p, h1, etc.) have no base classes.
 */

( function() {
	'use strict';

	// Wait for Elementor to be ready
	jQuery( window ).on( 'elementor:init', function() {
		console.log( '🔥 CSS Converter: Initializing base styles override' );

		// Store the original function
		const originalGetAtomicWidgetBaseStyles = elementor.helpers.getAtomicWidgetBaseStyles;

		// Override the function for widget container classes
		elementor.helpers.getAtomicWidgetBaseStyles = function( model ) {
			// Check if this is a CSS converter widget
			const editorSettings = model?.get?.( 'editor_settings' ) || {};
			const isConverterWidget = true === editorSettings.disable_base_styles ||
									  true === editorSettings.css_converter_widget ||
									  '0.0' === model?.get?.( 'version' );

			if ( isConverterWidget ) {
				console.log( '🔥 CSS Converter: Removing base styles for widget container:', model.get( 'widgetType' ) );
				// CSS converter widget: return empty object (no base styles)
				return {};
			}

			// Not a CSS converter widget, call original function
			return originalGetAtomicWidgetBaseStyles.call( this, model );
		};

		// Hook into document loaded event to clear htmlCache for inner elements
		elementor.on( 'document:loaded', function() {
			console.log( '🔥 CSS Converter: Document loaded, clearing htmlCache for converter widgets' );
			clearHtmlCacheForConverterWidgets();

			// Also remove base classes from DOM for preview iframe
			removeBaseClassesFromDOM();
		} );

		function clearHtmlCacheForConverterWidgets() {
			try {
				// Get all elements in the document
				const previewView = elementor.getPreviewView();
				if ( ! previewView || ! previewView.collection ) {
					console.warn( '🔥 CSS Converter: No preview view or collection found' );
					return;
				}

				const elements = previewView.collection.models;
				console.log( '🔥 CSS Converter: Processing', elements.length, 'top-level elements' );

				let processedCount = 0;
				let pendingRenders = 0;

				elements.forEach( ( element ) => {
					const { processed, pending } = processElementRecursively( element );
					processedCount += processed;
					pendingRenders += pending;
				} );

				console.log( '🔥 CSS Converter: Processed', processedCount, 'CSS converter widgets,', pendingRenders, 'pending renders' );

				// If we have pending renders, wait for them to complete then reload preview
				if ( pendingRenders > 0 ) {
					waitForAllRendersComplete( pendingRenders );
				}
			} catch ( error ) {
				console.error( '🔥 CSS Converter: Error clearing htmlCache:', error );
			}
		}

		function processElementRecursively( model ) {
			let processedCount = 0;
			let pendingRenders = 0;

			// Process current element
			const result = clearIfConverterWidget( model );
			if ( result.processed ) {
				processedCount++;
			}
			if ( result.pending ) {
				pendingRenders++;
			}

			// Recursively process child elements
			const children = model.get( 'elements' );
			if ( children && children.models ) {
				children.models.forEach( ( child ) => {
					const childResult = processElementRecursively( child );
					processedCount += childResult.processed;
					pendingRenders += childResult.pending;
				} );
			}

			return { processed: processedCount, pending: pendingRenders };
		}

		function clearIfConverterWidget( model ) {
			// Only process widgets
			if ( model.get( 'elType' ) !== 'widget' ) {
				return { processed: false, pending: false };
			}

			// Check if this is a CSS converter widget
			const editorSettings = model.get( 'editor_settings' ) || {};
			const widgetType = model.get( 'widgetType' );
			const version = model.get( 'version' );

			const isConverterWidget =
				true === editorSettings.disable_base_styles ||
				true === editorSettings.css_converter_widget ||
				'0.0' === version;

			if ( ! isConverterWidget ) {
				return { processed: false, pending: false };
			}

			console.log( '🔥 CSS Converter: Clearing htmlCache for', widgetType, 'widget ID:', model.get( 'id' ) );

			// Clear the htmlCache to force re-render
			const hadCache = !! model.getHtmlCache();
			model.setHtmlCache( null );

			// Trigger remote render if widget has remote rendering capability
			if ( model.remoteRender && hadCache ) {
				console.log( '🔥 CSS Converter: Triggering renderRemoteServer for', widgetType );

				// Add one-time listener for render completion
				model.once( 'remote:render', function() {
					console.log( '🔥 CSS Converter: Remote render completed for', widgetType );
					// Notify completion tracking
					window.cssConverterRenderCompleted && window.cssConverterRenderCompleted();
				} );

				// Check if already rendering to avoid duplicate requests
				if ( ! model.isRemoteRequestActive() ) {
					model.renderRemoteServer();
					return { processed: true, pending: true }; // Pending AJAX render
				}
				console.log( '🔥 CSS Converter: Remote request already active for', widgetType );
				return { processed: true, pending: false }; // Already rendering
			}

			return { processed: true, pending: false }; // No render needed
		}

		function waitForAllRendersComplete( pendingCount ) {
			console.log( '🔥 CSS Converter: Waiting for', pendingCount, 'renders to complete before reloading preview' );

			let completedCount = 0;

			// Set up completion tracking
			window.cssConverterRenderCompleted = function() {
				completedCount++;
				console.log( '🔥 CSS Converter: Render completed', completedCount, '/', pendingCount );

				if ( completedCount >= pendingCount ) {
					console.log( '🔥 CSS Converter: All renders complete! Reloading preview iframe...' );

					// Clean up
					delete window.cssConverterRenderCompleted;

					// Reload preview iframe to show updated HTML
					setTimeout( function() {
						elementor.reloadPreview();
					}, 100 ); // Small delay to ensure all DOM updates are complete
				}
			};

			// Fallback timeout in case some renders fail
			setTimeout( function() {
				if ( window.cssConverterRenderCompleted ) {
					console.warn( '🔥 CSS Converter: Timeout waiting for renders, reloading preview anyway' );
					delete window.cssConverterRenderCompleted;
					elementor.reloadPreview();
				}
			}, 5000 ); // 5 second timeout
		}

		function removeBaseClassesFromDOM() {
			console.log( '🔥 CSS Converter: Starting DOM-based base class removal' );

			// Try multiple times with delays to catch dynamically loaded content
			let attempts = 0;
			const maxAttempts = 5;

			function attemptRemoval() {
				attempts++;
				console.log( '🔥 CSS Converter: DOM removal attempt', attempts, 'of', maxAttempts );

				let totalRemoved = 0;

				// Remove base classes from preview iframe if it exists
				const iframe = document.querySelector( '#elementor-preview-iframe' );
				if ( iframe && iframe.contentDocument ) {
					totalRemoved += removeBaseClassesFromDocument( iframe.contentDocument );
				}

				// Also remove from main document (for editor canvas)
				totalRemoved += removeBaseClassesFromDocument( document );

				console.log( '🔥 CSS Converter: Attempt', attempts, 'removed', totalRemoved, 'base classes' );

				// If we found classes or reached max attempts, stop
				if ( totalRemoved > 0 || attempts >= maxAttempts ) {
					console.log( '🔥 CSS Converter: DOM removal completed after', attempts, 'attempts, total removed:', totalRemoved );
					return;
				}

				// Try again after a delay
				setTimeout( attemptRemoval, 500 );
			}

			// Start immediately
			attemptRemoval();

			// Also try after preview iframe loads
			const iframe = document.querySelector( '#elementor-preview-iframe' );
			if ( iframe ) {
				iframe.addEventListener( 'load', function() {
					console.log( '🔥 CSS Converter: Preview iframe loaded, attempting DOM removal' );
					setTimeout( function() {
						removeBaseClassesFromDocument( iframe.contentDocument );
					}, 100 );
				} );
			}
		}

		function removeBaseClassesFromDocument( doc ) {
			try {
				// Find all elements with base classes
				const elementsWithBaseClasses = doc.querySelectorAll( '[class*="-base"]' );
				let removedCount = 0;

				console.log( '🔥 CSS Converter: Found', elementsWithBaseClasses.length, 'elements with "-base" classes' );

				elementsWithBaseClasses.forEach( function( element ) {
					const classList = element.classList;
					const classesToRemove = [];

					// Find base classes to remove
					classList.forEach( function( className ) {
						if ( className.includes( '-base' ) &&
							 ( className.startsWith( 'e-paragraph-' ) ||
							   className.startsWith( 'e-heading-' ) ||
							   className.startsWith( 'e-button-' ) ||
							   className.startsWith( 'e-div-block-' ) ) ) {
							classesToRemove.push( className );
						}
					} );

					// Remove the base classes
					classesToRemove.forEach( function( className ) {
						element.classList.remove( className );
						removedCount++;
						console.log( '🔥 CSS Converter: Removed base class "' + className + '" from', element.tagName );
					} );
				} );

				console.log( '🔥 CSS Converter: Removed', removedCount, 'base classes from this document' );
				return removedCount;
			} catch ( error ) {
				console.error( '🔥 CSS Converter: Error removing base classes from DOM:', error );
				return 0;
			}
		}
	} );
}() );
