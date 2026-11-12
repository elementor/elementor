import { __privateRunCommandSync as runCommandSync, registerDataHook } from '@elementor/editor-v1-adapters';

import { type BatchOperation } from '../api';
import { service } from '../service';

export type PlannedVariableChange = {
	action: 'create' | 'update' | 'delete';
	id: string;
	type?: string;
	label?: string;
	value?: string;
};

export type AbilityOperation = PlannedVariableChange;

let pendingChanges: PlannedVariableChange[] = [];
let pendingSave: Promise< unknown > | null = null;

export const getPendingAbilityOperations = (): AbilityOperation[] =>
	pendingChanges.map( ( change ) => ( { ...change } ) );

export const applyPlannedVariableChange = ( change: PlannedVariableChange ) => {
	const existing = service.variables()[ change.id ];

	if ( change.action === 'delete' ) {
		if ( existing ) {
			service.applyLocalChange( change.id, { ...existing, deleted: true }, false );
		}
	} else {
		service.applyLocalChange(
			change.id,
			{
				...existing,
				type: change.type ?? existing?.type ?? '',
				label: change.label ?? existing?.label ?? '',
				value: change.value ?? existing?.value ?? '',
			},
			change.action === 'create'
		);
	}

	pendingChanges.push( change );
	runCommandSync( 'document/save/set-is-modified', { status: true }, { internal: true } );
};

export const savePendingVariableChanges = () => {
	if ( pendingSave ) {
		return pendingSave;
	}

	if ( ! pendingChanges.length ) {
		return Promise.resolve();
	}

	const changes = pendingChanges;
	pendingChanges = [];

	pendingSave = service
		.saveOperations( changes.map( toBatchOperation ) )
		.catch( ( error: unknown ) => {
			pendingChanges = [ ...changes, ...pendingChanges ];
			throw error;
		} )
		.finally( () => {
			pendingSave = null;
		} );

	return pendingSave;
};

export const syncPendingVariableChangesWithDocumentSave = () => {
	registerDataHook( 'dependency', 'document/save/save', () => {
		savePendingVariableChanges()?.catch( () => {} );

		return true;
	} );
};

export const resetPendingVariableChanges = () => {
	pendingChanges = [];
	pendingSave = null;
};

function toBatchOperation( { action, id, type, label, value }: PlannedVariableChange ): BatchOperation {
	switch ( action ) {
		case 'create':
			return { type: 'create', variable: { id, type, label, value } };
		case 'update':
			return { type: 'update', id, variable: { label, value } };
		case 'delete':
			return { type: 'delete', id };
	}
}
