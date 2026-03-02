import { type V1Document } from '@elementor/editor-documents';
import { __dispatch as dispatch, __getState as getState, __getStore as getStore } from '@elementor/store';

import { type ComponentId, type OverridableProps, type PublishedComponent, type UnpublishedComponent } from '../types';
import {
	type ComponentsPathItem,
	type ComponentsSlice,
	type SanitizeAttributes,
	selectArchivedThisSession,
	selectComponents,
	selectCurrentComponent,
	selectCurrentComponentId,
	selectOverridableProps,
	selectUnpublishedComponents,
	selectUpdatedComponentNames,
	slice,
} from './store';

function safeDispatch() {
	return getStore()?.dispatch;
}

function safeGetState(): ComponentsSlice | undefined {
	return getStore()?.getState() as ComponentsSlice | undefined;
}

export const componentsStore = {
	add( components: PublishedComponent | PublishedComponent[] ) {
		dispatch( slice.actions.add( components ) );
	},
	load( components: PublishedComponent[] ) {
		dispatch( slice.actions.load( components ) );
	},
	addUnpublished( component: UnpublishedComponent ) {
		dispatch( slice.actions.addUnpublished( component ) );
	},
	removeUnpublished( uids: string | string[] ) {
		dispatch( slice.actions.removeUnpublished( uids ) );
	},
	resetUnpublished() {
		dispatch( slice.actions.resetUnpublished() );
	},
	removeStyles( id: ComponentId ) {
		dispatch( slice.actions.removeStyles( { id } ) );
	},
	addStyles( styles: Record< string, unknown > ) {
		dispatch( slice.actions.addStyles( styles ) );
	},
	addCreatedThisSession( uid: string ) {
		dispatch( slice.actions.addCreatedThisSession( uid ) );
	},
	removeCreatedThisSession( uid: string ) {
		dispatch( slice.actions.removeCreatedThisSession( uid ) );
	},
	archive( componentId: ComponentId ) {
		dispatch( slice.actions.archive( componentId ) );
	},
	setCurrentComponentId( id: V1Document[ 'id' ] | null ) {
		safeDispatch()?.( slice.actions.setCurrentComponentId( id ) );
	},
	setPath( path: ComponentsPathItem[] ) {
		safeDispatch()?.( slice.actions.setPath( path ) );
	},
	setOverridableProps( componentId: ComponentId, overridableProps: OverridableProps ) {
		dispatch( slice.actions.setOverridableProps( { componentId, overridableProps } ) );
	},
	rename( componentUid: string, name: string ) {
		dispatch( slice.actions.rename( { componentUid, name } ) );
	},
	cleanUpdatedComponentNames() {
		dispatch( slice.actions.cleanUpdatedComponentNames() );
	},
	updateComponentSanitizedAttribute( componentId: ComponentId, attribute: SanitizeAttributes ) {
		dispatch( slice.actions.updateComponentSanitizedAttribute( { componentId, attribute } ) );
	},
	resetSanitizedComponents() {
		dispatch( slice.actions.resetSanitizedComponents() );
	},

	getOverridableProps( componentId: ComponentId ) {
		return selectOverridableProps( getState(), componentId );
	},
	getCurrentComponent() {
		return selectCurrentComponent( getState() );
	},
	getCurrentComponentId() {
		const state = safeGetState();
		if ( ! state ) {
			return null;
		}
		return selectCurrentComponentId( state );
	},
	getUnpublishedComponents() {
		return selectUnpublishedComponents( getState() );
	},
	getUpdatedComponentNames() {
		return selectUpdatedComponentNames( getState() );
	},
	getArchivedThisSession() {
		return selectArchivedThisSession( getState() );
	},
	getComponents() {
		return selectComponents( getState() );
	},
};
