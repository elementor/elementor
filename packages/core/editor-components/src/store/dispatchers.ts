import { type V1Document } from '@elementor/editor-documents';
import { __dispatch as dispatch, __getStore as getStore } from '@elementor/store';

import { type ComponentId, type OverridableProps, type PublishedComponent, type UnpublishedComponent } from '../types';
import { type ComponentsPathItem, type SanitizeAttributes, slice } from './store';

function safeDispatch() {
	return getStore()?.dispatch;
}

export const componentsActions = {
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
};
