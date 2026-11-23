import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

export type DefaultStylesAbilityOperation = {
	action: 'update' | 'delete';
	tag: string;
	css?: string;
	mode?: 'patch' | 'replace';
};

let pendingOperations: DefaultStylesAbilityOperation[] = [];

export const getPendingAbilityOperations = (): DefaultStylesAbilityOperation[] =>
	pendingOperations.map( ( operation ) => ( { ...operation } ) );

export const recordPendingDefaultStylesOperation = ( operation: DefaultStylesAbilityOperation ) => {
	pendingOperations.push( operation );
	runCommandSync( 'document/save/set-is-modified', { status: true }, { internal: true } );
};

export const resetPendingDefaultStylesChanges = () => {
	pendingOperations = [];
};
