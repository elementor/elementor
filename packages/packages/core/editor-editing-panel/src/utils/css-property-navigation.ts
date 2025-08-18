import { type CSSPropertyMapping, getCSSPropertyMapping } from './css-property-search-map';

export type NavigationResult = {
	success: boolean;
	message?: string;
};

/**
 * Service for navigating to CSS properties in the style panel
 */
export class CSSPropertyNavigationService {
	private sectionStateSetters = new Map< string, ( expanded: boolean ) => void >();
	private sectionRefs = new Map< string, React.RefObject< HTMLElement > >();

	/**
	 * Register a section for navigation
	 * @param sectionName
	 * @param setExpanded
	 * @param ref
	 */
	registerSection(
		sectionName: string,
		setExpanded: ( expanded: boolean ) => void,
		ref?: React.RefObject< HTMLElement >
	): void {
		this.sectionStateSetters.set( sectionName, setExpanded );
		if ( ref ) {
			this.sectionRefs.set( sectionName, ref );
		}
	}

	/**
	 * Unregister a section (cleanup)
	 * @param sectionName
	 */
	unregisterSection( sectionName: string ): void {
		this.sectionStateSetters.delete( sectionName );
		this.sectionRefs.delete( sectionName );
	}

	/**
	 * Navigate to a CSS property
	 * @param cssProperty
	 */
	async navigateToProperty( cssProperty: string ): Promise< NavigationResult > {
		const mapping = getCSSPropertyMapping( cssProperty );

		if ( ! mapping ) {
			return {
				success: false,
				message: `CSS property "${ cssProperty }" not found in mapping`,
			};
		}

		return this.navigateToSection( mapping.section, mapping );
	}

	/**
	 * Navigate to a section by name
	 * @param sectionName
	 * @param propertyMapping
	 */
	async navigateToSection( sectionName: string, propertyMapping?: CSSPropertyMapping ): Promise< NavigationResult > {
		const setExpanded = this.sectionStateSetters.get( sectionName );
		const sectionRef = this.sectionRefs.get( sectionName );

		if ( ! setExpanded ) {
			return {
				success: false,
				message: `Section "${ sectionName }" is not registered for navigation`,
			};
		}

		try {
			// 1. Collapse all other sections for better focus
			this.collapseAllSectionsExcept( sectionName );

			// 2. Small delay to let other sections start collapsing
			await new Promise( ( resolve ) => setTimeout( resolve, 100 ) );

			// 3. Expand the target section
			setExpanded( true );

			// 4. Wait for the section to expand (React state update + Collapse animation)
			await new Promise( ( resolve ) => setTimeout( resolve, 350 ) ); // Collapse timeout is "auto", typically ~300ms

			// 5. Scroll to the section if we have a ref
			if ( sectionRef?.current ) {
				this.scrollToElement( sectionRef.current );
			}

			return {
				success: true,
				message: propertyMapping
					? `Navigated to "${ propertyMapping.displayName }" in ${ sectionName } section`
					: `Navigated to ${ sectionName } section`,
			};
		} catch ( error ) {
			return {
				success: false,
				message: `Failed to navigate to ${ sectionName }: ${ error }`,
			};
		}
	}

	/**
	 * Collapse all sections except the specified one
	 * @param targetSectionName
	 */
	private collapseAllSectionsExcept( targetSectionName: string ): void {
		this.sectionStateSetters.forEach( ( setExpanded, sectionName ) => {
			if ( sectionName !== targetSectionName ) {
				setExpanded( false );
			}
		} );
	}

	/**
	 * Collapse all registered sections
	 */
	collapseAllSections(): void {
		this.sectionStateSetters.forEach( ( setExpanded ) => {
			setExpanded( false );
		} );
	}

	/**
	 * Expand all registered sections
	 */
	expandAllSections(): void {
		this.sectionStateSetters.forEach( ( setExpanded ) => {
			setExpanded( true );
		} );
	}

	/**
	 * Scroll to an element smoothly
	 * @param element
	 */
	private scrollToElement( element: HTMLElement ): void {
		element.scrollIntoView( {
			behavior: 'smooth',
			block: 'start',
			inline: 'nearest',
		} );

		// Optional: Add a brief highlight effect
		this.highlightElement( element );
	}

	/**
	 * Briefly highlight an element
	 * @param element
	 */
	private highlightElement( element: HTMLElement ): void {
		const originalTransition = element.style.transition;
		const originalBackground = element.style.backgroundColor;

		// Apply highlight
		element.style.transition = 'background-color 0.3s ease';
		element.style.backgroundColor = 'rgba(var(--elementor-sys-color-accent-rgb), 0.1)';

		// Remove highlight after animation
		setTimeout( () => {
			element.style.backgroundColor = originalBackground;

			// Restore original transition after background fades
			setTimeout( () => {
				element.style.transition = originalTransition;
			}, 300 );
		}, 800 );
	}

	/**
	 * Get all registered sections
	 */
	getRegisteredSections(): string[] {
		return Array.from( this.sectionStateSetters.keys() );
	}

	/**
	 * Check if a section is registered
	 * @param sectionName
	 */
	isSectionRegistered( sectionName: string ): boolean {
		return this.sectionStateSetters.has( sectionName );
	}
}

// Global navigation service instance
export const cssPropertyNavigationService = new CSSPropertyNavigationService();

/**
 * Hook for easy navigation in components
 */
export function useCSSPropertyNavigation() {
	return {
		navigateToProperty: ( cssProperty: string ) => cssPropertyNavigationService.navigateToProperty( cssProperty ),
		navigateToSection: ( sectionName: string ) => cssPropertyNavigationService.navigateToSection( sectionName ),
		collapseAllSections: () => cssPropertyNavigationService.collapseAllSections(),
		expandAllSections: () => cssPropertyNavigationService.expandAllSections(),
		getRegisteredSections: () => cssPropertyNavigationService.getRegisteredSections(),
	};
}
