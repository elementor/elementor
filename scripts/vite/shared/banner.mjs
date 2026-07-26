import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './paths.mjs';

export function getBannerText() {
	const pkg = JSON.parse( readFileSync( join( ROOT, 'package.json' ), 'utf8' ) );
	const today = new Date();
	const date = [
		String( today.getDate() ).padStart( 2, '0' ),
		String( today.getMonth() + 1 ).padStart( 2, '0' ),
		today.getFullYear(),
	].join( '-' );

	return `/*! ${ pkg.name } - v${ pkg.version } - ${ date } */`;
}

export function prependBanner( content, banner ) {
	if ( content.startsWith( banner ) ) {
		return content;
	}

	return `${ banner }\n${ content }`;
}
