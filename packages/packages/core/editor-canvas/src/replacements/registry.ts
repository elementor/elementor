import { useEffect, useState } from 'react';

import { type ReplacementType } from './types';

export type ReplacementRegistration = {
	elementId: string;
	targetElement: HTMLElement;
	type: ReplacementType;
	isActive: boolean;
	shouldActivate: () => boolean;
	onActivate?: () => void;
	props?: Record< string, unknown >;
};

const registrations = new Map<string, ReplacementRegistration>();
const listeners = new Set<() => void>();

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

