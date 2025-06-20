import * as React from 'react';
import { useId, useRef } from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { colorPropTypeUtil } from '@elementor/editor-props';
import { ColorFilterIcon } from '@elementor/icons';
import { bindPopover, bindTrigger, Box, Popover, usePopupState } from '@elementor/ui';

import { ColorIndicator } from '../components/ui/color-indicator';
import { SIZE, VariableTag } from '../components/ui/variable-tag';
import { VariableSelectionPopover } from '../components/variable-selection-popover';
import { useVariable } from '../hooks/use-prop-variables';
import { colorVariablePropTypeUtil } from '../prop-types/color-variable-prop-type';

export const ColorVariableControl = () => {
	const { setValue: setColor } = useBoundProp();
	const { value: variableValue } = useBoundProp( colorVariablePropTypeUtil );

	const anchorRef = useRef< HTMLDivElement >( null );

	const popupId = useId();
	const popupState = usePopupState( {
		variant: 'popover',
		popupId: `elementor-variables-list-${ popupId }`,
	} );

	const selectedVariable = useVariable( variableValue );
	if ( ! selectedVariable ) {
		throw new Error( `Global color variable ${ variableValue } not found` );
	}

	const unlinkVariable = () => {
		setColor( colorPropTypeUtil.create( selectedVariable.value ) );
	};

	return (
		<Box ref={ anchorRef }>
			<VariableTag
				label={ selectedVariable.label }
				startIcon={
					<>
						<ColorFilterIcon fontSize={ SIZE } />
						<ColorIndicator size="inherit" value={ selectedVariable.value } component="span" />
					</>
				}
				onUnlink={ unlinkVariable }
				{ ...bindTrigger( popupState ) }
			/>
			<Popover
				disableScrollLock
				anchorEl={ anchorRef.current }
				anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
				transformOrigin={ { vertical: 'top', horizontal: 'right' } }
				PaperProps={ {
					sx: { my: 1 },
				} }
				{ ...bindPopover( popupState ) }
			>
				<VariableSelectionPopover
					selectedVariable={ selectedVariable }
					closePopover={ popupState.close }
					propTypeKey={ colorVariablePropTypeUtil.key }
				/>
			</Popover>
		</Box>
	);
};
