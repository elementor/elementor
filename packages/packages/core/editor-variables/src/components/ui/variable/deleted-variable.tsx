import * as React from 'react';
import { useId, useRef, useState } from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { type PropTypeUtil } from '@elementor/editor-props';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { Backdrop, bindPopover, Box, Infotip, Popover, usePopupState } from '@elementor/ui';

import { restoreVariable } from '../../../hooks/use-prop-variables';
import { colorVariablePropTypeUtil } from '../../../prop-types/color-variable-prop-type';
import { fontVariablePropTypeUtil } from '../../../prop-types/font-variable-prop-type';
import { type Variable } from '../../../types';
import { ColorVariableRestore } from '../../color-variable-restore';
import { FontVariableRestore } from '../../font-variable-restore';
import { DeletedVariableAlert } from '../deleted-variable-alert';
import { DeletedTag } from '../tags/deleted-tag';

const isV331Active = isExperimentActive( 'e_v_3_31' );

type Props = {
	variable: Variable;
	variablePropTypeUtil: PropTypeUtil< string, string >;
	fallbackPropTypeUtil: PropTypeUtil< string, string | null > | PropTypeUtil< string, string >;
};

export const DeletedVariable = ( { variable, variablePropTypeUtil, fallbackPropTypeUtil }: Props ) => {
	const { setValue } = useBoundProp();

	const [ showInfotip, setShowInfotip ] = useState< boolean >( false );
	const toggleInfotip = () => setShowInfotip( ( prev ) => ! prev );
	const closeInfotip = () => setShowInfotip( false );

	const unlinkVariable = () => {
		setValue( fallbackPropTypeUtil.create( variable.value ) );
	};

	const deletedChipAnchorRef = useRef< HTMLDivElement >( null );

	const popupId = useId();
	const popupState = usePopupState( {
		variant: 'popover',
		popupId: `elementor-variables-restore-${ popupId }`,
	} );

	const handleRestore = () => {
		if ( ! variable.key ) {
			return;
		}

		restoreVariable( variable.key )
			.then( ( key ) => {
				setValue( variablePropTypeUtil.create( key ) );
				closeInfotip();
			} )
			.catch( () => {
				closeInfotip();
				popupState.setAnchorEl( deletedChipAnchorRef.current );
				popupState.open();
			} );
	};

	const handleRestoreWithOverrides = () => {
		popupState.close();
	};

	return (
		<>
			<Box ref={ deletedChipAnchorRef }>
				{ showInfotip && <Backdrop open onClick={ closeInfotip } invisible /> }
				<Infotip
					color="warning"
					placement="right-start"
					open={ showInfotip }
					disableHoverListener
					onClose={ closeInfotip }
					content={
						<DeletedVariableAlert
							onClose={ closeInfotip }
							onUnlink={ unlinkVariable }
							onRestore={ isV331Active ? handleRestore : undefined }
							label={ variable.label }
						/>
					}
					slotProps={ {
						popper: {
							modifiers: [
								{
									name: 'offset',
									options: { offset: [ 0, 24 ] },
								},
							],
						},
					} }
				>
					<DeletedTag label={ variable.label } onClick={ toggleInfotip } />
				</Infotip>

				<Popover
					disableScrollLock
					anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
					transformOrigin={ { vertical: 'top', horizontal: 'right' } }
					PaperProps={ {
						sx: { my: 1 },
					} }
					{ ...bindPopover( popupState ) }
				>
					{ fontVariablePropTypeUtil.key === variablePropTypeUtil.key && (
						<FontVariableRestore
							variableId={ variable.key ?? '' }
							onClose={ popupState.close }
							onSubmit={ handleRestoreWithOverrides }
						/>
					) }

					{ colorVariablePropTypeUtil.key === variablePropTypeUtil.key && (
						<ColorVariableRestore
							variableId={ variable.key ?? '' }
							onClose={ popupState.close }
							onSubmit={ handleRestoreWithOverrides }
						/>
					) }
				</Popover>
			</Box>
		</>
	);
};
