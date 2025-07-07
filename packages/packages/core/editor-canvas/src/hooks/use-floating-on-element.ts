import { useEffect, useState } from 'react';
import { autoUpdate, offset, size, useFloating } from '@floating-ui/react';

type Options = {
	element: HTMLElement;
	isSelected: boolean;
};

export function useFloatingOnElement( { element, isSelected }: Options ) {
	const [ isOpen, setIsOpen ] = useState( false );

	const { refs, floatingStyles, context } = useFloating( {
		// Must be controlled for interactions (like hover) to work.
		open: isOpen || isSelected,
		onOpenChange: setIsOpen,

		whileElementsMounted: autoUpdate,

		middleware: [
			// Match the floating element's size to the reference element.
			size( {
				apply( { elements, rects } ) {
					Object.assign( elements.floating.style, {
						width: `${ rects.reference.width + 2 }px`,
						height: `${ rects.reference.height + 2 }px`,
					} );
				},
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
		isVisible: isOpen || isSelected,
		context,
		floating: {
			setRef: refs.setFloating,
			ref: refs.floating,
			styles: floatingStyles,
		},
	};
}
