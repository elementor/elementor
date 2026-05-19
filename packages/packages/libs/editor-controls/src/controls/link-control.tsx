import * as React from 'react';
import { useEffect, useState } from 'react';
import { getLinkInLinkRestriction, type LinkInLinkRestriction } from '@elementor/editor-elements';
import { linkPropTypeUtil, type LinkPropValue } from '@elementor/editor-props';
import { __privateUseListenTo as useListenTo, commandEndEvent } from '@elementor/editor-v1-adapters';
import { MinusIcon, PlusIcon } from '@elementor/icons';
import { useSessionStorage } from '@elementor/session';
import { Collapse, Grid, IconButton, Stack } from '@elementor/ui';
import { useDebouncedCallback } from '@elementor/utils';
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
	const linkPlaceholder = propContext.placeholder;
	const [ linkSessionValue, setLinkSessionValue ] = useSessionStorage< LinkSessionValue >( path.join( '/' ) );
	const [ isActive, setIsActive ] = useState( !! value || !! linkPlaceholder );

	const {
		allowCustomValues = true,
		queryOptions,
		placeholder,
		minInputLength = 2,
		context: { elementId },
		label = __( 'Link', 'elementor' ),
		ariaLabel,
	} = props || {};

	const [ linkInLinkRestriction, setLinkInLinkRestriction ] = useState(
		getLinkInLinkRestriction( elementId, value ?? linkPlaceholder )
	);

	const shouldDisableAddingLink = ! isActive && linkInLinkRestriction.shouldRestrict;

	const debouncedCheckRestriction = useDebouncedCallback( () => {
		const newRestriction = getLinkInLinkRestriction( elementId, value ?? linkPlaceholder );

		if ( newRestriction.shouldRestrict && isActive && ! linkPlaceholder ) {
			setIsActive( false );

			if ( value !== null ) {
				setValue( null );
			}
		}

		setLinkInLinkRestriction( ( prev ) => ( isSameRestriction( prev, newRestriction ) ? prev : newRestriction ) );
	}, 300 );

	useListenTo(
		commandEndEvent( 'document/elements/set-settings' ),
		() => {
			debouncedCheckRestriction();
		},
		[ debouncedCheckRestriction ]
	);

	useEffect( () => {
		debouncedCheckRestriction();

		const handleInlineLinkChanged = () => {
			debouncedCheckRestriction();
		};

		window.addEventListener( 'elementor:inline-link-changed', handleInlineLinkChanged );

		return () => {
			window.removeEventListener( 'elementor:inline-link-changed', handleInlineLinkChanged );
		};
	}, [ elementId, debouncedCheckRestriction ] );

	const onEnabledChange = () => {
		setLinkInLinkRestriction( getLinkInLinkRestriction( elementId, value ?? linkPlaceholder ) );

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
						<IconButton
							size={ SIZE }
							onClick={ onEnabledChange }
							aria-label={ __( 'Toggle link', 'elementor' ) }
							disabled={ shouldDisableAddingLink }
						>
							{ isActive ? <MinusIcon fontSize={ SIZE } /> : <PlusIcon fontSize={ SIZE } /> }
						</IconButton>
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

function isSameRestriction( a: LinkInLinkRestriction, b: LinkInLinkRestriction ): boolean {
	return a.shouldRestrict === b.shouldRestrict && a.reason === b.reason && a.elementId === b.elementId;
}
