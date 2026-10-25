import { useState } from 'react';
import { InfoCircleIcon } from '@elementor/icons';
import Alert from '@elementor/ui/Alert';
import Container from '@elementor/ui/Container';
import Divider from '@elementor/ui/Divider';
import Infotip from '@elementor/ui/Infotip';
import Stack from '@elementor/ui/Stack';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import {
	AGENT_DISCOVERY_SETTINGS_KEY,
	BOT_ACCESS_SETTINGS_KEY,
	BROWSER_TOOLS_SETTINGS_KEY,
	getModules,
	LLMS_SETTINGS_KEY,
	MARKDOWN_SETTINGS_KEY,
	MODULE_AGENT_DISCOVERY,
	MODULE_BOT_ACCESS_CONTROL,
	MODULE_BROWSER_TOOLS,
	MODULE_LLMS_TXT,
	MODULE_MARKDOWN_CONTENT,
	MODULE_STATUS_DISABLED,
	MODULE_STATUS_ENABLED,
	MODULE_STATUS_WARNING,
} from '../constants';
import { useAgentDiscoverySettings } from '../hooks/use-agent-discovery-settings';
import { useAllModulesToggle } from '../hooks/use-all-modules-toggle';
import { useBotAccessSettings } from '../hooks/use-bot-access-settings';
import { useBrowserToolsSettings } from '../hooks/use-browser-tools-settings';
import { useLlmsSettings } from '../hooks/use-llms-settings';
import { useMarkdownSettings } from '../hooks/use-markdown-settings';
import { AgentDiscoveryPanel } from './agent-discovery/agent-discovery-panel';
import { AllModulesControl } from './all-modules-control';
import { BotAccessPanel } from './bot-access/bot-access-panel';
import { BrowserToolsPanel } from './browser-tools/browser-tools-panel';
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

const getDisabledReason = ( settings ) => settings.unavailableReason?.message || null;

const getStatus = ( isEnabled, hasWarning = false ) => {
	if ( hasWarning ) {
		return MODULE_STATUS_WARNING;
	}

	return isEnabled ? MODULE_STATUS_ENABLED : MODULE_STATUS_DISABLED;
};

export const ModulesScreen = ( { agentDiscoveryConfig, botAccessConfig, browserToolsConfig, llmsConfig, markdownConfig } ) => {
	const agentDiscoverySettings = useAgentDiscoverySettings( agentDiscoveryConfig );
	const botAccessSettings = useBotAccessSettings( botAccessConfig );
	const browserToolsSettings = useBrowserToolsSettings( browserToolsConfig );
	const llmsSettings = useLlmsSettings( llmsConfig );
	const markdownSettings = useMarkdownSettings( markdownConfig );
	const isLlmsUnavailable = Boolean( llmsSettings.unavailableReason );
	const isBotAccessUnavailable = Boolean( botAccessSettings.unavailableReason );
	const isBrowserToolsUnavailable = Boolean( browserToolsSettings.unavailableReason );
	const allModules = useAllModulesToggle( [
		{ settingsKey: LLMS_SETTINGS_KEY, settings: llmsSettings, isToggleable: ! isLlmsUnavailable },
		{ settingsKey: MARKDOWN_SETTINGS_KEY, settings: markdownSettings, isToggleable: true },
		{ settingsKey: BOT_ACCESS_SETTINGS_KEY, settings: botAccessSettings, isToggleable: ! isBotAccessUnavailable },
		{ settingsKey: AGENT_DISCOVERY_SETTINGS_KEY, settings: agentDiscoverySettings, isToggleable: true },
		{ settingsKey: BROWSER_TOOLS_SETTINGS_KEY, settings: browserToolsSettings, isToggleable: ! isBrowserToolsUnavailable },
	] );
	const [ expandedModuleId, setExpandedModuleId ] = useState( modules[ 0 ]?.id ?? null );

	const enabledCount = [
		llmsSettings.isEnabled,
		markdownSettings.isEnabled,
		botAccessSettings.isEnabled,
		agentDiscoverySettings.isEnabled,
		browserToolsSettings.isEnabled && ! isBrowserToolsUnavailable,
	].filter( Boolean ).length;
	const totalCount = modules.length - ( isBrowserToolsUnavailable ? 1 : 0 );

	const handleExpandedChange = ( moduleId ) => ( event, expanded ) => {
		setExpandedModuleId( expanded ? moduleId : null );
	};

	const renderModule = ( module ) => {
		const accordionProps = {
			isExpanded: expandedModuleId === module.id,
			onExpandedChange: handleExpandedChange( module.id ),
		};

		if ( MODULE_LLMS_TXT === module.id ) {
			return (
				<ModuleAccordion
					key={ module.id }
					title={ module.title }
					description={ module.description }
					status={ getStatus( llmsSettings.isEnabled, isLlmsUnavailable ) }
					isEnabled={ llmsSettings.isEnabled }
					isToggleDisabled={ isLlmsUnavailable || llmsSettings.isSaving || allModules.isSaving }
					disabledReason={ getDisabledReason( llmsSettings ) }
					onToggle={ llmsSettings.toggleEnabled }
					{ ...accordionProps }
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
					isToggleDisabled={ markdownSettings.isSaving || allModules.isSaving }
					onToggle={ markdownSettings.toggleEnabled }
					{ ...accordionProps }
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
					status={ getStatus( botAccessSettings.isEnabled, isBotAccessUnavailable ) }
					isEnabled={ botAccessSettings.isEnabled }
					isToggleDisabled={ isBotAccessUnavailable || botAccessSettings.isSaving || allModules.isSaving }
					disabledReason={ getDisabledReason( botAccessSettings ) }
					onToggle={ botAccessSettings.toggleEnabled }
					{ ...accordionProps }
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
					isToggleDisabled={ agentDiscoverySettings.isSaving || allModules.isSaving }
					onToggle={ agentDiscoverySettings.toggleEnabled }
					{ ...accordionProps }
				>
					<AgentDiscoveryPanel settings={ agentDiscoverySettings } />
				</ModuleAccordion>
			);
		}

		if ( MODULE_BROWSER_TOOLS === module.id ) {
			return (
				<ModuleAccordion
					key={ module.id }
					title={ module.title }
					description={ module.description }
					status={ getStatus( browserToolsSettings.isEnabled, isBrowserToolsUnavailable ) }
					isEnabled={ browserToolsSettings.isEnabled && ! isBrowserToolsUnavailable }
					isToggleDisabled={ isBrowserToolsUnavailable || browserToolsSettings.isSaving || allModules.isSaving }
					disabledReason={ getDisabledReason( browserToolsSettings ) }
					onToggle={ browserToolsSettings.toggleEnabled }
					{ ...accordionProps }
				>
					<BrowserToolsPanel settings={ browserToolsSettings } isMarkdownEnabled={ markdownSettings.isEnabled } />
				</ModuleAccordion>
			);
		}

		return null;
	};

	return (
		<Container disableGutters maxWidth="lg" sx={ { width: '100%', minWidth: 0, pt: 6 } }>
			<Stack spacing={ 5 } width="100%" minWidth={ 0 }>
				<Stack direction="row" alignItems="center" justifyContent="space-between">
					<PageTitle textAlign="left" />
					<ModulesStatus score={ enabledCount } total={ totalCount } infoIcon={ scoreInfoIcon } />
				</Stack>
				<Stack spacing={ 2 }>
					{ allModules.saveError && (
						<Alert severity="error">{ allModules.saveError }</Alert>
					) }
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
					{ browserToolsSettings.saveError && (
						<Alert severity="error">{ browserToolsSettings.saveError }</Alert>
					) }
					{ modules.map( renderModule ) }
				</Stack>
				<Divider />
				<AllModulesControl isAnyEnabled={ allModules.isAnyEnabled } isDisabled={ allModules.isDisabled } onToggleAll={ allModules.toggleAll } />
			</Stack>
		</Container>
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
		unavailableReason: PropTypes.shape( {
			code: PropTypes.string.isRequired,
			message: PropTypes.string.isRequired,
		} ),
		bots: PropTypes.array.isRequired,
		catalog: PropTypes.array.isRequired,
	} ).isRequired,
	browserToolsConfig: PropTypes.shape( {
		enabled: PropTypes.bool.isRequired,
		isAvailable: PropTypes.bool.isRequired,
		unavailableReason: PropTypes.shape( {
			code: PropTypes.string.isRequired,
			message: PropTypes.string.isRequired,
		} ),
		tools: PropTypes.array.isRequired,
		businessDetails: PropTypes.string,
		maxBusinessDetailsLength: PropTypes.number,
	} ).isRequired,
	llmsConfig: PropTypes.shape( {
		enabled: PropTypes.bool.isRequired,
		isManuallyEdited: PropTypes.bool.isRequired,
		hasPhysicalFile: PropTypes.bool.isRequired,
		unavailableReason: PropTypes.shape( {
			code: PropTypes.string.isRequired,
			message: PropTypes.string.isRequired,
		} ),
		fileUrl: PropTypes.string.isRequired,
		postTypes: PropTypes.array.isRequired,
	} ).isRequired,
	markdownConfig: PropTypes.shape( {
		enabled: PropTypes.bool.isRequired,
		postTypes: PropTypes.array.isRequired,
	} ).isRequired,
};
