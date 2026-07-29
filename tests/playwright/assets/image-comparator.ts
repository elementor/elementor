import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const PIXELMATCH_THRESHOLD = 0.2;

/**
 * Compares two PNG buffers pixel by pixel.
 *
 * Reimplements the relevant subset of Playwright's internal image comparator
 * (previously imported from the private `playwright-core/lib/utils` path,
 * which is not part of Playwright's public API and was removed from its
 * package exports).
 *
 * @param {Buffer} actualBuffer   - The actual PNG image buffer.
 * @param {Buffer} expectedBuffer - The expected PNG image buffer.
 *
 * @return {null | { errorMessage: string }} `null` when the images match, otherwise a description of the mismatch.
 */
export function comparePngBuffers( actualBuffer: Buffer, expectedBuffer: Buffer ): null | { errorMessage: string } {
	const actual = PNG.sync.read( actualBuffer );
	const expected = PNG.sync.read( expectedBuffer );

	if ( actual.width !== expected.width || actual.height !== expected.height ) {
		return { errorMessage: `Expected an image ${ expected.width }px by ${ expected.height }px, received ${ actual.width }px by ${ actual.height }px.` };
	}

	const diff = new PNG( { width: actual.width, height: actual.height } );
	const diffPixels = pixelmatch( expected.data, actual.data, diff.data, actual.width, actual.height, { threshold: PIXELMATCH_THRESHOLD } );

	return diffPixels > 0 ? { errorMessage: `${ diffPixels } pixels are different.` } : null;
}
