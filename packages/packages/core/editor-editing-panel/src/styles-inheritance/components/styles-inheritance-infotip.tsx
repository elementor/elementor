import * as React from 'react';
import { useMemo, useRef, useState } from 'react';
import {
	createPropsResolver,
	type PropsResolver,
	stylesInheritanceTransformersRegistry,
} from '@elementor/editor-canvas';
import { type PropKey, type PropType } from '@elementor/editor-props';
import { PopoverHeader, useSectionWidth } from '@elementor/editor-ui';
import {
	Backdrop,
	Box,
	Card,
	CardContent,
	ClickAwayListener,
	IconButton,
	Infotip,
	Stack,
	type Theme,
	Tooltip,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useDirection } from '../../hooks/use-direction';
import { useNormalizedInheritanceChainItems } from '../hooks/use-normalized-inheritance-chain-items';
import { type SnapshotPropValue } from '../types';
import { ActionIcons, BreakpointIcon, LabelChip, ValueComponent } from './infotip';

const SECTION_PADDING_INLINE = 32;
const INFOTIP_MAX_WIDTH = 496;

export const calculatePopoverOffset = (
	triggerRect: DOMRect | undefined,
	cardWidth: number,
	isSiteRtl: boolean
): number => {
	if ( ! triggerRect ) {
		return 0;
	}

	const triggerWidth = triggerRect.width;
	return isSiteRtl ? triggerWidth - cardWidth : -( cardWidth / 2 ) + triggerWidth / 2;
};

type Props = {
	inheritanceChain: SnapshotPropValue[];
	propType: PropType;
	path: PropKey[];
	label: string;
	children: React.ReactNode;
	isDisabled?: boolean;
};

export const StylesInheritanceInfotip = ( {
	inheritanceChain,
	propType,
	path,
	label,
	children,
	isDisabled,
}: Props ) => {
	const [ showInfotip, setShowInfotip ] = useState< boolean >( false );
	const triggerRef = useRef< HTMLDivElement >( null );

	const toggleInfotip = () => {
		if ( isDisabled ) {
			return;
		}
		setShowInfotip( ( prev ) => ! prev );
	};

	const closeInfotip = () => {
		if ( isDisabled ) {
			return;
		}
		setShowInfotip( false );
	};

	const key = path.join( '.' );

	const sectionWidth = useSectionWidth();

	const resolve = useMemo< PropsResolver >( () => {
		return createPropsResolver( {
			transformers: stylesInheritanceTransformersRegistry,
			schema: { [ key ]: propType },
		} );
	}, [ key, propType ] );

	const items = useNormalizedInheritanceChainItems( inheritanceChain, key, resolve );

	const infotipContent = (
		<ClickAwayListener onClickAway={ closeInfotip }>
			<Card
				elevation={ 0 }
				sx={ {
					width: `${ sectionWidth - SECTION_PADDING_INLINE }px`,
					maxWidth: INFOTIP_MAX_WIDTH,
					maxHeight: 268,
					overflowX: 'hidden',
					display: 'flex',
					flexDirection: 'column',
				} }
			>
				<Box
					sx={ {
						position: 'sticky',
						top: 0,
						zIndex: 1,
						backgroundColor: 'background.paper',
					} }
				>
					<PopoverHeader title={ __( 'Style origin', 'elementor' ) } onClose={ closeInfotip } />
				</Box>

				<CardContent
					sx={ {
						display: 'flex',
						flexDirection: 'column',
						p: 0,
						flex: 1,
						overflow: 'auto',
						'&:last-child': {
							pb: 0,
						},
					} }
				>
					<Stack gap={ 1.5 } sx={ { pl: 3, pr: 1, pb: 2 } } role="list">
						{ items.map( ( item, index ) => {
							return (
								<Box
									key={ item.id }
									display="flex"
									gap={ 0.5 }
									role="listitem"
									// translators: %s is the display label of the inheritance item
									aria-label={ __( 'Inheritance item: %s', 'elementor' ).replace(
										'%s',
										item.displayLabel
									) }
								>
									<Box
										display="flex"
										gap={ 0.5 }
										sx={ { flexWrap: 'wrap', width: '100%', alignItems: 'flex-start' } }
									>
										<BreakpointIcon breakpoint={ item.breakpoint } />
										<LabelChip displayLabel={ item.displayLabel } provider={ item.provider } />
										<ValueComponent index={ index } value={ item.value } />
									</Box>
									<ActionIcons />
								</Box>
							);
						} ) }
					</Stack>
				</CardContent>
			</Card>
		</ClickAwayListener>
	);

	if ( isDisabled ) {
		return <Box sx={ { display: 'inline-flex' } }>{ children }</Box>;
	}

	return (
		<Box ref={ triggerRef } sx={ { display: 'inline-flex' } }>
			<TooltipOrInfotip
				showInfotip={ showInfotip }
				onClose={ closeInfotip }
				infotipContent={ infotipContent }
				isDisabled={ isDisabled }
				triggerRef={ triggerRef }
				sectionWidth={ sectionWidth }
			>
				<IconButton
					onClick={ toggleInfotip }
					aria-label={ label }
					sx={ { my: '-1px' } }
					disabled={ isDisabled }
				>
					{ children }
				</IconButton>
			</TooltipOrInfotip>
		</Box>
	);
};

function TooltipOrInfotip( {
	children,
	showInfotip,
	onClose,
	infotipContent,
	isDisabled,
	triggerRef,
	sectionWidth,
}: {
	children: React.ReactNode;
	showInfotip: boolean;
	onClose: () => void;
	infotipContent: React.ReactNode;
	isDisabled?: boolean;
	triggerRef: React.RefObject< HTMLDivElement >;
	sectionWidth: number;
} ) {
	const direction = useDirection();
	const isSiteRtl = direction.isSiteRtl;

	if ( isDisabled ) {
		return <Box sx={ { display: 'inline-flex' } }>{ children }</Box>;
	}

	if ( showInfotip ) {
		const triggerRect = triggerRef.current?.getBoundingClientRect();
		const cardWidth = Math.min( sectionWidth - SECTION_PADDING_INLINE, INFOTIP_MAX_WIDTH );
		const offsetX = calculatePopoverOffset( triggerRect, cardWidth, isSiteRtl );

		return (
			<>
				<Backdrop
					open={ showInfotip }
					onClick={ onClose }
					sx={ {
						backgroundColor: 'transparent',
						zIndex: ( theme: Theme ) => theme.zIndex.modal - 1,
					} }
				/>
				<Infotip
					placement="top"
					content={ infotipContent }
					open={ showInfotip }
					onClose={ onClose }
					disableHoverListener
					componentsProps={ {
						tooltip: {
							sx: { mx: 2 },
						},
					} }
					slotProps={ {
						popper: {
							modifiers: [
								{
									name: 'offset',
									options: { offset: [ offsetX, 0 ] },
								},
							],
						},
					} }
				>
					{ children }
				</Infotip>
			</>
		);
	}

	return (
		<Tooltip title={ __( 'Style origin', 'elementor' ) } placement="top">
			{ children }
		</Tooltip>
	);
}
