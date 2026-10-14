/**
 * This file is used to store the state of the isReady variable, which is used to determine
 * if the adapter is ready to receive events (editor v1 and v2 are loaded).
 */

let ready = false;

export function isReady() {
	return ready;
}

export function setReady( value: boolean ) {
	ready = value;
}
