import * as React from 'react';
import { Box, styled } from '@elementor/ui';
import { FloatingPortal, useHover, useInteractions } from '@floating-ui/react';

import { useBindReactPropsToElement } from '../hooks/use-bind-react-props-to-element';
import { useFloatingOnElement } from '../hooks/use-floating-on-element';

export const CANVAS_WRAPPER_ID = 'elementor-preview-responsive-wrapper';

type Props = {
	element: HTMLElement;
	isSelected: boolean;
	id: string;
	isSmallerOffset?: boolean;
};

const OverlayBox = styled( Box, {
	shouldForwardProp: ( prop ) => prop !== 'isSelected' && prop !== 'isSmallerOffset',
} )< Pick< Props, 'isSelected' | 'isSmallerOffset' > >( ( { theme, isSelected, isSmallerOffset } ) => ( {
	outline: `${ isSelected ? '2px' : '1px' } solid ${ theme.palette.primary.light }`,
	outlineOffset: isSelected && ! isSmallerOffset ? '-2px' : '-1px',
	pointerEvents: 'none',
} ) );

export function ElementOverlay( { element, isSelected, id }: Props ) {
	const { context, floating, isVisible } = useFloatingOnElement( { element, isSelected } );
	const { getFloatingProps, getReferenceProps } = useInteractions( [ useHover( context ) ] );

	useBindReactPropsToElement( element, getReferenceProps );
	const isSmallerOffset = element.offsetHeight <= 1;

	return (
		isVisible && (
			<FloatingPortal id={ CANVAS_WRAPPER_ID }>
				<OverlayBox
					ref={ floating.setRef }
					isSelected={ isSelected }
					style={ floating.styles }
					data-element-overlay={ id }
					role="presentation"
					isSmallerOffset={ isSmallerOffset }
					{ ...getFloatingProps() }
				/>
			</FloatingPortal>
		)
	);
}
