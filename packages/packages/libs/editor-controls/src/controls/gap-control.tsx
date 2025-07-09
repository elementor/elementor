import * as React from 'react';
import { type RefObject, useRef } from 'react';
import { layoutDirectionPropTypeUtil, type PropKey, sizePropTypeUtil } from '@elementor/editor-props';
import { DetachIcon, LinkIcon } from '@elementor/icons';
import { Grid, Stack, ToggleButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { ControlLabel } from '../components/control-label';
import { createControl } from '../create-control';
import { SizeControl } from './size-control';

export const GapControl = createControl( ( { label }: { label: string } ) => {
	const {
		value: directionValue,
		setValue: setDirectionValue,
		propType,
		disabled: directionDisabled,
	} = useBoundProp( layoutDirectionPropTypeUtil );

	const stackRef = useRef< HTMLDivElement >( null );

	const { value: sizeValue, setValue: setSizeValue, disabled: sizeDisabled } = useBoundProp( sizePropTypeUtil );

	const isLinked = ! directionValue && ! sizeValue ? true : !! sizeValue;

	const onLinkToggle = () => {
		if ( ! isLinked ) {
			setSizeValue( directionValue?.column?.value ?? null );
			return;
		}

		const value = sizeValue ? sizePropTypeUtil.create( sizeValue ) : null;

		setDirectionValue( {
			row: value,
			column: value,
		} );
	};

	const tooltipLabel = label.toLowerCase();

	const LinkedIcon = isLinked ? LinkIcon : DetachIcon;
	// translators: %s: Tooltip title.
	const linkedLabel = __( 'Link %s', 'elementor' ).replace( '%s', tooltipLabel );
	// translators: %s: Tooltip title.
	const unlinkedLabel = __( 'Unlink %s', 'elementor' ).replace( '%s', tooltipLabel );

	const disabled = sizeDisabled || directionDisabled;

	return (
		<PropProvider propType={ propType } value={ directionValue } setValue={ setDirectionValue }>
			<Stack direction="row" gap={ 2 } flexWrap="nowrap">
				<ControlLabel>{ label }</ControlLabel>
				<Tooltip title={ isLinked ? unlinkedLabel : linkedLabel } placement="top">
					<ToggleButton
						aria-label={ isLinked ? unlinkedLabel : linkedLabel }
						size={ 'tiny' }
						value={ 'check' }
						selected={ isLinked }
						sx={ { marginLeft: 'auto' } }
						onChange={ onLinkToggle }
						disabled={ disabled }
					>
						<LinkedIcon fontSize={ 'tiny' } />
					</ToggleButton>
				</Tooltip>
			</Stack>
			<Stack direction="row" gap={ 2 } flexWrap="nowrap" ref={ stackRef }>
				<Grid container gap={ 0.75 } alignItems="center">
					<Grid item xs={ 12 }>
						<ControlFormLabel>{ __( 'Column', 'elementor' ) }</ControlFormLabel>
					</Grid>
					<Grid item xs={ 12 }>
						<Control bind={ 'column' } isLinked={ isLinked } anchorRef={ stackRef } />
					</Grid>
				</Grid>
				<Grid container gap={ 0.75 } alignItems="center">
					<Grid item xs={ 12 }>
						<ControlFormLabel>{ __( 'Row', 'elementor' ) }</ControlFormLabel>
					</Grid>
					<Grid item xs={ 12 }>
						<Control bind={ 'row' } isLinked={ isLinked } anchorRef={ stackRef } />
					</Grid>
				</Grid>
			</Stack>
		</PropProvider>
	);
} );

const Control = ( {
	bind,
	isLinked,
	anchorRef,
}: {
	bind: PropKey;
	isLinked: boolean;
	anchorRef: RefObject< HTMLDivElement >;
} ) => {
	if ( isLinked ) {
		return <SizeControl anchorRef={ anchorRef } />;
	}

	return (
		<PropKeyProvider bind={ bind }>
			<SizeControl anchorRef={ anchorRef } />
		</PropKeyProvider>
	);
};
