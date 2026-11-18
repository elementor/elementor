import * as React from 'react';
import { useRef, useState } from 'react';
import { ControlFormLabel } from '@elementor/editor-controls';
import { PromotionChip, PromotionPopover } from '@elementor/editor-ui';
import { Box, Button, Stack, Switch } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { disableSubmenu, enableSubmenu, selectSubmenu, useSubmenu } from './use-submenu';

type Props = {
	entryId: string | null;
	showEditButton?: boolean;
};

export const SubmenuToggle = ( { entryId, showEditButton = false }: Props ) => {
	const { submenuId, locked, promotion } = useSubmenu( entryId );
	const [ isPromotionOpen, setIsPromotionOpen ] = useState( false );
	const anchorRef = useRef< HTMLDivElement >( null );

	if ( ! entryId ) {
		return null;
	}

	const isEnabled = !! submenuId;
	const isLockedOff = locked && ! isEnabled;

	const onToggle = () => {
		if ( isEnabled ) {
			disableSubmenu( entryId );

			return;
		}

		enableSubmenu( entryId );
	};

	return (
		<Stack gap={ 1.5 }>
			<Stack direction="row" alignItems="center" justifyContent="space-between" ref={ anchorRef }>
				<Stack direction="row" alignItems="center">
					<ControlFormLabel>{ __( 'Enable Submenu', 'elementor' ) }</ControlFormLabel>
					{ isLockedOff && promotion && (
						<PromotionPopover
							open={ isPromotionOpen }
							title={ promotion.title }
							content={ promotion.content }
							ctaUrl={ promotion.ctaUrl }
							ctaText={ __( 'Upgrade Now', 'elementor' ) }
							onClose={ () => setIsPromotionOpen( false ) }
							anchorRef={ anchorRef }
						>
							<Box
								component="span"
								onClick={ () => setIsPromotionOpen( ( open ) => ! open ) }
								sx={ { display: 'inline-flex', cursor: 'pointer' } }
							>
								<PromotionChip />
							</Box>
						</PromotionPopover>
					) }
				</Stack>
				<Box sx={ { marginInlineEnd: -1 } }>
					<Switch
						size="small"
						checked={ isEnabled }
						onChange={ onToggle }
						disabled={ isLockedOff }
						inputProps={ { 'aria-label': __( 'Enable Submenu', 'elementor' ) } }
					/>
				</Box>
			</Stack>
			{ showEditButton && isEnabled && submenuId && (
				<Button size="small" color="secondary" variant="outlined" onClick={ () => selectSubmenu( submenuId ) }>
					{ __( 'Edit Submenu', 'elementor' ) }
				</Button>
			) }
		</Stack>
	);
};
