import { useId, useRef } from 'react';
import * as React from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { type PropTypeUtil } from '@elementor/editor-props';
import { ColorFilterIcon } from '@elementor/icons';
import { bindPopover, bindTrigger, Box, Popover, usePopupState } from '@elementor/ui';

import { type Variable } from '../../../types';
import { VariableSelectionPopover } from '../../variable-selection-popover';
import { AssignedTag, SIZE } from '../tags/assigned-tag';
import { getVariable } from '../../../variable-registry';

type Props = {
	variablePropTypeUtil: PropTypeUtil< string, string >;
	additionalStartIcon?: React.ReactNode;
	variable: Variable;
};

export const AssignedVariable = ( {
	variable,
	variablePropTypeUtil,
	additionalStartIcon,
}: Props ) => {
	const { setValue } = useBoundProp();
	const anchorRef = useRef< HTMLDivElement >( null );
	const { fallbackPropTypeUtil } = getVariable( variablePropTypeUtil.key );

	const popupId = useId();
	const popupState = usePopupState( {
		variant: 'popover',
		popupId: `elementor-variables-list-${ popupId }`,
	} );

	const unlinkVariable = () => {
		setValue( fallbackPropTypeUtil.create( variable.value ) );
	};

	return (
		<Box ref={ anchorRef }>
			<AssignedTag
				label={ variable.label }
				startIcon={
					<>
						<ColorFilterIcon fontSize={ SIZE } />

						{ additionalStartIcon }
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
					propTypeUtil={ variablePropTypeUtil }
				/>
			</Popover>
		</Box>
	);
};
