import { useEffect, useState } from 'react';
import { autoUpdate, offset, size, useFloating } from '@floating-ui/react';

type Options = {
	element: HTMLElement;
	isSelected: boolean;
	/** When true, the floating layer stays open (e.g. editor grid cell guides while editing). */
	forceVisible?: boolean;
};

export function useFloatingOnElement( { element, isSelected, forceVisible = false }: Options ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const sizeModifier = 2;
	const open = forceVisible || isOpen || isSelected;

	const { refs, floatingStyles, context } = useFloating( {
		// Must be controlled for interactions (like hover) to work.
		open,
		onOpenChange: ( next ) => {
			if ( forceVisible ) {
				return;
			}
			setIsOpen( next );
		},

		whileElementsMounted: autoUpdate,

		middleware: [
			// Match the floating element's size to the reference element.

			size( () => {
				return {
					apply( { elements, rects } ) {
						Object.assign( elements.floating.style, {
							width: `${ rects.reference.width + sizeModifier }px`,
							height: `${ rects.reference.height + sizeModifier }px`,
						} );
					},
				};
			} ),
			// Center the floating element on the reference element.
			offset( ( { rects } ) => -rects.reference.height / 2 - rects.floating.height / 2 ),
		],
	} );

	useEffect( () => {
		// Update the reference manually because Floating UI does not recalculate
		// the reference element when it is being used in `option.elements.reference`.
		// @link https://github.com/floating-ui/floating-ui/blob/master/packages/react/src/hooks/useFloatingRootContext.ts
		refs.setReference( element );
	}, [ element, refs ] );

	return {
		isVisible: open,
		context,
		floating: {
			setRef: refs.setFloating,
			ref: refs.floating,
			styles: floatingStyles,
		},
	};
}
