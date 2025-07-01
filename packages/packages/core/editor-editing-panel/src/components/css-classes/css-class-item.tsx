import * as React from 'react';
import { type ReactElement, useState } from 'react';
import { stylesRepository, useUserStylesCapability, validateStyleLabel } from '@elementor/editor-styles-repository';
import { EditableField, EllipsisWithTooltip, useEditable } from '@elementor/editor-ui';
import { DotsVerticalIcon } from '@elementor/icons';
import {
	type AutocompleteRenderGetTagProps,
	bindTrigger,
	Chip,
	type ChipOwnProps,
	Stack,
	type Theme,
	ThemeProvider,
	Typography,
	UnstableChipGroup,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useStyle } from '../../contexts/style-context';
import { CssClassProvider } from './css-class-context';
import { CssClassMenu } from './css-class-menu';

type CssClassItemProps = {
	id: string | null;
	provider: string | null;
	label: string;
	fixed?: boolean;
	isActive: boolean;
	color: ChipOwnProps[ 'color' ];
	icon: ReactElement | null;
	chipProps: ReturnType< AutocompleteRenderGetTagProps >;
	onClickActive: ( id: string | null ) => void;
	renameLabel: ( newLabel: string ) => void;
	validateLabel?: ( newLabel: string ) => string | undefined | null;
	setError?: ( error: string | null ) => void;
};

const CHIP_SIZE = 'tiny';

export function CssClassItem( props: CssClassItemProps ) {
	const { chipProps, icon, color: colorProp, fixed, ...classProps } = props;
	const { id, provider, label, isActive, onClickActive, renameLabel, setError } = classProps;

	const { meta, setMetaState } = useStyle();
	const popupState = usePopupState( { variant: 'popover' } );
	const [ chipRef, setChipRef ] = useState< HTMLElement | null >( null );
	const { onDelete, ...chipGroupProps } = chipProps;

	const { userCan } = useUserStylesCapability();

	const {
		ref,
		isEditing,
		openEditMode,
		error,
		getProps: getEditableProps,
	} = useEditable( {
		value: label,
		onSubmit: renameLabel,
		validation: validateLabel,
		onError: setError,
	} );

	const color = error ? 'error' : colorProp;

	const providerActions = provider ? stylesRepository.getProviderByKey( provider )?.actions : null;
	const allowRename = Boolean( providerActions?.update ) && userCan( provider ?? '' )?.update;

	const isShowingState = isActive && meta.state;

	return (
		<ThemeProvider palette="default">
			<UnstableChipGroup
				ref={ setChipRef }
				{ ...chipGroupProps }
				aria-label={ `Edit ${ label }` }
				role="group"
				sx={ ( theme: Theme ) => ( {
					'&.MuiChipGroup-root.MuiAutocomplete-tag': { margin: theme.spacing( 0.125 ) },
				} ) }
			>
				<Chip
					size={ CHIP_SIZE }
					label={
						isEditing ? (
							<EditableField ref={ ref } { ...getEditableProps() } />
						) : (
							<EllipsisWithTooltip maxWidth="10ch" title={ label } as="div" />
						)
					}
					variant={ isActive && ! meta.state && ! isEditing ? 'filled' : 'standard' }
					shape="rounded"
					icon={ icon }
					color={ color }
					onClick={ () => {
						if ( isShowingState ) {
							setMetaState( null );
							return;
						}

						if ( allowRename && isActive ) {
							openEditMode();
							return;
						}

						onClickActive( id );
					} }
					aria-pressed={ isActive }
					sx={ ( theme: Theme ) => ( {
						lineHeight: 1,
						cursor: isActive && allowRename && ! isShowingState ? 'text' : 'pointer',
						borderRadius: `${ theme.shape.borderRadius * 0.75 }px`,
						'&.Mui-focusVisible': {
							boxShadow: 'none !important',
						},
					} ) }
				/>
				{ ! isEditing && (
					<Chip
						icon={ isShowingState ? undefined : <DotsVerticalIcon fontSize="tiny" /> }
						size={ CHIP_SIZE }
						label={
							isShowingState ? (
								<Stack direction="row" gap={ 0.5 } alignItems="center">
									<Typography variant="inherit">{ meta.state }</Typography>
									<DotsVerticalIcon fontSize="tiny" />
								</Stack>
							) : undefined
						}
						variant="filled"
						shape="rounded"
						color={ color }
						{ ...bindTrigger( popupState ) }
						aria-label={ __( 'Open CSS Class Menu', 'elementor' ) }
						sx={ ( theme: Theme ) => ( {
							borderRadius: `${ theme.shape.borderRadius * 0.75 }px`,
							paddingRight: 0,
							...( ! isShowingState ? { paddingLeft: 0 } : {} ),
							'.MuiChip-label': isShowingState ? { paddingRight: 0 } : { padding: 0 },
						} ) }
					/>
				) }
			</UnstableChipGroup>
			<CssClassProvider { ...classProps } handleRename={ openEditMode }>
				<CssClassMenu popupState={ popupState } anchorEl={ chipRef } fixed={ fixed } />
			</CssClassProvider>
		</ThemeProvider>
	);
}

const validateLabel = ( newLabel: string ) => {
	const result = validateStyleLabel( newLabel, 'rename' );

	if ( result.isValid ) {
		return null;
	}

	return result.errorMessage;
};
