import { useId, useRef } from 'react';
import * as React from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { type PropTypeKey } from '@elementor/editor-props';
import { ColorFilterIcon } from '@elementor/icons';
import { bindPopover, bindTrigger, Box, Popover, usePopupState } from '@elementor/ui';

import { type Variable } from '../../../types';
import { createUnlinkHandler } from '../../../utils/unlink-variable';
import { getVariableType } from '../../../variables-registry/variable-type-registry';
import { VariableSelectionPopover } from '../../variable-selection-popover';
import { AssignedTag, SIZE } from '../tags/assigned-tag';

type Props = {
	propTypeKey: PropTypeKey;
	variable: Variable;
};

export const AssignedVariable = ( { variable, propTypeKey }: Props ) => {
	const { startIcon, propTypeUtil } = getVariableType( propTypeKey );
	const { setValue } = useBoundProp();
	const anchorRef = useRef< HTMLDivElement >( null );

	const popupId = useId();
	const popupState = usePopupState( {
		variant: 'popover',
		popupId: `elementor-variables-list-${ popupId }`,
	} );

	const unlinkVariable = createUnlinkHandler( variable, propTypeKey, setValue );

	const StartIcon = startIcon || ( () => null );

	return (
		<Box ref={ anchorRef }>
			<AssignedTag
				label={ variable.label }
				startIcon={
					<>
						<ColorFilterIcon fontSize={ SIZE } />
						<StartIcon value={ variable.value } />
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
					selectedVariable={ variable }
					closePopover={ popupState.close }
					propTypeKey={ propTypeUtil.key }
				/>
			</Popover>
		</Box>
	);
};
