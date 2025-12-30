import { getAllDescendants, type V1Element } from '@elementor/editor-elements';
import { type NotificationData, notify } from '@elementor/editor-notifications';
import { __getState as getState } from '@elementor/store';
import { __ } from '@wordpress/i18n';

import { type ComponentInstanceProp } from '../../prop-types/component-instance-prop-type';
import { type ComponentsSlice, selectCurrentComponentId, selectPath } from '../../store/store';
import { type ExtendedWindow } from '../../types';
import { type CreateArgs, type MoveArgs, type PasteArgs } from './types';

const COMPONENT_TYPE = 'e-component';

export type ClipboardElement = {
	widgetType?: string;
	settings?: {
		component_instance?: ComponentInstanceProp;
	};
	elements?: ClipboardElement[];
};

type StorageContent = {
	clipboard?: {
		elements?: ClipboardElement[];
	};
};

const COMPONENT_CIRCULAR_NESTING_ALERT: NotificationData = {
	type: 'default',
	message: __( 'Cannot add this component here - it would create a circular reference.', 'elementor' ),
	id: 'circular-component-nesting-blocked',
};

// Note that this function only checks for direct circular nesting, not indirect nesting
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

function extractComponentIdFromModel( model: CreateArgs[ 'model' ] ): number | string | null {
	if ( ! model ) {
		return null;
	}

	const isComponent = model.widgetType === COMPONENT_TYPE;

	if ( ! isComponent ) {
		return null;
	}

	return model.settings?.component_instance?.value?.component_id?.value ?? null;
}

function extractComponentIdFromElement( element: ClipboardElement ): number | string | null {
	if ( element.widgetType !== COMPONENT_TYPE ) {
		return null;
	}

	return element.settings?.component_instance?.value?.component_id?.value ?? null;
}

export function extractComponentIdsFromElements( elements: ClipboardElement[] ): Array< number | string > {
	const ids: Array< number | string > = [];

	for ( const element of elements ) {
		const componentId = extractComponentIdFromElement( element );

		if ( componentId !== null ) {
			ids.push( componentId );
		}

		if ( element.elements?.length ) {
			ids.push( ...extractComponentIdsFromElements( element.elements ) );
		}
	}

	return ids;
}

function extractComponentIdFromContainer( container: V1Element ): number | string | null {
	const widgetType = container.model?.get?.( 'widgetType' );

	if ( widgetType !== COMPONENT_TYPE ) {
		return null;
	}

	const settings = container.model?.get?.( 'settings' ) as { get?: ( key: string ) => unknown } | undefined;
	const componentInstance = settings?.get?.( 'component_instance' ) as ComponentInstanceProp | undefined;

	return componentInstance?.value?.component_id?.value ?? null;
}

export function blockCircularCreate( args: CreateArgs ): boolean {
	const componentId = extractComponentIdFromModel( args.model );

	if ( componentId === null ) {
		return false;
	}

	const isBlocked = wouldCreateCircularNesting( componentId );

	if ( isBlocked ) {
		notify( COMPONENT_CIRCULAR_NESTING_ALERT );
	}

	return isBlocked;
}

export function blockCircularMove( args: MoveArgs ): boolean {
	const { containers = [ args.container ] } = args;

	const hasCircularComponent = containers.some( ( container ) => {
		if ( ! container ) {
			return false;
		}

		const allElements = getAllDescendants( container );

		return allElements.some( ( element ) => {
			const componentId = extractComponentIdFromContainer( element );

			if ( componentId === null ) {
				return false;
			}

			return wouldCreateCircularNesting( componentId );
		} );
	} );

	if ( hasCircularComponent ) {
		notify( COMPONENT_CIRCULAR_NESTING_ALERT );
	}

	return hasCircularComponent;
}

export function blockCircularPaste( args: PasteArgs ): boolean {
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

	const allComponentIds = extractComponentIdsFromElements( data.clipboard.elements );
	const hasCircularComponent = allComponentIds.some( wouldCreateCircularNesting );

	if ( hasCircularComponent ) {
		notify( COMPONENT_CIRCULAR_NESTING_ALERT );
	}

	return hasCircularComponent;
}
