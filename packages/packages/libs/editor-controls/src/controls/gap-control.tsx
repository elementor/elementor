import * as React from 'react';
import { type RefObject, useLayoutEffect, useRef, useState } from 'react';
import { layoutDirectionPropTypeUtil, type PropKey, sizePropTypeUtil } from '@elementor/editor-props';
import { useActiveBreakpoint } from '@elementor/editor-responsive';
import { DetachIcon, LinkIcon } from '@elementor/icons';
import { Grid, Stack, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { ControlLabel } from '../components/control-label';
import { StyledToggleButton } from '../components/control-toggle-button-group';
import { SizeControl } from './size-control';

export const GapControl = ( { label }: { label: string } ) => {
	const stackRef = useRef< HTMLDivElement >( null );

	const { disabled: sizeDisabled } = useBoundProp( sizePropTypeUtil );

	const {
		value: directionValue,
		setValue: setDirectionValue,
		propType,
		placeholder: directionPlaceholder,
		disabled: directionDisabled,
	} = useBoundProp( layoutDirectionPropTypeUtil );

	const { value: masterValue, setValue: setMasterValue, placeholder: masterPlaceholder } = useBoundProp();

	const inferIsLinked = () => {
		if ( layoutDirectionPropTypeUtil.isValid( masterValue ) ) {
			return false;
		}

		if ( ! masterValue && layoutDirectionPropTypeUtil.isValid( masterPlaceholder ) ) {
			return false;
		}

		return true;
	};

	const [ isLinked, setIsLinked ] = useState( () => inferIsLinked() );

	const activeBreakpoint = useActiveBreakpoint();
	useLayoutEffect( () => {
		setIsLinked( inferIsLinked() );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ activeBreakpoint ] );

	const onLinkToggle = () => {
		setIsLinked( ( prev ) => ! prev );

		if ( ! layoutDirectionPropTypeUtil.isValid( masterValue ) ) {
			const currentValue = masterValue ? masterValue : null;

			if ( ! currentValue ) {
				setMasterValue( null );
				return;
			}

			setMasterValue(
				layoutDirectionPropTypeUtil.create( {
					row: currentValue,
					column: currentValue,
				} )
			);

			return;
		}

		const currentValue = directionValue?.column ?? directionValue?.row ?? null;

		setMasterValue( currentValue );
	};

	const tooltipLabel = label.toLowerCase();

	const LinkedIcon = isLinked ? LinkIcon : DetachIcon;
	// translators: %s: Tooltip title.
	const linkedLabel = __( 'Link %s', 'elementor' ).replace( '%s', tooltipLabel );
	// translators: %s: Tooltip title.
	const unlinkedLabel = __( 'Unlink %s', 'elementor' ).replace( '%s', tooltipLabel );

	const disabled = sizeDisabled || directionDisabled;

	const propProviderProps = {
		propType,
		value: directionValue,
		setValue: setDirectionValue,
		placeholder: directionPlaceholder,
	};

	const hasPlaceholders = ! masterValue && ( directionPlaceholder || masterPlaceholder );

	return (
		<PropProvider { ...propProviderProps }>
			<Stack direction="row" gap={ 2 } flexWrap="nowrap">
				<ControlLabel>{ label }</ControlLabel>
				<Tooltip title={ isLinked ? unlinkedLabel : linkedLabel } placement="top">
					<StyledToggleButton
						aria-label={ isLinked ? unlinkedLabel : linkedLabel }
						size={ 'tiny' }
						value={ 'check' }
						selected={ isLinked }
						sx={ { marginLeft: 'auto' } }
						onChange={ onLinkToggle }
						disabled={ disabled }
						isPlaceholder={ hasPlaceholders }
					>
						<LinkedIcon fontSize={ 'tiny' } />
					</StyledToggleButton>
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
};

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
