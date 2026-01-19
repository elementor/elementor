import { useSyncExternalStore } from 'react';

export type DynamicControlsConfig = {
	expired: boolean;
};

let config: DynamicControlsConfig = { expired: false };
const listeners = new Set< () => void >();

export function setDynamicControlsConfig( newConfig: Partial< DynamicControlsConfig > ) {
	config = { ...config, ...newConfig };
	listeners.forEach( ( listener ) => listener() );
}

function getConfig(): DynamicControlsConfig {
	return config;
}

function subscribe( listener: () => void ) {
	listeners.add( listener );
	return () => listeners.delete( listener );
}

export function useDynamicControlsConfig() {
	return useSyncExternalStore( subscribe, getConfig, getConfig );
}
