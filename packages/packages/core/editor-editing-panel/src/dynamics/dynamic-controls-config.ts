import { useSyncExternalStore } from 'react';

export interface DynamicControlsConfig {
	expired: boolean;
}

class DynamicControlsConfigRegistry {
	private config: DynamicControlsConfig = { expired: false };
	private listeners = new Set< () => void >();

	set( config: Partial< DynamicControlsConfig > ) {
		this.config = { ...this.config, ...config };
		this.listeners.forEach( ( listener ) => listener() );
	}

	get(): DynamicControlsConfig {
		return this.config;
	}

	subscribe( listener: () => void ) {
		this.listeners.add( listener );
		return () => this.listeners.delete( listener );
	}
}

const registry = new DynamicControlsConfigRegistry();

export const dynamicControlsConfig = {
	set: ( config: Partial< DynamicControlsConfig > ) => registry.set( config ),
};

export const useDynamicControlsConfig = () => {
	return useSyncExternalStore(
		( listener ) => registry.subscribe( listener ),
		() => registry.get(),
		() => registry.get()
	);
};
