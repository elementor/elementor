import type { V3AngieControlRegistration } from './types';

const registrations = new Map< string, V3AngieControlRegistration >();

export function registerV3AngieControl( registration: V3AngieControlRegistration ): void {
	for ( const type of registration.types ) {
		registrations.set( type, registration );
	}
}

export function getV3AngieControl( aiType: string ): V3AngieControlRegistration | undefined {
	return registrations.get( aiType );
}

export function clearV3AngieControls(): void {
	registrations.clear();
}
