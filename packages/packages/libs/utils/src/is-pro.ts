export function hasProInstalled(): boolean {
	return window.elementor?.helpers?.hasPro?.() ?? false;
}

export function isProActive(): boolean {
	if (!hasProInstalled()) {
		return false;
	}

	return window.elementorPro?.config?.isActive ?? false;
}

function getProVersion(): string {
	return window.elementorPro?.config?.version ?? '0.0';
}

export function isProAtLeast( targetVersion: string ): boolean {
	const version = getProVersion();

	if ( ! version ) {
		return false;
	}

	const [ major, minor ] = version.split( '.' ).map( Number );
	const [ targetMajor, targetMinor ] = targetVersion.split( '.' ).map( Number );

	return major > targetMajor || ( major === targetMajor && minor >= targetMinor );
}
