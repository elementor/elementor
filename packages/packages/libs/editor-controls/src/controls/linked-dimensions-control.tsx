import * as React from 'react';
import { type RefObject, useLayoutEffect, useRef, useState } from 'react';
import { dimensionsPropTypeUtil, type PropKey, sizePropTypeUtil } from '@elementor/editor-props';
import { useActiveBreakpoint } from '@elementor/editor-responsive';
import { DetachIcon, LinkIcon, SideBottomIcon, SideLeftIcon, SideRightIcon, SideTopIcon } from '@elementor/icons';
import { Grid, Stack, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { ControlLabel } from '../components/control-label';
import { StyledToggleButton } from '../components/control-toggle-button-group';
import { type ExtendedOption } from '../utils/size-control';
import { SizeControl } from './size-control';

type Props = {
	label: string;
	isSiteRtl?: boolean;
	extendedOptions?: ExtendedOption[];
	min?: number;
};

export const LinkedDimensionsControl = ( { label, isSiteRtl = false, extendedOptions, min }: Props ) => {
	const gridRowRefs: RefObject< HTMLDivElement >[] = [ useRef( null ), useRef( null ) ];

	const { disabled: sizeDisabled } = useBoundProp( sizePropTypeUtil );

	const {
		value: dimensionsValue,
		setValue: setDimensionsValue,
		propType,
		placeholder: dimensionsPlaceholder,
		disabled: dimensionsDisabled,
	} = useBoundProp( dimensionsPropTypeUtil );

	const { value: masterValue, placeholder: masterPlaceholder, setValue: setMasterValue } = useBoundProp();

	const inferIsLinked = () => {
		if ( dimensionsPropTypeUtil.isValid( masterValue ) ) {
			return false;
		}

		if ( ! masterValue && dimensionsPropTypeUtil.isValid( masterPlaceholder ) ) {
			return false;
		}

		return true;
	};

	const [ isLinked, setIsLinked ] = useState( () => inferIsLinked() );

	const activeBreakpoint = useActiveBreakpoint();

	useLayoutEffect( () => {
		setIsLinked( inferIsLinked );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ activeBreakpoint ] );

	const onLinkToggle = () => {
		setIsLinked( ( prev ) => ! prev );

		if ( ! dimensionsPropTypeUtil.isValid( masterValue ) ) {
			const value = masterValue ? masterValue : null;

			if ( ! value ) {
				setMasterValue( null );
				return;
			}

			setMasterValue(
				dimensionsPropTypeUtil.create( {
					'block-start': value,
					'block-end': value,
					'inline-start': value,
					'inline-end': value,
				} )
			);

			return;
		}

		const sizeValue =
			dimensionsValue?.[ 'block-start' ] ??
			dimensionsValue?.[ 'inline-end' ] ??
			dimensionsValue?.[ 'block-end' ] ??
			dimensionsValue?.[ 'inline-start' ] ??
			null;

		if ( ! sizeValue ) {
			setMasterValue( null );
			return;
		}

		setMasterValue( sizeValue );
	};

	const tooltipLabel = label.toLowerCase();

	const LinkedIcon = isLinked ? LinkIcon : DetachIcon;
	// translators: %s: Tooltip title.
	const linkedLabel = __( 'Link %s', 'elementor' ).replace( '%s', tooltipLabel );
	// translators: %s: Tooltip title.
	const unlinkedLabel = __( 'Unlink %s', 'elementor' ).replace( '%s', tooltipLabel );

	const disabled = sizeDisabled || dimensionsDisabled;

	const propProviderProps = {
		propType,
		value: dimensionsValue,
		placeholder: dimensionsPlaceholder,
		setValue: setDimensionsValue,
		isDisabled: () => dimensionsDisabled,
	};

	const hasPlaceholders = ! masterValue && ( dimensionsPlaceholder || masterPlaceholder );

	return (
		<PropProvider { ...propProviderProps }>
			<Stack direction="row" gap={ 2 } flexWrap="nowrap">
				<ControlFormLabel>{ label }</ControlFormLabel>
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

			{ getCssDimensionProps( isSiteRtl ).map( ( row, index ) => (
				<Stack direction="row" gap={ 2 } flexWrap="nowrap" key={ index } ref={ gridRowRefs[ index ] }>
					{ row.map( ( { icon, ...props } ) => (
						<Grid container gap={ 0.75 } alignItems="center" key={ props.bind }>
							<Grid item xs={ 12 }>
								<Label { ...props } />
							</Grid>
							<Grid item xs={ 12 }>
								<Control
									bind={ props.bind }
									startIcon={ icon }
									isLinked={ isLinked }
									extendedOptions={ extendedOptions }
									anchorRef={ gridRowRefs[ index ] }
									min={ min }
								/>
							</Grid>
						</Grid>
					) ) }
				</Stack>
			) ) }
		</PropProvider>
	);
};

const Control = ( {
	bind,
	startIcon,
	isLinked,
	extendedOptions,
	anchorRef,
	min,
}: {
	bind: PropKey;
	startIcon: React.ReactNode;
	isLinked: boolean;
	extendedOptions?: ExtendedOption[];
	anchorRef: RefObject< HTMLDivElement >;
	min?: number;
} ) => {
	if ( isLinked ) {
		return (
			<SizeControl
				startIcon={ startIcon }
				extendedOptions={ extendedOptions }
				anchorRef={ anchorRef }
				min={ min }
			/>
		);
	}

	return (
		<PropKeyProvider bind={ bind }>
			<SizeControl
				startIcon={ startIcon }
				extendedOptions={ extendedOptions }
				anchorRef={ anchorRef }
				min={ min }
			/>
		</PropKeyProvider>
	);
};

const Label = ( { label, bind }: { label: string; bind: PropKey } ) => {
	return (
		<PropKeyProvider bind={ bind }>
			<ControlLabel>{ label }</ControlLabel>
		</PropKeyProvider>
	);
};

function getCssDimensionProps( isSiteRtl: boolean ) {
	return [
		[
			{
				bind: 'block-start',
				label: __( 'Top', 'elementor' ),
				icon: <SideTopIcon fontSize={ 'tiny' } />,
			},
			{
				bind: 'inline-end',
				label: isSiteRtl ? __( 'Left', 'elementor' ) : __( 'Right', 'elementor' ),
				icon: isSiteRtl ? <SideLeftIcon fontSize={ 'tiny' } /> : <SideRightIcon fontSize={ 'tiny' } />,
			},
		],
		[
			{
				bind: 'block-end',
				label: __( 'Bottom', 'elementor' ),
				icon: <SideBottomIcon fontSize={ 'tiny' } />,
			},
			{
				bind: 'inline-start',
				label: isSiteRtl ? __( 'Right', 'elementor' ) : __( 'Left', 'elementor' ),
				icon: isSiteRtl ? <SideRightIcon fontSize={ 'tiny' } /> : <SideLeftIcon fontSize={ 'tiny' } />,
			},
		],
	];
}
