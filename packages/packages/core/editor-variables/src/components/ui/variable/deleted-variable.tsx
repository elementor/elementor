import * as React from 'react';
import { useId, useRef, useState } from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { type PropTypeKey } from '@elementor/editor-props';
import { Backdrop, bindPopover, Box, Infotip, Popover, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { VariableTypeProvider } from '../../../context/variable-type-context';
import { usePermissions } from '../../../hooks/use-permissions';
import { restoreVariable } from '../../../hooks/use-prop-variables';
import { resolveBoundPropAndSetValue } from '../../../hooks/use-variable-bound-prop';
import { type Variable } from '../../../types';
import { createUnlinkHandler } from '../../../utils/unlink-variable';
import { getVariableType } from '../../../variables-registry/variable-type-registry';
import { VariableRestore } from '../../variable-restore';
import { DeletedVariableAlert } from '../deleted-variable-alert';
import { WarningVariableTag } from '../tags/warning-variable-tag';

type Props = {
	variable: Variable;
	propTypeKey: PropTypeKey;
};

type Handlers = {
	onUnlink?: () => void;
	onRestore?: () => void;
};

export const DeletedVariable = ( { variable, propTypeKey }: Props ) => {
	const { propTypeUtil } = getVariableType( propTypeKey );

	const boundProp = useBoundProp();

	const userPermissions = usePermissions();

	const [ showInfotip, setShowInfotip ] = useState< boolean >( false );
	const toggleInfotip = () => setShowInfotip( ( prev ) => ! prev );
	const closeInfotip = () => setShowInfotip( false );

	const deletedChipAnchorRef = useRef< HTMLDivElement >( null );

	const popupId = useId();
	const popupState = usePopupState( {
		variant: 'popover',
		popupId: `elementor-variables-restore-${ popupId }`,
	} );

	const handlers: Handlers = {};

	if ( userPermissions.canUnlink() ) {
		handlers.onUnlink = createUnlinkHandler( variable, propTypeKey, boundProp.setValue );
	}

	if ( userPermissions.canRestore() ) {
		handlers.onRestore = () => {
			if ( ! variable.key ) {
				return;
			}

			restoreVariable( variable.key )
				.then( ( id ) => {
					resolveBoundPropAndSetValue( propTypeUtil.create( id ), boundProp );

					closeInfotip();
				} )
				.catch( () => {
					closeInfotip();
					popupState.setAnchorEl( deletedChipAnchorRef.current );
					popupState.open();
				} );
		};
	}

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
							onUnlink={ handlers.onUnlink }
							onRestore={ handlers.onRestore }
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
					<WarningVariableTag
						label={ variable.label }
						onClick={ toggleInfotip }
						suffix={ __( 'deleted', 'elementor' ) }
					/>
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
					<VariableTypeProvider propTypeKey={ propTypeKey }>
						<VariableRestore
							variableId={ variable.key ?? '' }
							onClose={ popupState.close }
							onSubmit={ handleRestoreWithOverrides }
						/>
					</VariableTypeProvider>
				</Popover>
			</Box>
		</>
	);
};
//
// because we dont have redux we got no reactivity
// test here
// ( value: string ) => {
// 			if ( ! boundProp.value && boundProp.placeholder === value ) {
// 				return boundProp.setValue( null );
// 			}
//
// 			return boundProp.setValue( value );
// 		}
