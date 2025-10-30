import { useEffect, useState } from 'react';
import { autoUpdate, offset, size, useFloating } from '@floating-ui/react';

type Options = {
	element: HTMLElement;
	isSelected: boolean;
};

const possibleOverlappingSelectors = [ '.e-off-canvas__content' ]; // right now only off-canvas, but may need this for others

function getLargestOverlap( element: HTMLElement ) {
	const elementLeft = element.getBoundingClientRect().left;
	let max = 0;
	for ( const selector of possibleOverlappingSelectors ) {
		const nodes = element.ownerDocument.querySelectorAll( selector );
		for ( const node of nodes ) {
			if (
				node.checkVisibility( { opacityProperty: true, visibilityProperty: true, contentVisibilityAuto: true } )
			) {
				const rect = node.getBoundingClientRect();
				if ( rect.right > max ) {
					max = rect.right;
				}
			}
		}
	}
	return max - elementLeft;
}

function getClipPath( element: HTMLElement ) {
	const overlap = getLargestOverlap( element );
	if ( overlap > 0 ) {
		return `xywh(${ overlap }px 0 100% 100%)`;
	}
	return null;
}

export function useFloatingOnElement( { element, isSelected }: Options ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const sizeModifier = 2;

	const initialClipPath = getClipPath( element );

	const { refs, floatingStyles, context } = useFloating( {
		// Must be controlled for interactions (like hover) to work.
		open: isOpen || isSelected,
		onOpenChange: setIsOpen,

		whileElementsMounted: autoUpdate,

		middleware: [
			// Match the floating element's size to the reference element.

			size( () => {
				return {
					apply( { elements, rects } ) {
						Object.assign( elements.floating.style, {
							width: `${ rects.reference.width + sizeModifier }px`,
							height: `${ rects.reference.height + sizeModifier }px`,
							clipPath: getClipPath( elements.reference as HTMLElement ) ?? initialClipPath,
						} );
					},
				};
			} ),
			// Center the floating element on the reference element.
			offset( ( { rects } ) => {
				return -rects.reference.height / 2 - rects.floating.height / 2;
			} ),
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
