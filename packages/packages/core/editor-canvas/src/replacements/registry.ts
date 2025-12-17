import { useEffect, useState } from 'react';

import { type ReplacementType } from './types';

export type ReplacementRegistration = {
	elementId: string;
	targetElement: HTMLElement;
	type: ReplacementType;
	isActive: boolean;
	shouldActivate: () => boolean;
	onActivate?: () => void;
	getProps?: () => Record< string, unknown >;
};

export type ViewReplacementConfig< TOptions = any, TView = any > = {
	shouldReplace: ( options: TOptions ) => boolean;
	createView: ( options: TOptions ) => TView;
};

const registrations = new Map<string, ReplacementRegistration>();
const listeners = new Set<() => void>();
const viewReplacements = new Map< string, ViewReplacementConfig >();

const notifyListeners = () => {
	listeners.forEach( ( fn ) => fn() );
};

export const register = ( config: Omit<ReplacementRegistration, 'isActive'> ) => {
	registrations.set( config.elementId, { ...config, isActive: false } );
	notifyListeners();
};

export const unregister = ( elementId: string ) => {
	registrations.delete( elementId );
	notifyListeners();
};

export const activate = ( elementId: string ) => {
	const registration = registrations.get( elementId );
	if ( ! registration ) {
		return;
	}

	if ( ! registration.shouldActivate() ) {
		return;
	}

	registration.isActive = true;
	registration.onActivate?.();
	notifyListeners();
};

export const deactivate = ( elementId: string ) => {
	const registration = registrations.get( elementId );
	if ( ! registration ) {
		return;
	}

	registration.isActive = false;
	notifyListeners();
};

export const isActive = ( elementId: string ): boolean => {
	return registrations.get( elementId )?.isActive ?? false;
};

export const isRegistered = ( elementId: string ): boolean => {
	return registrations.has( elementId );
};

export const getRegistrations = (): ReplacementRegistration[] => {
	return Array.from( registrations.values() );
};

export const useRegistrations = (): ReplacementRegistration[] => {
	const [ , setVersion ] = useState( 0 );

	useEffect( () => {
		const listener = () => setVersion( ( v ) => v + 1 );
		listeners.add( listener );
		return () => {
			listeners.delete( listener );
		};
	}, [] );

	return getRegistrations();
};

export const registerViewReplacement = < TOptions, TView >(
	widgetTypes: string | string[],
	config: ViewReplacementConfig< TOptions, TView >
) => {
	const types = Array.isArray( widgetTypes ) ? widgetTypes : [ widgetTypes ];
	types.forEach( ( widgetType ) => {
		viewReplacements.set( widgetType, config );
	} );
};

export const shouldReplaceView = < TOptions >(
	widgetType: string,
	options: TOptions
): boolean => {
	const replacement = viewReplacements.get( widgetType );
	return !! replacement?.shouldReplace( options );
};

export const createReplacementView = < TOptions, TView >(
	widgetType: string,
	options: TOptions
): TView | undefined => {
	const replacement = viewReplacements.get( widgetType ) as ViewReplacementConfig< TOptions, TView > | undefined;
	return replacement?.createView( options );
};

