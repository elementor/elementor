import * as React from 'react';
import { useMemo, useState } from 'react';
import { createPropsResolver, type PropsResolver } from '@elementor/editor-canvas';
import { type PropKey, type PropType } from '@elementor/editor-props';
import { PopoverHeader } from '@elementor/editor-ui';
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

import { useSectionWidth } from '../../contexts/section-context';
import { useDirection } from '../../hooks/use-direction';
import { useNormalizedInheritanceChainItems } from '../hooks/use-normalized-inheritance-chain-items';
import { stylesInheritanceTransformersRegistry } from '../styles-inheritance-transformers-registry';
import { type SnapshotPropValue } from '../types';
import { ActionIcons, BreakpointIcon, LabelChip, ValueComponent } from './infotip';

const SECTION_PADDING_INLINE = 32;

type Props = {
	inheritanceChain: SnapshotPropValue[];
	propType: PropType;
	path: PropKey[];
	label: string;
	children: React.ReactNode;
};

export const StylesInheritanceInfotip = ( { inheritanceChain, propType, path, label, children }: Props ) => {
	const [ showInfotip, setShowInfotip ] = useState< boolean >( false );
	const toggleInfotip = () => setShowInfotip( ( prev ) => ! prev );
	const closeInfotip = () => setShowInfotip( false );

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
					maxWidth: 496,
					overflowX: 'hidden',
				} }
			>
				<CardContent
					sx={ {
						display: 'flex',
						gap: 0.5,
						flexDirection: 'column',
						p: 0,
						'&:last-child': {
							pb: 0,
						},
					} }
				>
					<PopoverHeader title={ __( 'Style origin', 'elementor' ) } onClose={ closeInfotip } />

					<Stack
						gap={ 1.5 }
						sx={ { pl: 2, pr: 1, pb: 2, overflowX: 'hidden', overflowY: 'auto' } }
						role="list"
					>
						{ items.map( ( item, index ) => {
							return (
								<Box
									key={ item.id }
									display="flex"
									gap={ 0.5 }
									role="listitem"
									/* translators: %s: Label of the inheritance item */
									aria-label={ __( 'Inheritance item: %s', 'elementor' ).replace(
										'%s',
										item.displayLabel
									) }
								>
									<Box display="flex" gap={ 0.5 } sx={ { flexWrap: 'wrap', width: '100%' } }>
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

	return (
		<TooltipOrInfotip showInfotip={ showInfotip } onClose={ closeInfotip } infotipContent={ infotipContent }>
			<IconButton onClick={ toggleInfotip } aria-label={ label } sx={ { my: '-1px' } }>
				{ children }
			</IconButton>
		</TooltipOrInfotip>
	);
};

function TooltipOrInfotip( {
	children,
	showInfotip,
	onClose,
	infotipContent,
}: {
	children: React.ReactNode;
	showInfotip: boolean;
	onClose: () => void;
	infotipContent: React.ReactNode;
} ) {
	const { isSiteRtl } = useDirection();
	const forceInfotipAlignLeft = isSiteRtl ? 9999999 : -9999999;

	if ( showInfotip ) {
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
									options: { offset: [ forceInfotipAlignLeft, 0 ] },
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
