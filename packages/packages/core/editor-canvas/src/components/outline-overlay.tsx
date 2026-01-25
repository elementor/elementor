import * as React from 'react';
import { Box, styled } from '@elementor/ui';
import { FloatingPortal, useHover, useInteractions } from '@floating-ui/react';

import { useBindReactPropsToElement } from '../hooks/use-bind-react-props-to-element';
import { useFloatingOnElement } from '../hooks/use-floating-on-element';
import { useHasOverlapping } from '../hooks/use-has-overlapping';
import type { ElementOverlayProps } from '../types/element-overlay';

export const CANVAS_WRAPPER_ID = 'elementor-preview-responsive-wrapper';

type Props = ElementOverlayProps & {
	isSmallerOffset?: boolean;
};

const OverlayBox = styled( Box, {
	shouldForwardProp: ( prop ) => prop !== 'isSelected' && prop !== 'isSmallerOffset' && prop !== 'isGlobal',
} )< Pick< Props, 'isSelected' | 'isSmallerOffset' | 'isGlobal' > >(
	( { theme, isSelected, isSmallerOffset, isGlobal } ) => ( {
		outline: `${ isSelected ? '2px' : '1px' } solid ${
			isGlobal ? theme.palette.global.main : theme.palette.primary.light
		}`,
		outlineOffset: isSelected && ! isSmallerOffset ? '-2px' : '-1px',
		pointerEvents: 'none',
	} )
);

export const OutlineOverlay = ( { element, isSelected, id, isGlobal = false }: Props ): React.ReactElement | false => {
	const { context, floating, isVisible } = useFloatingOnElement( { element, isSelected } );
	const { getFloatingProps, getReferenceProps } = useInteractions( [ useHover( context ) ] );
	const hasOverlapping = useHasOverlapping();

	useBindReactPropsToElement( element, getReferenceProps );
	const isSmallerOffset = element.offsetHeight <= 1;

	return (
		isVisible &&
		! hasOverlapping && (
			<FloatingPortal id={ CANVAS_WRAPPER_ID }>
				<OverlayBox
					ref={ floating.setRef }
					isSelected={ isSelected }
					isGlobal={ isGlobal }
					style={ floating.styles }
					data-element-overlay={ id }
					role="presentation"
					isSmallerOffset={ isSmallerOffset }
					{ ...getFloatingProps() }
				/>
			</FloatingPortal>
		)
	);
};
