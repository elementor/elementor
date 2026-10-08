import { InfoCircleIcon } from '@elementor/icons';
import Alert from '@elementor/ui/Alert';
import Infotip from '@elementor/ui/Infotip';
import Stack from '@elementor/ui/Stack';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import {
	getModules,
	MODULE_AGENT_DISCOVERY,
	MODULE_BOT_ACCESS_CONTROL,
	MODULE_LLMS_TXT,
	MODULE_MARKDOWN_CONTENT,
	MODULE_STATUS_DISABLED,
	MODULE_STATUS_ENABLED,
	MODULE_STATUS_WARNING,
} from '../constants';
import { useAgentDiscoverySettings } from '../hooks/use-agent-discovery-settings';
import { useBotAccessSettings } from '../hooks/use-bot-access-settings';
import { useLlmsSettings } from '../hooks/use-llms-settings';
import { useMarkdownSettings } from '../hooks/use-markdown-settings';
import { AgentDiscoveryPanel } from './agent-discovery/agent-discovery-panel';
import { BotAccessPanel } from './bot-access/bot-access-panel';
import { LlmsTxtPanel } from './llms-txt/llms-txt-panel';
import { MarkdownContentPanel } from './markdown-content/markdown-content-panel';
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

const getStatus = ( isEnabled, hasWarning = false ) => {
	if ( hasWarning ) {
		return MODULE_STATUS_WARNING;
	}

	return isEnabled ? MODULE_STATUS_ENABLED : MODULE_STATUS_DISABLED;
};

export const ModulesScreen = ( { agentDiscoveryConfig, botAccessConfig, llmsConfig, markdownConfig } ) => {
	const agentDiscoverySettings = useAgentDiscoverySettings( agentDiscoveryConfig );
	const botAccessSettings = useBotAccessSettings( botAccessConfig );
	const llmsSettings = useLlmsSettings( llmsConfig );
	const markdownSettings = useMarkdownSettings( markdownConfig );

	const enabledCount = [
		llmsSettings.isEnabled,
		markdownSettings.isEnabled,
		botAccessSettings.isEnabled,
		agentDiscoverySettings.isEnabled,
	].filter( Boolean ).length;

	const renderModule = ( module, index ) => {
		const defaultExpanded = 0 === index;

		if ( MODULE_LLMS_TXT === module.id ) {
			return (
				<ModuleAccordion
					key={ module.id }
					title={ module.title }
					description={ module.description }
					status={ getStatus( llmsSettings.isEnabled, llmsSettings.hasPhysicalFile ) }
					isEnabled={ llmsSettings.isEnabled }
					isToggleDisabled={ llmsSettings.hasPhysicalFile || llmsSettings.isSaving }
					onToggle={ llmsSettings.toggleEnabled }
					defaultExpanded={ defaultExpanded }
				>
					<LlmsTxtPanel settings={ llmsSettings } />
				</ModuleAccordion>
			);
		}

		if ( MODULE_MARKDOWN_CONTENT === module.id ) {
			return (
				<ModuleAccordion
					key={ module.id }
					title={ module.title }
					description={ module.description }
					status={ getStatus( markdownSettings.isEnabled ) }
					isEnabled={ markdownSettings.isEnabled }
					isToggleDisabled={ markdownSettings.isSaving }
					onToggle={ markdownSettings.toggleEnabled }
					defaultExpanded={ defaultExpanded }
				>
					<MarkdownContentPanel settings={ markdownSettings } />
				</ModuleAccordion>
			);
		}

		if ( MODULE_BOT_ACCESS_CONTROL === module.id ) {
			return (
				<ModuleAccordion
					key={ module.id }
					title={ module.title }
					description={ module.description }
					status={ getStatus( botAccessSettings.isEnabled, botAccessSettings.hasPhysicalFile ) }
					isEnabled={ botAccessSettings.isEnabled }
					isToggleDisabled={ botAccessSettings.hasPhysicalFile || botAccessSettings.isSaving }
					onToggle={ botAccessSettings.toggleEnabled }
					defaultExpanded={ defaultExpanded }
				>
					<BotAccessPanel settings={ botAccessSettings } />
				</ModuleAccordion>
			);
		}

		if ( MODULE_AGENT_DISCOVERY === module.id ) {
			return (
				<ModuleAccordion
					key={ module.id }
					title={ module.title }
					description={ module.description }
					status={ getStatus( agentDiscoverySettings.isEnabled ) }
					isEnabled={ agentDiscoverySettings.isEnabled }
					isToggleDisabled={ agentDiscoverySettings.isSaving }
					onToggle={ agentDiscoverySettings.toggleEnabled }
					defaultExpanded={ defaultExpanded }
				>
					<AgentDiscoveryPanel settings={ agentDiscoverySettings } />
				</ModuleAccordion>
			);
		}

		return null;
	};

	return (
		<Stack spacing={ 5 } pt={ 6 } width="100%" maxWidth={ 1087 } minWidth={ 0 } mx="auto">
			<Stack direction="row" alignItems="center" justifyContent="space-between">
				<PageTitle textAlign="left" />
				<ModulesStatus score={ enabledCount } infoIcon={ scoreInfoIcon } />
			</Stack>
			<Stack spacing={ 2 }>
				{ llmsSettings.saveError && (
					<Alert severity="error">{ llmsSettings.saveError }</Alert>
				) }
				{ markdownSettings.saveError && (
					<Alert severity="error">{ markdownSettings.saveError }</Alert>
				) }
				{ botAccessSettings.saveError && (
					<Alert severity="error">{ botAccessSettings.saveError }</Alert>
				) }
				{ agentDiscoverySettings.saveError && (
					<Alert severity="error">{ agentDiscoverySettings.saveError }</Alert>
				) }
				{ modules.map( renderModule ) }
			</Stack>
		</Stack>
	);
};

ModulesScreen.propTypes = {
	agentDiscoveryConfig: PropTypes.shape( {
		enabled: PropTypes.bool.isRequired,
		files: PropTypes.array.isRequired,
	} ).isRequired,
	botAccessConfig: PropTypes.shape( {
		enabled: PropTypes.bool.isRequired,
		hasPhysicalFile: PropTypes.bool.isRequired,
		bots: PropTypes.array.isRequired,
		catalog: PropTypes.array.isRequired,
	} ).isRequired,
	llmsConfig: PropTypes.shape( {
		enabled: PropTypes.bool.isRequired,
		isManuallyEdited: PropTypes.bool.isRequired,
		hasPhysicalFile: PropTypes.bool.isRequired,
		fileUrl: PropTypes.string.isRequired,
		postTypes: PropTypes.array.isRequired,
	} ).isRequired,
	markdownConfig: PropTypes.shape( {
		enabled: PropTypes.bool.isRequired,
		postTypes: PropTypes.array.isRequired,
	} ).isRequired,
};
