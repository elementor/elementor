import * as React from 'react';
import { type RefObject, useLayoutEffect, useRef, useState } from 'react';
import {
	layoutDirectionPropTypeUtil,
	type LayoutDirectionPropValue,
	type PropKey,
	type PropValue,
	sizePropTypeUtil,
	type SizePropValue,
} from '@elementor/editor-props';
import { useActiveBreakpoint } from '@elementor/editor-responsive';
import { DetachIcon, LinkIcon } from '@elementor/icons';
import { Grid, Stack, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { ControlLabel } from '../components/control-label';
import { StyledToggleButton } from '../components/control-toggle-button-group';
import { UnstableSizeControl } from './size-control/unstable-size-control';

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

	const isCurrentlyDirection = layoutDirectionPropTypeUtil.isValid( masterValue ?? masterPlaceholder );

	const activeBreakpoint = useActiveBreakpoint();
	useLayoutEffect( () => {
		setIsLinked( inferIsLinked() );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ activeBreakpoint, isCurrentlyDirection ] );

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
		value: directionValue ?? ( ! isLinked ? { row: masterPlaceholder, column: masterPlaceholder } : null ),
		setValue: ( directions: PropValue ) => {
			const entries = Object.entries( directions as LayoutDirectionPropValue );
			const filtered = entries.filter( ( [ , value ] ) => Boolean( value ) );

			setDirectionValue( filtered.length === 0 ? null : Object.fromEntries( filtered ) );
		},
		placeholder: directionPlaceholder,
	};

	const hasPlaceholders = ! masterValue && ( directionPlaceholder || masterPlaceholder );

	const getEffectivePlaceholder = ( bind: string ) => {
		if ( isLinked ) {
			const linkedPlaceholder = directionPlaceholder?.column ?? directionPlaceholder?.row;

			return sizePropTypeUtil.extract( linkedPlaceholder );
		}

		return sizePropTypeUtil.extract( directionPlaceholder?.[ bind as keyof LayoutDirectionPropValue[ 'value' ] ] );
	};

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
						<Control
							bind={ 'column' }
							ariaLabel={ __( 'Column gap', 'elementor' ) }
							isLinked={ isLinked }
							anchorRef={ stackRef }
							placeholder={ getEffectivePlaceholder( 'column' ) ?? undefined }
						/>
					</Grid>
				</Grid>
				<Grid container gap={ 0.75 } alignItems="center">
					<Grid item xs={ 12 }>
						<ControlFormLabel>{ __( 'Row', 'elementor' ) }</ControlFormLabel>
					</Grid>
					<Grid item xs={ 12 }>
						<Control
							bind={ 'row' }
							ariaLabel={ __( 'Row gap', 'elementor' ) }
							isLinked={ isLinked }
							anchorRef={ stackRef }
							placeholder={ getEffectivePlaceholder( 'row' ) ?? undefined }
						/>
					</Grid>
				</Grid>
			</Stack>
		</PropProvider>
	);
};

const Control = ( {
	bind,
	ariaLabel,
	isLinked,
	anchorRef,
	placeholder,
}: {
	bind: PropKey;
	ariaLabel?: string;
	isLinked: boolean;
	placeholder?: SizePropValue[ 'value' ];
	anchorRef: RefObject< HTMLDivElement >;
} ) => {
	if ( isLinked ) {
		return <UnstableSizeControl anchorRef={ anchorRef } placeholder={ placeholder } ariaLabel={ ariaLabel } />;
	}

	return (
		<PropKeyProvider bind={ bind }>
			<UnstableSizeControl anchorRef={ anchorRef } placeholder={ placeholder } ariaLabel={ ariaLabel } />
		</PropKeyProvider>
	);
};
