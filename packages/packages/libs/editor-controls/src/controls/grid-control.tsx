import * as React from 'react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gridPropTypeUtil, numberPropTypeUtil, sizePropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { PopoverHeader, SectionPopoverBody } from '@elementor/editor-ui';
import {
	ArrowsMoveHorizontalIcon,
	ArrowsMoveVerticalIcon,
	ChevronDownIcon,
	DetachIcon,
	LinkIcon,
	SettingsIcon,
} from '@elementor/icons';
import {
	Box,
	Button,
	Collapse,
	Divider,
	Grid,
	IconButton,
	Popover,
	Stack,
	Tooltip,
	Typography,
	bindPopover,
	bindTrigger,
	usePopupState,
} from '@elementor/ui';
import { __, sprintf } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { ControlLabel } from '../components/control-label';
import { StyledToggleButton } from '../components/control-toggle-button-group';
import { createControl } from '../create-control';
import { clampGridDimension, parseClampedGridDimension } from './grid-dimension-utils';
import { GridDimensionMatrix } from './grid-dimension-matrix';
import { NumberControl } from './number-control';
import { SelectControl } from './select-control';
import { SizeControl } from './size-control';
import { TextControl } from './text-control';

const COLUMNS_LABEL = __( 'Columns', 'elementor' );
const ROWS_LABEL = __( 'Rows', 'elementor' );
const GAPS_LABEL = __( 'Gaps', 'elementor' );
const AUTO_FLOW_LABEL = __( 'Auto flow', 'elementor' );
const CUSTOM_COLUMNS_LABEL = __( 'Custom columns', 'elementor' );
const CUSTOM_ROWS_LABEL = __( 'Custom rows', 'elementor' );
const OPEN_GRID_SETTINGS_DEFAULT = __( 'Open grid settings', 'elementor' );
const CLOSE_GRID_SETTINGS_DEFAULT = __( 'Close grid settings', 'elementor' );
const GRID_POPOVER_TITLE = __( 'Grid', 'elementor' );
const GRID_SETTINGS_TOOLTIP = __( 'Expand grid settings', 'elementor' );
const gridTriggerLabel = ( c: number, r: number ) => sprintf( __( '%d × %d', 'elementor' ), c, r );
const CUSTOM_TRACKS_HELPER = __(
	'Custom column or row tracks are set. Clear them under grid settings to edit dimensions here.',
	'elementor'
);

const AUTO_FLOW_OPTIONS = [
	{ value: 'row', label: __( 'Row', 'elementor' ) },
	{ value: 'column', label: __( 'Column', 'elementor' ) },
	{ value: 'dense', label: __( 'Dense', 'elementor' ) },
	{ value: 'row dense', label: __( 'Row dense', 'elementor' ) },
	{ value: 'column dense', label: __( 'Column dense', 'elementor' ) },
];

export type GridControlProps = {
	advancedOpen?: boolean;
	onAdvancedOpenChange?: ( open: boolean ) => void;
	openGridSettingsLabel?: string;
	closeGridSettingsLabel?: string;
	/** Rendered inside the popover when “Open grid settings” is expanded (e.g. grid container alignment). */
	advancedAlignmentSlot?: React.ReactNode;
};

export function createDefaultGridInner() {
	return {
		columnsCount: numberPropTypeUtil.create( 3 ),
		rowsCount: numberPropTypeUtil.create( 2 ),
		columnsTemplate: stringPropTypeUtil.create( '' ),
		rowsTemplate: stringPropTypeUtil.create( '' ),
		columnGap: sizePropTypeUtil.create( { unit: 'px', size: '' } ),
		rowGap: sizePropTypeUtil.create( { unit: 'px', size: '' } ),
		autoFlow: stringPropTypeUtil.create( 'row' ),
	};
}

const templateText = ( v: unknown ) => ( stringPropTypeUtil.extract( v as never ) ?? '' ).trim();

const LinkedGapRow = ( { stackRef }: { stackRef: React.RefObject< HTMLDivElement | null > } ) => {
	const inferIsLinked = ( columnGap: unknown, rowGap: unknown ) => {
		const c = sizePropTypeUtil.extract( columnGap as never );
		const r = sizePropTypeUtil.extract( rowGap as never );
		if ( ! c && ! r ) {
			return true;
		}
		return JSON.stringify( c ) === JSON.stringify( r );
	};

	const gridCtx = useBoundProp( gridPropTypeUtil );
	const col = gridCtx.value?.columnGap;
	const row = gridCtx.value?.rowGap;
	const [ isLinked, setIsLinked ] = useState( () => inferIsLinked( col, row ) );

	useLayoutEffect( () => {
		setIsLinked( inferIsLinked( col, row ) );
	}, [ col, row ] );

	useLayoutEffect( () => {
		if ( ! isLinked || ! gridCtx.value ) {
			return;
		}
		const inner = gridCtx.value;
		if ( JSON.stringify( inner.columnGap ) === JSON.stringify( inner.rowGap ) ) {
			return;
		}
		gridCtx.setValue( { ...inner, rowGap: inner.columnGap }, {} );
	}, [ isLinked, col, gridCtx ] );

	const onLinkToggle = () => {
		const inner = gridCtx.value;
		if ( ! inner ) {
			return;
		}
		if ( isLinked ) {
			setIsLinked( false );
			return;
		}
		const colExtract = sizePropTypeUtil.extract( inner.columnGap as never );
		const synced = colExtract
			? sizePropTypeUtil.create( colExtract )
			: sizePropTypeUtil.create( { unit: 'px', size: '' } );
		gridCtx.setValue(
			{
				...inner,
				columnGap: synced,
				rowGap: synced,
			},
			{}
		);
		setIsLinked( true );
	};

	const LinkedIcon = isLinked ? LinkIcon : DetachIcon;
	const tooltipLabel = GAPS_LABEL.toLowerCase();
	const linkedLabel = __( 'Link %s', 'elementor' ).replace( '%s', tooltipLabel );
	const unlinkedLabel = __( 'Unlink %s', 'elementor' ).replace( '%s', tooltipLabel );

	return (
		<>
			<Stack direction="row" gap={ 2 } flexWrap="nowrap" alignItems="center">
				<ControlLabel>{ GAPS_LABEL }</ControlLabel>
				<Tooltip title={ isLinked ? unlinkedLabel : linkedLabel } placement="top">
					<StyledToggleButton
						aria-label={ isLinked ? unlinkedLabel : linkedLabel }
						size="tiny"
						value="check"
						selected={ isLinked }
						sx={ { marginLeft: 'auto' } }
						onChange={ onLinkToggle }
						disabled={ gridCtx.disabled }
					>
						<LinkedIcon fontSize="tiny" />
					</StyledToggleButton>
				</Tooltip>
			</Stack>
			<Stack direction="row" gap={ 2 } flexWrap="nowrap" ref={ stackRef }>
				{ isLinked ? (
					<Grid container gap={ 0.75 } alignItems="center" sx={ { width: '100%' } }>
						<Grid item xs={ 12 }>
							<ControlFormLabel>{ __( 'Gap', 'elementor' ) }</ControlFormLabel>
						</Grid>
						<Grid item xs={ 12 }>
							<PropKeyProvider bind="columnGap">
								<SizeControl anchorRef={ stackRef } ariaLabel={ __( 'Gap', 'elementor' ) } />
							</PropKeyProvider>
						</Grid>
					</Grid>
				) : (
					<>
						<Grid container gap={ 0.75 } alignItems="center">
							<Grid item xs={ 12 }>
								<ControlFormLabel>{ __( 'Column', 'elementor' ) }</ControlFormLabel>
							</Grid>
							<Grid item xs={ 12 }>
								<PropKeyProvider bind="columnGap">
									<SizeControl anchorRef={ stackRef } ariaLabel={ __( 'Column gap', 'elementor' ) } />
								</PropKeyProvider>
							</Grid>
						</Grid>
						<Grid container gap={ 0.75 } alignItems="center">
							<Grid item xs={ 12 }>
								<ControlFormLabel>{ __( 'Row', 'elementor' ) }</ControlFormLabel>
							</Grid>
							<Grid item xs={ 12 }>
								<PropKeyProvider bind="rowGap">
									<SizeControl anchorRef={ stackRef } ariaLabel={ __( 'Row gap', 'elementor' ) } />
								</PropKeyProvider>
							</Grid>
						</Grid>
					</>
				) }
			</Stack>
		</>
	);
};

export const GridControl = createControl( ( props: GridControlProps ) => {
	const {
		advancedOpen: advancedOpenProp,
		onAdvancedOpenChange,
		openGridSettingsLabel = OPEN_GRID_SETTINGS_DEFAULT,
		closeGridSettingsLabel = CLOSE_GRID_SETTINGS_DEFAULT,
		advancedAlignmentSlot,
	} = props;

	const stackRef = useRef< HTMLDivElement >( null );
	const gridField = useBoundProp( gridPropTypeUtil );
	const initialized = useRef( false );

	const [ internalAdvancedOpen, setInternalAdvancedOpen ] = useState( false );
	const isAdvancedControlled = advancedOpenProp !== undefined;
	const advancedOpen = isAdvancedControlled ? advancedOpenProp : internalAdvancedOpen;
	const setAdvancedOpen = useCallback(
		( next: boolean ) => {
			if ( isAdvancedControlled ) {
				onAdvancedOpenChange?.( next );
			} else {
				setInternalAdvancedOpen( next );
			}
		},
		[ isAdvancedControlled, onAdvancedOpenChange ]
	);

	useLayoutEffect( () => {
		if ( gridField.value !== null || initialized.current || gridField.disabled ) {
			return;
		}
		initialized.current = true;
		gridField.setValue( createDefaultGridInner(), {} );
	}, [ gridField.value, gridField.setValue, gridField.disabled ] );

	const inner = gridField.value;
	const columns = parseClampedGridDimension(
		numberPropTypeUtil.extract( inner?.columnsCount as never ),
		3
	);
	const rows = parseClampedGridDimension( numberPropTypeUtil.extract( inner?.rowsCount as never ), 2 );
	const hasCustomTracks =
		templateText( inner?.columnsTemplate ) !== '' || templateText( inner?.rowsTemplate ) !== '';
	const dimensionsLocked = hasCustomTracks || gridField.disabled;

	const onMatrixSelect = useCallback(
		( nextColumns: number, nextRows: number ) => {
			if ( ! inner || dimensionsLocked ) {
				return;
			}
			const c = clampGridDimension( nextColumns );
			const r = clampGridDimension( nextRows );
			gridField.setValue(
				{
					...inner,
					columnsCount: numberPropTypeUtil.create( c ),
					rowsCount: numberPropTypeUtil.create( r ),
				},
				{}
			);
		},
		[ dimensionsLocked, gridField, inner ]
	);

	const toggleAdvancedLabel = advancedOpen ? closeGridSettingsLabel : openGridSettingsLabel;
	const popoverState = usePopupState( { variant: 'popover' } );

	const openAdvancedInPanel = useCallback( () => {
		setAdvancedOpen( true );
	}, [ setAdvancedOpen ] );

	const headerIcon = (
		<Stack direction="row" alignItems="center" spacing={ 0.25 } sx={ { ml: 0.5 } } aria-hidden>
			<ArrowsMoveVerticalIcon fontSize="tiny" sx={ { opacity: 0.85 } } />
			<ArrowsMoveHorizontalIcon fontSize="tiny" sx={ { opacity: 0.85 } } />
		</Stack>
	);

	const headerActions = [
		<Tooltip key="grid-settings" placement="top" title={ GRID_SETTINGS_TOOLTIP }>
			<span>
				<IconButton
					size="small"
					aria-label={ openGridSettingsLabel }
					onClick={ openAdvancedInPanel }
					disabled={ gridField.disabled }
					sx={ { p: 0.5 } }
				>
					<SettingsIcon fontSize="tiny" />
				</IconButton>
			</span>
		</Tooltip>,
	];

	return (
		<PropProvider { ...gridField }>
			<Box>
				<Button
					fullWidth
					size="small"
					variant="outlined"
					color="secondary"
					disabled={ gridField.disabled }
					endIcon={ <ChevronDownIcon fontSize="tiny" /> }
					{ ...bindTrigger( popoverState ) }
					aria-haspopup="dialog"
					sx={ { justifyContent: 'space-between', textTransform: 'none', fontWeight: 500 } }
				>
					{ gridTriggerLabel( columns, rows ) }
				</Button>

				<Popover
					disablePortal
					disableScrollLock
					{ ...bindPopover( popoverState ) }
					onClose={ popoverState.close }
					anchorOrigin={ { vertical: 'bottom', horizontal: 'left' } }
					transformOrigin={ { vertical: 'top', horizontal: 'left' } }
					slotProps={ {
						paper: {
							sx: {
								mt: 0.5,
								maxWidth: 'min(100vw - 24px, 360px)',
								borderRadius: 1,
							},
						},
					} }
				>
					<SectionPopoverBody height="auto">
						<PopoverHeader
							title={ GRID_POPOVER_TITLE }
							icon={ headerIcon }
							onClose={ popoverState.close }
							actions={ headerActions }
						/>
						<Divider />
						<Box sx={ { px: 2, py: 1.5, overflow: 'auto', maxHeight: 'min(70vh, 520px)' } }>
							<Stack gap={ 1.5 }>
								<Stack direction="row" gap={ 1 } alignItems="flex-end" flexWrap="nowrap">
									<Stack flex={ 1 } gap={ 0.5 } minWidth={ 0 }>
										<ControlFormLabel>{ COLUMNS_LABEL }</ControlFormLabel>
										<PropKeyProvider bind="columnsCount">
											<NumberControl
												min={ 1 }
												max={ 24 }
												shouldForceInt
												isLocked={ dimensionsLocked }
												startIcon={ <ArrowsMoveVerticalIcon fontSize="tiny" sx={ { opacity: 0.72 } } /> }
											/>
										</PropKeyProvider>
									</Stack>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={ { lineHeight: 2.25, flexShrink: 0, px: 0.25 } }
										aria-hidden
									>
										×
									</Typography>
									<Stack flex={ 1 } gap={ 0.5 } minWidth={ 0 }>
										<ControlFormLabel>{ ROWS_LABEL }</ControlFormLabel>
										<PropKeyProvider bind="rowsCount">
											<NumberControl
												min={ 1 }
												max={ 24 }
												shouldForceInt
												isLocked={ dimensionsLocked }
												startIcon={ <ArrowsMoveHorizontalIcon fontSize="tiny" sx={ { opacity: 0.72 } } /> }
											/>
										</PropKeyProvider>
									</Stack>
								</Stack>

								<GridDimensionMatrix
									columns={ columns }
									rows={ rows }
									onSelect={ onMatrixSelect }
									disabled={ dimensionsLocked }
								/>

								{ hasCustomTracks && (
									<Typography variant="caption" color="text.secondary">
										{ CUSTOM_TRACKS_HELPER }
									</Typography>
								) }

								<Button
									fullWidth
									size="small"
									variant="outlined"
									color="secondary"
									onClick={ () => setAdvancedOpen( ! advancedOpen ) }
									aria-expanded={ advancedOpen }
								>
									{ toggleAdvancedLabel }
								</Button>

								<Collapse in={ advancedOpen } timeout="auto">
									<Stack gap={ 1.5 } sx={ { pt: 0.5 } }>
										<LinkedGapRow stackRef={ stackRef } />
										<Stack gap={ 0.5 }>
											<ControlFormLabel>{ AUTO_FLOW_LABEL }</ControlFormLabel>
											<PropKeyProvider bind="autoFlow">
												<SelectControl options={ AUTO_FLOW_OPTIONS } ariaLabel={ AUTO_FLOW_LABEL } />
											</PropKeyProvider>
										</Stack>
										<Stack gap={ 0.5 }>
											<ControlFormLabel>{ CUSTOM_COLUMNS_LABEL }</ControlFormLabel>
											<Typography variant="caption" color="text.tertiary">
												{ __( 'Optional CSS track list (overrides column count).', 'elementor' ) }
											</Typography>
											<PropKeyProvider bind="columnsTemplate">
												<TextControl placeholder="e.g. repeat(3, 1fr) or 1fr 2fr" />
											</PropKeyProvider>
										</Stack>
										<Stack gap={ 0.5 }>
											<ControlFormLabel>{ CUSTOM_ROWS_LABEL }</ControlFormLabel>
											<Typography variant="caption" color="text.tertiary">
												{ __( 'Optional CSS track list (overrides row count).', 'elementor' ) }
											</Typography>
											<PropKeyProvider bind="rowsTemplate">
												<TextControl placeholder="e.g. repeat(2, minmax(40px, auto))" />
											</PropKeyProvider>
										</Stack>
										{ advancedAlignmentSlot ? (
											<>
												<Divider sx={ { my: 0.5 } } />
												<Stack gap={ 1.5 }>{ advancedAlignmentSlot }</Stack>
											</>
										) : null }
									</Stack>
								</Collapse>
							</Stack>
						</Box>
					</SectionPopoverBody>
				</Popover>
			</Box>
		</PropProvider>
	);
} );
