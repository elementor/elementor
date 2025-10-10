import * as React from 'react';
import { type ReactElement, useRef, useState } from 'react';
import { useElementSetting } from '@elementor/editor-elements';
import { type ClassesPropValue } from '@elementor/editor-props';
import {
	isElementsStylesProvider,
	type StylesProvider,
	stylesRepository,
	type UpdateActionPayload,
	useProviders,
	useUserStylesCapability,
	validateStyleLabel,
} from '@elementor/editor-styles-repository';
import { InfoAlert, WarningInfotip } from '@elementor/editor-ui';
import { ColorSwatchIcon, MapPinIcon } from '@elementor/icons';
import { createLocation } from '@elementor/locations';
import {
	type AutocompleteChangeReason,
	Box,
	Chip,
	type ChipOwnProps,
	FormLabel,
	Link,
	Stack,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useClassesProp } from '../../contexts/classes-prop-context';
import { useElement } from '../../contexts/element-context';
import { useStyle } from '../../contexts/style-context';
import { getStylesProviderColorName } from '../../utils/get-styles-provider-color';
import {
	CreatableAutocomplete,
	type CreatableAutocompleteProps,
	type Option,
	type ValidationEvent,
	type ValidationResult,
} from '../creatable-autocomplete';
import { CssClassItem } from './css-class-item';
import { useApplyClass, useCreateAndApplyClass, useUnapplyClass } from './use-apply-and-unapply-class';

const ID = 'elementor-css-class-selector';
const TAGS_LIMIT = 50;

type StyleDefOption = Option & {
	color: ChipOwnProps[ 'color' ];
	icon: ReactElement | null;
	provider: string | null;
};

const EMPTY_OPTION = {
	label: __( 'local', 'elementor' ),
	value: null,
	fixed: true,
	color: getTempStylesProviderColorName( 'accent' ),
	icon: <MapPinIcon />,
	provider: null,
} satisfies StyleDefOption;

export const { Slot: ClassSelectorActionsSlot, inject: injectIntoClassSelectorActions } = createLocation();

/**
 * Applied - Classes applied to an element.
 * Active - Class that is currently on edit mode.
 */

export function CssClassSelector() {
	const options = useOptions();

	const { id: activeId, setId: setActiveId } = useStyle();

	const autocompleteRef = useRef< HTMLElement | null >( null );
	const [ renameError, setRenameError ] = useState< string | null >( null );

	const handleSelect = useHandleSelect();
	const { create, validate, entityName } = useCreateAction();

	const appliedOptions = useAppliedOptions( options );
	const active = appliedOptions.find( ( option ) => option.value === activeId ) ?? EMPTY_OPTION;

	const showPlaceholder = appliedOptions.every( ( { fixed } ) => fixed );

	const { userCan } = useUserStylesCapability();

	const canEdit = active.provider ? userCan( active.provider ).updateProps : true;

	return (
		<Stack p={ 2 }>
			<Stack direction="row" gap={ 1 } alignItems="center" justifyContent="space-between">
				<FormLabel htmlFor={ ID } size="small">
					{ __( 'Classes', 'elementor' ) }
				</FormLabel>
				<Stack direction="row" gap={ 1 }>
					<ClassSelectorActionsSlot />
				</Stack>
			</Stack>
			<WarningInfotip
				open={ Boolean( renameError ) }
				text={ renameError ?? '' }
				placement="bottom"
				width={ autocompleteRef.current?.getBoundingClientRect().width }
				offset={ [ 0, -15 ] }
			>
				<CreatableAutocomplete< StyleDefOption >
					id={ ID }
					ref={ autocompleteRef }
					size="tiny"
					placeholder={ showPlaceholder ? __( 'Type class name', 'elementor' ) : undefined }
					options={ options }
					selected={ appliedOptions }
					entityName={ entityName }
					onSelect={ handleSelect }
					onCreate={ create ?? undefined }
					validate={ validate ?? undefined }
					limitTags={ TAGS_LIMIT }
					renderEmptyState={ EmptyState }
					getLimitTagsText={ ( more ) => (
						<Chip size="tiny" variant="standard" label={ `+${ more }` } clickable />
					) }
					renderTags={ ( values, getTagProps ) =>
						values.map( ( value, index ) => {
							const chipProps = getTagProps( { index } );
							const isActive = value.value === active?.value;

							const renameLabel = ( newLabel: string ) => {
								if ( ! value.value ) {
									throw new Error( `Cannot rename a class without style id` );
								}
								return updateClassByProvider( value.provider, { label: newLabel, id: value.value } );
							};

							return (
								<CssClassItem
									key={ chipProps.key }
									fixed={ value.fixed }
									label={ value.label }
									provider={ value.provider }
									id={ value.value }
									isActive={ isActive }
									color={ isActive && value.color ? value.color : 'default' }
									icon={ value.icon }
									chipProps={ chipProps }
									onClickActive={ () => setActiveId( value.value ) }
									renameLabel={ renameLabel }
									setError={ setRenameError }
								/>
							);
						} )
					}
				/>
			</WarningInfotip>
			{ ! canEdit && (
				<InfoAlert sx={ { mt: 1 } }>
					{ __( 'With your current role, you can use existing classes but can’t modify them.', 'elementor' ) }
				</InfoAlert>
			) }
		</Stack>
	);
}

const EmptyState = ( { searchValue, onClear }: { searchValue: string; onClear: () => void } ) => (
	<Box sx={ { py: 4 } }>
		<Stack
			gap={ 1 }
			alignItems="center"
			color="text.secondary"
			justifyContent="center"
			sx={ { px: 2, m: 'auto', maxWidth: '236px' } }
		>
			<ColorSwatchIcon sx={ { transform: 'rotate(90deg)' } } fontSize="large" />
			<Typography align="center" variant="subtitle2">
				{ __( 'Sorry, nothing matched', 'elementor' ) }
				<br />
				&ldquo;{ searchValue }&rdquo;.
			</Typography>
			<Typography align="center" variant="caption" sx={ { mb: 2 } }>
				{ __( 'With your current role,', 'elementor' ) }
				<br />
				{ __( 'you can only use existing classes.', 'elementor' ) }
			</Typography>
			<Link color="text.secondary" variant="caption" component="button" onClick={ onClear }>
				{ __( 'Clear & try again', 'elementor' ) }
			</Link>
		</Stack>
	</Box>
);

const updateClassByProvider = ( provider: string | null, data: UpdateActionPayload ) => {
	if ( ! provider ) {
		return;
	}

	const providerInstance = stylesRepository.getProviderByKey( provider );

	if ( ! providerInstance ) {
		return;
	}

	return providerInstance.actions.update?.( data );
};

function useOptions() {
	const { element } = useElement();

	const isProviderEditable = ( provider: StylesProvider ) => !! provider.actions.updateProps;

	return useProviders()
		.filter( isProviderEditable )
		.flatMap< StyleDefOption >( ( provider ) => {
			const isElements = isElementsStylesProvider( provider.getKey() );
			const styleDefs = provider.actions.all( { elementId: element.id } );

			// Add an empty local option for elements, as fallback.
			if ( isElements && styleDefs.length === 0 ) {
				return [ EMPTY_OPTION ];
			}

			return styleDefs.map( ( styleDef ) => {
				return {
					label: styleDef.label,
					value: styleDef.id,
					fixed: isElements,
					color: getTempStylesProviderColorName( getStylesProviderColorName( provider.getKey() ) ),
					icon: isElements ? <MapPinIcon /> : null,
					provider: provider.getKey(),
				};
			} );
		} );
}

function getTempStylesProviderColorName( color: ChipOwnProps[ 'color' ] ): ChipOwnProps[ 'color' ] {
	if ( color === 'accent' ) {
		return 'primary';
	}

	return color;
}

function useCreateAction() {
	const [ provider, createAction ] = useCreateAndApplyClass();
	if ( ! provider || ! createAction ) {
		return {};
	}

	const create = ( classLabel: string ) => {
		createAction( { classLabel } );
	};

	const validate = ( newClassLabel: string, event: ValidationEvent ): ValidationResult => {
		if ( hasReachedLimit( provider ) ) {
			return {
				isValid: false,
				errorMessage: __(
					'You’ve reached the limit of 50 classes. Please remove an existing one to create a new class.',
					'elementor'
				),
			};
		}
		return validateStyleLabel( newClassLabel, event );
	};

	const entityName =
		provider.labels.singular && provider.labels.plural
			? ( provider.labels as CreatableAutocompleteProps< StyleDefOption >[ 'entityName' ] )
			: undefined;

	return { create, validate, entityName };
}

function hasReachedLimit( provider: StylesProvider ) {
	return provider.actions.all().length >= provider.limit;
}

function useAppliedOptions( options: StyleDefOption[] ) {
	const { element } = useElement();
	const currentClassesProp = useClassesProp();

	const appliedIds = useElementSetting< ClassesPropValue >( element.id, currentClassesProp )?.value || [];
	const appliedOptions = options.filter( ( option ) => option.value && appliedIds.includes( option.value ) );

	const hasElementsProviderStyleApplied = appliedOptions.some(
		( option ) => option.provider && isElementsStylesProvider( option.provider )
	);

	if ( ! hasElementsProviderStyleApplied ) {
		appliedOptions.unshift( EMPTY_OPTION );
	}

	return appliedOptions;
}

function useHandleSelect() {
	const apply = useApplyClass();
	const unapply = useUnapplyClass();

	return ( _selectedOptions: StyleDefOption[], reason: AutocompleteChangeReason, option: StyleDefOption ) => {
		if ( ! option.value ) {
			return;
		}

		switch ( reason ) {
			case 'selectOption':
				apply( { classId: option.value, classLabel: option.label } );
				break;

			case 'removeOption':
				unapply( { classId: option.value, classLabel: option.label } );
				break;
		}
	};
}
