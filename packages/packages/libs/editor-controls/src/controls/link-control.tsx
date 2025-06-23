import * as React from 'react';
import { type PropsWithChildren, useMemo, useState } from 'react';
import { getLinkInLinkRestriction, type LinkInLinkRestriction, selectElement } from '@elementor/editor-elements';
import {
	linkPropTypeUtil,
	type LinkPropValue,
	numberPropTypeUtil,
	stringPropTypeUtil,
	urlPropTypeUtil,
} from '@elementor/editor-props';
import { InfoTipCard } from '@elementor/editor-ui';
import { type HttpResponse, httpService } from '@elementor/http-client';
import { AlertTriangleIcon, MinusIcon, PlusIcon } from '@elementor/icons';
import { useSessionStorage } from '@elementor/session';
import { Box, Collapse, Grid, IconButton, Infotip, Stack } from '@elementor/ui';
import { debounce } from '@elementor/utils';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import {
	Autocomplete,
	type CategorizedOption,
	findMatchingOption,
	type FlatOption,
	isCategorizedOptionPool,
} from '../components/autocomplete';
import { ControlFormLabel } from '../components/control-form-label';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';
import { type ControlProps } from '../utils/types';
import { SwitchControl } from './switch-control';

type Props = ControlProps< {
	queryOptions: {
		requestParams: Record< string, unknown >;
		endpoint: string;
	};
	allowCustomValues?: boolean;
	minInputLength?: number;
	placeholder?: string;
	label?: string;
} >;

type LinkSessionValue = {
	value?: LinkPropValue[ 'value' ] | null;
	meta?: {
		isEnabled?: boolean;
	};
};

type Response = HttpResponse< { value: FlatOption[] | CategorizedOption[] } >;

const SIZE = 'tiny';
const learnMoreButton = {
	label: __( 'Learn More', 'elementor' ),
	href: 'https://go.elementor.com/element-link-inside-link-infotip',
};

export const LinkControl = createControl( ( props: Props ) => {
	const { value, path, setValue, ...propContext } = useBoundProp( linkPropTypeUtil );
	const [ linkSessionValue, setLinkSessionValue ] = useSessionStorage< LinkSessionValue >( path.join( '/' ) );
	const [ isActive, setIsActive ] = useState( !! value );

	const {
		allowCustomValues,
		queryOptions: { endpoint = '', requestParams = {} },
		placeholder,
		minInputLength = 2,
		context: { elementId },
		label = __( 'Link', 'elementor' ),
	} = props || {};

	const [ linkInLinkRestriction, setLinkInLinkRestriction ] = useState( getLinkInLinkRestriction( elementId ) );
	const [ options, setOptions ] = useState< FlatOption[] | CategorizedOption[] >(
		generateFirstLoadedOption( value )
	);
	const shouldDisableAddingLink = ! isActive && linkInLinkRestriction.shouldRestrict;

	const onEnabledChange = () => {
		setLinkInLinkRestriction( getLinkInLinkRestriction( elementId ) );

		if ( linkInLinkRestriction.shouldRestrict && ! isActive ) {
			return;
		}

		const newState = ! isActive;
		setIsActive( newState );

		if ( ! newState && value !== null ) {
			setValue( null );
		}

		if ( newState && linkSessionValue?.value ) {
			setValue( linkSessionValue.value );
		}

		setLinkSessionValue( {
			value: linkSessionValue?.value,
			meta: { isEnabled: newState },
		} );
	};

	const onOptionChange = ( newValue: number | null ) => {
		const valueToSave: LinkPropValue[ 'value' ] | null = newValue
			? {
					...value,
					destination: numberPropTypeUtil.create( newValue ),
					label: stringPropTypeUtil.create( findMatchingOption( options, newValue )?.label || null ),
			  }
			: null;

		onSaveNewValue( valueToSave );
	};

	const onTextChange = ( newValue: string | null ) => {
		newValue = newValue?.trim() || '';

		const valueToSave: LinkPropValue[ 'value' ] | null = newValue
			? {
					...value,
					destination: urlPropTypeUtil.create( newValue ),
					label: stringPropTypeUtil.create( '' ),
			  }
			: null;

		onSaveNewValue( valueToSave );
		updateOptions( newValue );
	};

	const onSaveNewValue = ( newValue: LinkPropValue[ 'value' ] | null ) => {
		setValue( newValue );
		setLinkSessionValue( { ...linkSessionValue, value: newValue } );
	};

	const updateOptions = ( newValue: string | null ) => {
		setOptions( [] );

		if ( ! newValue || ! endpoint || newValue.length < minInputLength ) {
			return;
		}

		debounceFetch( { ...requestParams, term: newValue } );
	};

	const debounceFetch = useMemo(
		() =>
			debounce(
				( params: FetchOptionsParams ) =>
					fetchOptions( endpoint, params ).then( ( newOptions ) => {
						setOptions( formatOptions( newOptions ) );
					} ),
				400
			),
		[ endpoint ]
	);

	return (
		<PropProvider { ...propContext } value={ value } setValue={ setValue }>
			<Stack gap={ 1.5 }>
				<Stack
					direction="row"
					sx={ {
						justifyContent: 'space-between',
						alignItems: 'center',
						marginInlineEnd: -0.75,
					} }
				>
					<ControlFormLabel>{ label }</ControlFormLabel>
					<ConditionalInfoTip isVisible={ ! isActive } linkInLinkRestriction={ linkInLinkRestriction }>
						<ToggleIconControl
							disabled={ shouldDisableAddingLink }
							active={ isActive }
							onIconClick={ onEnabledChange }
							label={ __( 'Toggle link', 'elementor' ) }
						/>
					</ConditionalInfoTip>
				</Stack>
				<Collapse in={ isActive } timeout="auto" unmountOnExit>
					<Stack gap={ 1.5 }>
						<PropKeyProvider bind={ 'destination' }>
							<ControlActions>
								<Autocomplete
									options={ options }
									allowCustomValues={ allowCustomValues }
									placeholder={ placeholder }
									value={ value?.destination?.value?.settings?.label || value?.destination?.value }
									onOptionChange={ onOptionChange }
									onTextChange={ onTextChange }
									minInputLength={ minInputLength }
								/>
							</ControlActions>
						</PropKeyProvider>
						<PropKeyProvider bind={ 'isTargetBlank' }>
							<Grid container alignItems="center" flexWrap="nowrap" justifyContent="space-between">
								<Grid item>
									<ControlFormLabel>{ __( 'Open in a new tab', 'elementor' ) }</ControlFormLabel>
								</Grid>
								<Grid item sx={ { marginInlineEnd: -1 } }>
									<SwitchControl />
								</Grid>
							</Grid>
						</PropKeyProvider>
					</Stack>
				</Collapse>
			</Stack>
		</PropProvider>
	);
} );

type ToggleIconControlProps = {
	disabled: boolean;
	active: boolean;
	onIconClick: () => void;
	label?: string;
};

const ToggleIconControl = ( { disabled, active, onIconClick, label }: ToggleIconControlProps ) => {
	return (
		<IconButton size={ SIZE } onClick={ onIconClick } aria-label={ label } disabled={ disabled }>
			{ active ? <MinusIcon fontSize={ SIZE } /> : <PlusIcon fontSize={ SIZE } /> }
		</IconButton>
	);
};

type FetchOptionsParams = Record< string, unknown > & { term: string };

async function fetchOptions( ajaxUrl: string, params: FetchOptionsParams ) {
	if ( ! params || ! ajaxUrl ) {
		return [];
	}

	try {
		const { data: response } = await httpService().get< Response >( ajaxUrl, { params } );

		return response.data.value;
	} catch {
		return [];
	}
}

function formatOptions( options: FlatOption[] | CategorizedOption[] ): FlatOption[] | CategorizedOption[] {
	const compareKey = isCategorizedOptionPool( options ) ? 'groupLabel' : 'label';

	return options.sort( ( a, b ) =>
		a[ compareKey ] && b[ compareKey ] ? a[ compareKey ].localeCompare( b[ compareKey ] ) : 0
	);
}

function generateFirstLoadedOption( unionValue: LinkPropValue[ 'value' ] | null ): FlatOption[] {
	const value = unionValue?.destination?.value;
	const label = unionValue?.label?.value;
	const type = unionValue?.destination?.$$type || 'url';

	return value && label && type === 'number'
		? [
				{
					id: value.toString(),
					label,
				},
		  ]
		: [];
}

interface ConditionalInfoTipType extends PropsWithChildren {
	linkInLinkRestriction: LinkInLinkRestriction;
	isVisible: boolean;
}

const ConditionalInfoTip: React.FC< ConditionalInfoTipType > = ( { linkInLinkRestriction, isVisible, children } ) => {
	const { shouldRestrict, reason, elementId } = linkInLinkRestriction;

	const handleTakeMeClick = () => {
		if ( elementId ) {
			selectElement( elementId );
		}
	};

	return shouldRestrict && isVisible ? (
		<Infotip
			placement="right"
			content={
				<InfoTipCard
					content={ INFOTIP_CONTENT[ reason ] }
					svgIcon={ <AlertTriangleIcon /> }
					learnMoreButton={ learnMoreButton }
					ctaButton={ {
						label: __( 'Take me there', 'elementor' ),
						onClick: handleTakeMeClick,
					} }
				/>
			}
		>
			<Box>{ children }</Box>
		</Infotip>
	) : (
		<>{ children }</>
	);
};

const INFOTIP_CONTENT = {
	descendant: (
		<>
			{ __( 'To add a link to this container,', 'elementor' ) }
			<br />
			{ __( 'first remove the link from the elements inside of it.', 'elementor' ) }
		</>
	),
	ancestor: (
		<>
			{ __( 'To add a link to this element,', 'elementor' ) }
			<br />
			{ __( 'first remove the link from its parent container.', 'elementor' ) }
		</>
	),
};
