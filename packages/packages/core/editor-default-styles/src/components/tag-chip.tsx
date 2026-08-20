import * as React from 'react';
import { useState } from 'react';
import { type StyleDefinitionState } from '@elementor/editor-styles';
import { DotsVerticalIcon } from '@elementor/icons';
import {
	type AutocompleteRenderGetTagProps,
	bindTrigger,
	Chip,
	Stack,
	type Theme,
	Typography,
	UnstableChipGroup,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { TagStateMenu } from './tag-state-menu';

const CHIP_SIZE = 'tiny';

type TagChipProps = {
	label: string;
	chipProps: ReturnType< AutocompleteRenderGetTagProps >;
	activeState: StyleDefinitionState | null;
	onSelectState: ( state: StyleDefinitionState | null ) => void;
	onLabelClick: () => void;
};

export function TagChip( { label, chipProps, activeState, onSelectState, onLabelClick }: TagChipProps ) {
	const popupState = usePopupState( {
		variant: 'popover',
		popupId: 'tag-state-menu',
	} );
	const [ chipRef, setChipRef ] = useState< HTMLElement | null >( null );

	const { onDelete: _onDelete, ...chipGroupProps } = chipProps;
	const isShowingState = Boolean( activeState );
	const menuTriggerProps = bindTrigger( popupState );

	return (
		<>
			<UnstableChipGroup
				ref={ setChipRef }
				{ ...chipGroupProps }
				aria-label={ `Edit ${ label }` }
				role="group"
				sx={ {
					flexShrink: 0,
					margin: 0,
				} }
			>
				<Chip
					size={ CHIP_SIZE }
					label={ label }
					variant={ isShowingState ? 'standard' : 'filled' }
					shape="rounded"
					color="default"
					onClick={ ( event ) => {
						event.stopPropagation();
						onLabelClick();
					} }
					sx={ ( theme: Theme ) => ( {
						lineHeight: 1,
						borderRadius: `${ theme.shape.borderRadius * 0.75 }px`,
					} ) }
				/>
				<Chip
					icon={ isShowingState ? undefined : <DotsVerticalIcon fontSize="tiny" /> }
					size={ CHIP_SIZE }
					label={
						isShowingState ? (
							<Stack direction="row" gap={ 0.5 } alignItems="center">
								<Typography variant="inherit">{ activeState }</Typography>
								<DotsVerticalIcon fontSize="tiny" />
							</Stack>
						) : undefined
					}
					variant="filled"
					shape="rounded"
					color="default"
					{ ...menuTriggerProps }
					onClick={ ( event ) => {
						menuTriggerProps.onClick?.( event );
						event.stopPropagation();
					} }
					aria-label={ __( 'Open tag state menu', 'elementor' ) }
					sx={ ( theme: Theme ) => ( {
						borderRadius: `${ theme.shape.borderRadius * 0.75 }px`,
						paddingRight: 0,
						marginRight: 0,
						...( ! isShowingState ? { paddingLeft: 0 } : {} ),
						'.MuiChip-label': isShowingState ? { paddingRight: 0 } : { padding: 0 },
					} ) }
				/>
			</UnstableChipGroup>
			<TagStateMenu
				popupState={ popupState }
				anchorEl={ chipRef }
				activeState={ activeState }
				onSelectState={ onSelectState }
			/>
		</>
	);
}
