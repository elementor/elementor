import { useSyncExternalStore } from 'react';

export type LicenseConfig = {
	expired: boolean;
};

let config: LicenseConfig = { expired: false };
const listeners = new Set< () => void >();

export function setLicenseConfig( newConfig: Partial< LicenseConfig > ) {
	config = { ...config, ...newConfig };
	listeners.forEach( ( listener ) => listener() );
}

export function getLicenseConfig(): LicenseConfig {
	return config;
}

function subscribe( listener: () => void ) {
	listeners.add( listener );
	return () => listeners.delete( listener );
}

export function useLicenseConfig() {
	return useSyncExternalStore( subscribe, getLicenseConfig, getLicenseConfig );
}
