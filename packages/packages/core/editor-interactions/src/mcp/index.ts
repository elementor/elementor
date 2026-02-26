import { getMCPByDomain } from '@elementor/editor-mcp';

import { MAX_INTERACTIONS_PER_ELEMENT } from './constants';
import { initInteractionsSchemaResource } from './resources/interactions-schema-resource';
import { initManageElementInteractionTool } from './tools/manage-element-interaction-tool';

export const initMcpInteractions = () => {
	const reg = getMCPByDomain( 'interactions', {
		instructions: `
		MCP server for managing element interactions and animations. Use this to add, modify, or remove animations and motion effects triggered by user events such as page load or scroll-into-view.
		** IMPORTANT **
		Use the "interactions-schema" resource to get the schema of the interactions.
		Actions:
		- get: Read the current interactions on the element.
		- add: Add a new interaction (max ${ MAX_INTERACTIONS_PER_ELEMENT } per element).
		- update: Update an existing interaction by its interactionId.
		- delete: Remove a specific interaction by its interactionId.
		- clear: Remove all interactions from the element.
		
		For add/update, provide: trigger, effect, effectType, direction (required for slide effect), duration, delay, easing.
		Use excludedBreakpoints to disable the animation on specific responsive breakpoints (e.g. ["mobile", "tablet"]).
		Example Get Request:
		{
			"elementId": "123",
			"action": "get",
			"interactionId": "123",
			"animationData": {
				"trigger": "click",
				"effect": "fade",
			}
		}
		Example Add Request:
		{
			"elementId": "123",
			"action": "add",
			"animationData": {
				"effectType": "in",
				"direction": "top",
				"trigger": "click",
				"effect": "fade",
				"duration": 1000,
				"delay": 0,
				"easing": "easeIn",
				"excludedBreakpoints": ["mobile", "tablet"],
			}
		}
		Example Update Request:
		{
			"elementId": "123",
			"action": "update",
			"interactionId": "123",
			"animationData": {
				"trigger": "click",
				"effect": "fade",
			}
		}
		Example Delete Request:
		{
			"elementId": "123",
			"action": "delete",
			"interactionId": "123",
		}
		Example Clear Request:
		{
			"elementId": "123",
			"action": "clear",
		}
		`,
	} );
	initInteractionsSchemaResource( reg );
	reg.waitForReady().then( () => initManageElementInteractionTool( reg ) );
};
