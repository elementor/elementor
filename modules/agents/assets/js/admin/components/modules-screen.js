import { useState } from 'react';
import { InfoCircleIcon } from '@elementor/icons';
import Infotip from '@elementor/ui/Infotip';
import Stack from '@elementor/ui/Stack';
import { __ } from '@wordpress/i18n';

import { getModules } from '../constants';
import { BotAccessPanel } from './bot-access-panel';
import { LlmsTxtPanel } from './llms-txt-panel';
import { MarkdownContentPanel } from './markdown-content-panel';
import { ModuleAccordion } from './module-accordion';
import { ModulesStatus } from './modules-status';
import { PageTitle } from './page-title';

const SCORE_TOOLTIP_CONTENT = __( 'This score shows how many checks your site passes to help agents access and understand your content.', 'elementor' );

const scoreInfoIcon = (
	<Infotip content={ SCORE_TOOLTIP_CONTENT }>
		<InfoCircleIcon fontSize="small" color="action" />
	</Infotip>
);

const modules = getModules();

const panelsById = {
	[ modules[ 0 ].id ]: LlmsTxtPanel,
	[ modules[ 1 ].id ]: MarkdownContentPanel,
	[ modules[ 2 ].id ]: BotAccessPanel,
};

const getInitialEnabledState = () => Object.fromEntries( modules.map( ( module ) => [ module.id, true ] ) );

export const ModulesScreen = () => {
	const [ enabledById, setEnabledById ] = useState( getInitialEnabledState );

	const handleToggle = ( id ) => () => {
		setEnabledById( ( previous ) => ( { ...previous, [ id ]: ! previous[ id ] } ) );
	};

	const enabledCount = Object.values( enabledById ).filter( Boolean ).length;

	return (
		<Stack spacing={ 5 } pt={ 6 } width="100%" maxWidth={ 1087 } mx="auto">
			<Stack direction="row" alignItems="center" justifyContent="space-between">
				<PageTitle textAlign="left" />
				<ModulesStatus score={ enabledCount } infoIcon={ scoreInfoIcon } />
			</Stack>
			<Stack spacing={ 2 }>
				{ modules.map( ( module ) => {
					const Panel = panelsById[ module.id ];

					return (
						<ModuleAccordion
							key={ module.id }
							title={ module.title }
							description={ module.description }
							isEnabled={ enabledById[ module.id ] }
							onToggle={ handleToggle( module.id ) }
						>
							<Panel />
						</ModuleAccordion>
					);
				} ) }
			</Stack>
		</Stack>
	);
};
