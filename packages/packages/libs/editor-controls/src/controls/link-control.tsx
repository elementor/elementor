import * as React from 'react';
import { useEffect, useState } from 'react';
import { getLinkInLinkRestriction } from '@elementor/editor-elements';
import { linkPropTypeUtil, type LinkPropValue } from '@elementor/editor-props';
import { MinusIcon, PlusIcon } from '@elementor/icons';
import { useSessionStorage } from '@elementor/session';
import { Collapse, Grid, IconButton, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { ControlLabel } from '../components/control-label';
import { RestrictedLinkInfotip } from '../components/restricted-link-infotip';
import { createControl } from '../create-control';
import { type ControlProps } from '../utils/types';
import { QueryControl } from './query-control';
import { SwitchControl } from './switch-control';

type Props = ControlProps< {
	queryOptions: {
		params: Record< string, unknown >;
		url: string;
	};
	allowCustomValues?: boolean;
	minInputLength?: number;
	placeholder?: string;
	label?: string;
	ariaLabel?: string;
} >;

type LinkSessionValue = {
	value?: LinkPropValue[ 'value' ] | null;
	meta?: {
		isEnabled?: boolean;
	};
};

export type DestinationProp = LinkPropValue[ 'value' ][ 'destination' ];

const SIZE = 'tiny';

export const LinkControl = createControl( ( props: Props ) => {
	const { value, path, setValue, ...propContext } = useBoundProp( linkPropTypeUtil );
	const [ linkSessionValue, setLinkSessionValue ] = useSessionStorage< LinkSessionValue >( path.join( '/' ) );
	const [ isActive, setIsActive ] = useState( !! value );

	const {
		allowCustomValues = true,
		queryOptions,
		placeholder,
		minInputLength = 2,
		context: { elementId },
		label = __( 'Link', 'elementor' ),
		ariaLabel,
	} = props || {};

	const [ linkInLinkRestriction, setLinkInLinkRestriction ] = useState( getLinkInLinkRestriction( elementId ) );
	const shouldDisableAddingLink = ! isActive && linkInLinkRestriction.shouldRestrict;

	useEffect( () => {
		const checkRestriction = () => {
			const newRestriction = getLinkInLinkRestriction( elementId );

			if ( newRestriction.shouldRestrict && ! linkInLinkRestriction.shouldRestrict && isActive ) {
				setIsActive( false );
			}

			setLinkInLinkRestriction( newRestriction );
		};

		const intervalId = setInterval( checkRestriction, 500 );

		return () => clearInterval( intervalId );
	}, [ elementId, linkInLinkRestriction.shouldRestrict, isActive ] );

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

	const onSaveValueToSession = ( newValue: DestinationProp[ 'value' ] | null ) => {
		const valueToSave: LinkPropValue[ 'value' ] | null = newValue
			? {
					...value,
					destination: newValue,
			  }
			: null;

		setLinkSessionValue( { ...linkSessionValue, value: valueToSave } );
	};

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
					<ControlLabel>{ label }</ControlLabel>
					<RestrictedLinkInfotip isVisible={ ! isActive } linkInLinkRestriction={ linkInLinkRestriction }>
						<ToggleIconControl
							disabled={ shouldDisableAddingLink }
							active={ isActive }
							onIconClick={ onEnabledChange }
							label={ __( 'Toggle link', 'elementor' ) }
						/>
					</RestrictedLinkInfotip>
				</Stack>
				<Collapse in={ isActive } timeout="auto" unmountOnExit>
					<Stack gap={ 1.5 }>
						<PropKeyProvider bind={ 'destination' }>
							<QueryControl
								queryOptions={ queryOptions }
								allowCustomValues={ allowCustomValues }
								minInputLength={ minInputLength }
								placeholder={ placeholder }
								onSetValue={ onSaveValueToSession }
								ariaLabel={ ariaLabel || label }
							/>
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
