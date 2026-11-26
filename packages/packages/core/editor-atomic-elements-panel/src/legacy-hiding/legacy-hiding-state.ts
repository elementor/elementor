// Session-only kill switch: once the Atomic panel crashes, Legacy shows every element again until reload.
let isDisabled = false;

export function disableLegacyHiding() {
	isDisabled = true;
}

export function isLegacyHidingDisabled() {
	return isDisabled;
}
