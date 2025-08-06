import * as React from 'react';
import { Box, Tab, TabPanel, Tabs } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PopoverContent } from '../../components/popover-content';
import { Move } from './functions/move';
import { Rotate } from './functions/rotate';
import { Scale } from './functions/scale';
import { Skew } from './functions/skew';
import {
	initialRotateValue,
	initialScaleValue,
	initialSkewValue,
	initialTransformValue,
	TransformFunctionKeys,
} from './initial-values';
import { useTransformTabsHistory } from './use-transform-tabs-history';

export const TransformContent = () => {
	const { getTabsProps, getTabProps, getTabPanelProps } = useTransformTabsHistory( {
		move: initialTransformValue.value,
		scale: initialScaleValue.value,
		rotate: initialRotateValue.value,
		skew: initialSkewValue.value,
	} );

	return (
		<PopoverContent>
			<Box sx={ { width: '100%' } }>
				<Box sx={ { borderBottom: 1, borderColor: 'divider' } }>
					<Tabs
						size="small"
						variant="fullWidth"
						sx={ {
							'& .MuiTab-root': {
								minWidth: '62px',
							},
						} }
						{ ...getTabsProps() }
						aria-label={ __( 'Transform', 'elementor' ) }
					>
						<Tab label={ __( 'Move', 'elementor' ) } { ...getTabProps( TransformFunctionKeys.move ) } />
						<Tab label={ __( 'Scale', 'elementor' ) } { ...getTabProps( TransformFunctionKeys.scale ) } />
						<Tab label={ __( 'Rotate', 'elementor' ) } { ...getTabProps( TransformFunctionKeys.rotate ) } />
						<Tab label={ __( 'Skew', 'elementor' ) } { ...getTabProps( TransformFunctionKeys.skew ) } />
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
				<TabPanel sx={ { p: 1.5 } } { ...getTabPanelProps( TransformFunctionKeys.skew ) }>
					<Skew />
				</TabPanel>
			</Box>
		</PopoverContent>
	);
};
