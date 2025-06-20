import * as React from 'react';
import { useId, useRef } from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { stringPropTypeUtil } from '@elementor/editor-props';
import { ColorFilterIcon } from '@elementor/icons';
import { bindPopover, bindTrigger, Box, Popover, usePopupState } from '@elementor/ui';

import { SIZE, VariableTag } from '../components/ui/variable-tag';
import { VariableSelectionPopover } from '../components/variable-selection-popover';
import { useVariable } from '../hooks/use-prop-variables';
import { fontVariablePropTypeUtil } from '../prop-types/font-variable-prop-type';

export const FontVariableControl = () => {
	const { setValue: setFontFamily } = useBoundProp();
	const { value: variableValue } = useBoundProp( fontVariablePropTypeUtil );

	const anchorRef = useRef< HTMLDivElement >( null );

	const popupId = useId();
	const popupState = usePopupState( {
		variant: 'popover',
		popupId: `elementor-variables-list-${ popupId }`,
	} );

	const selectedVariable = useVariable( variableValue );
	if ( ! selectedVariable ) {
		throw new Error( `Global font variable ${ variableValue } not found` );
	}

	const unlinkVariable = () => {
		setFontFamily( stringPropTypeUtil.create( selectedVariable.value ) );
	};

	return (
		<Box ref={ anchorRef }>
			<VariableTag
				label={ selectedVariable.label }
				startIcon={ <ColorFilterIcon fontSize={ SIZE } /> }
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
					propTypeKey={ fontVariablePropTypeUtil.key }
				/>
			</Popover>
		</Box>
	);
};
