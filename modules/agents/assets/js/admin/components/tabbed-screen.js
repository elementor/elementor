import { useTabs } from '@elementor/ui';
import Stack from '@elementor/ui/Stack';
import TabPanel from '@elementor/ui/TabPanel';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';

import { TAB_OVERVIEW, TAB_TWO } from '../constants';
import { PageTitle } from './page-title';
import { PillTabs } from './pill-tabs';

export const TabbedScreen = () => {
	const { getTabsProps, getTabProps, getTabPanelProps } = useTabs( TAB_OVERVIEW );
	const tabsProps = getTabsProps();

	const tabs = [
		{ value: TAB_OVERVIEW, label: __( 'Overview', 'elementor' ) },
		{ value: TAB_TWO, label: __( 'Tab 2', 'elementor' ) },
	];

	return (
		<Stack alignItems="center" spacing={ 2 } pt={ 6 }>
			<PageTitle />
			<PillTabs
				value={ tabsProps.value }
				onChange={ tabsProps.onChange }
				tabs={ tabs }
				getTabProps={ getTabProps }
			/>
			<TabPanel { ...getTabPanelProps( TAB_OVERVIEW ) }>
				<Typography variant="body1">
					{ __( 'Overview content coming soon.', 'elementor' ) }
				</Typography>
			</TabPanel>
			<TabPanel { ...getTabPanelProps( TAB_TWO ) }>
				<Typography variant="body1">
					{ __( 'Tab 2 content coming soon.', 'elementor' ) }
				</Typography>
			</TabPanel>
		</Stack>
	);
};
