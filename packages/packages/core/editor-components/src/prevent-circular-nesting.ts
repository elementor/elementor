import { type V1Element } from '@elementor/editor-elements';
import { type NotificationData, notify } from '@elementor/editor-notifications';
import { blockCommand } from '@elementor/editor-v1-adapters';
import { __getState as getState } from '@elementor/store';
import { __ } from '@wordpress/i18n';

import { type ComponentsSlice, selectCurrentComponentId, selectPath } from './store/store';
import { type ComponentInstancePropValue, type ExtendedWindow } from './types';

const COMPONENT_TYPE = 'e-component';

type CreateArgs = {
	container?: V1Element;
	model?: {
		elType?: string;
		widgetType?: string;
		settings?: {
			component_instance?: ComponentInstancePropValue;
		};
	};
};

type MoveArgs = {
	containers?: V1Element[];
	container?: V1Element;
	target?: V1Element;
};

type PasteArgs = {
	containers?: V1Element[];
	container?: V1Element;
	storageType?: string;
};

type StorageContent = {
	clipboard?: {
		elements?: Array< {
			widgetType?: string;
			settings?: {
				component_instance?: ComponentInstancePropValue;
			};
		} >;
	};
};

const NOTIFICATION: NotificationData = {
	type: 'default',
	message: __( 'Cannot add this component here - it would create a circular reference.', 'elementor' ),
	id: 'circular-component-nesting-blocked',
};

export function initCircularNestingPrevention() {
	blockCommand( {
		command: 'document/elements/create',
		condition: blockCircularCreate,
	} );

	blockCommand( {
		command: 'document/elements/move',
		condition: blockCircularMove,
	} );

	blockCommand( {
		command: 'document/elements/paste',
		condition: blockCircularPaste,
	} );
}

export function wouldCreateCircularNesting( componentIdToAdd: number | string | undefined ): boolean {
	if ( componentIdToAdd === undefined ) {
		return false;
	}

	const state = getState() as ComponentsSlice;
	const currentComponentId = selectCurrentComponentId( state );
	const path = selectPath( state );

	if ( currentComponentId === null ) {
		return false;
	}

	if ( componentIdToAdd === currentComponentId ) {
		return true;
	}

	return path.some( ( item ) => item.componentId === componentIdToAdd );
}

function extractComponentIdFromModel( model: CreateArgs[ 'model' ] ): number | string | undefined {
	if ( ! model ) {
		return undefined;
	}

	const isComponent = model.widgetType === COMPONENT_TYPE || model.elType === COMPONENT_TYPE;

	if ( ! isComponent ) {
		return undefined;
	}

	return model.settings?.component_instance?.value?.component_id?.value;
}

function extractComponentIdFromElement( element: {
	widgetType?: string;
	settings?: { component_instance?: ComponentInstancePropValue };
} ): number | string | undefined {
	if ( element.widgetType !== COMPONENT_TYPE ) {
		return undefined;
	}

	return element.settings?.component_instance?.value?.component_id?.value;
}

function blockCircularCreate( args: CreateArgs ): boolean {
	const componentId = extractComponentIdFromModel( args.model );

	if ( componentId === undefined ) {
		return false;
	}

	const isBlocked = wouldCreateCircularNesting( componentId );

	if ( isBlocked ) {
		notify( NOTIFICATION );
	}

	return isBlocked;
}

function blockCircularMove( args: MoveArgs ): boolean {
	const { containers = [ args.container ] } = args;

	const hasCircularComponent = containers.some( ( container ) => {
		if ( ! container ) {
			return false;
		}

		const widgetType = container.model?.get?.( 'widgetType' );

		if ( widgetType !== COMPONENT_TYPE ) {
			return false;
		}

		const settings = container.model?.get?.( 'settings' ) as { get?: ( key: string ) => unknown } | undefined;
		const componentInstance = settings?.get?.( 'component_instance' ) as ComponentInstancePropValue | undefined;
		const componentId = componentInstance?.value?.component_id?.value;

		return wouldCreateCircularNesting( componentId );
	} );

	if ( hasCircularComponent ) {
		notify( NOTIFICATION );
	}

	return hasCircularComponent;
}

function blockCircularPaste( args: PasteArgs ): boolean {
	const { storageType } = args;

	if ( storageType !== 'localstorage' ) {
		return false;
	}

	const data = (
		window as unknown as ExtendedWindow & { elementorCommon?: { storage?: { get: () => StorageContent } } }
	 )?.elementorCommon?.storage?.get();

	if ( ! data?.clipboard?.elements ) {
		return false;
	}

	const hasCircularComponent = data.clipboard.elements.some( ( element ) => {
		const componentId = extractComponentIdFromElement( element );
		return wouldCreateCircularNesting( componentId );
	} );

	if ( hasCircularComponent ) {
		notify( NOTIFICATION );
	}

	return hasCircularComponent;
}
