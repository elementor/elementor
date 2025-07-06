import * as React from 'react';
import type { PropKey } from '@elementor/editor-props';
import { Box, Tab, TabPanel, Tabs, useTabs } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider } from '../../bound-prop-context';
import { PopoverContent } from '../../components/popover-content';
import { Move } from './functions/move';

type TransformTabValue = 'transform-move';

export const TransformContent = ( { bind }: { anchorEl?: HTMLElement | null; bind: PropKey } ) => {
	const { getTabsProps, getTabProps, getTabPanelProps } = useTabs< TransformTabValue >( 'transform-move' );

	return (
		<PropKeyProvider bind={ bind }>
			<PopoverContent>
				<Box sx={ { width: '100%' } }>
					<Box sx={ { borderBottom: 1, borderColor: 'divider' } }>
						<Tabs
							size="small"
							variant="fullWidth"
							{ ...getTabsProps() }
							aria-label={ __( 'Transform', 'elementor' ) }
						>
							<Tab label={ __( 'Move', 'elementor' ) } { ...getTabProps( 'transform-move' ) } />
						</Tabs>
					</Box>
					<TabPanel sx={ { p: 1.5 } } { ...getTabPanelProps( 'transform-move' ) }>
						<Move />
					</TabPanel>
				</Box>
			</PopoverContent>
		</PropKeyProvider>
	);
};
