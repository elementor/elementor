import * as React from 'react';
import { type PropKey } from '@elementor/editor-props';
import { Box, Tab, TabPanel, Tabs } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider } from '../../bound-prop-context';
import { PopoverContent } from '../../components/popover-content';
import { Move } from './functions/move';
import { Rotate } from './functions/rotate';
import { Scale } from './functions/scale';
import { initialRotateValue, initialScaleValue, initialTransformValue, TransformFunctionKeys } from './types';
import { useTransformTabsHistory } from './use-transform-tabs-history';

export const TransformContent = ( { bind }: { anchorEl?: HTMLElement | null; bind: PropKey } ) => {
	return (
		<PropKeyProvider bind={ bind }>
			<Content />
		</PropKeyProvider>
	);
};

const Content = () => {
	const { getTabsProps, getTabProps, getTabPanelProps } = useTransformTabsHistory( {
		move: initialTransformValue.value,
		scale: initialScaleValue.value,
		rotate: initialRotateValue.value,
	} );

	return (
		<PopoverContent>
			<Box sx={ { width: '100%' } }>
				<Box sx={ { borderBottom: 1, borderColor: 'divider' } }>
					<Tabs
						size="small"
						variant="fullWidth"
						{ ...getTabsProps() }
						aria-label={ __( 'Transform', 'elementor' ) }
					>
						<Tab label={ __( 'Move', 'elementor' ) } { ...getTabProps( TransformFunctionKeys.move ) } />
						<Tab label={ __( 'Scale', 'elementor' ) } { ...getTabProps( TransformFunctionKeys.scale ) } />
						<Tab label={ __( 'Rotate', 'elementor' ) } { ...getTabProps( TransformFunctionKeys.rotate ) } />
					</Tabs>
				</Box>
				<TabPanel sx={ { p: 1.5 } } { ...getTabPanelProps( TransformFunctionKeys.move ) }>
					<Move />
				</TabPanel>
				<TabPanel sx={ { p: 1.5 } } { ...getTabPanelProps( TransformFunctionKeys.scale ) }>
					<Scale />
				</TabPanel>
				<TabPanel sx={ { p: 1.5 } } { ...getTabPanelProps( TransformFunctionKeys.rotate ) }>
					<Rotate />
				</TabPanel>
			</Box>
		</PopoverContent>
	);
};
