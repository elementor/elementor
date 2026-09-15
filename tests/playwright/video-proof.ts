import { parallelTest as test } from './parallelTest';

/**
 * Editor-bug Playwright suites that should leave a video on a passing CI run.
 *
 * Default CI video is retain-on-failure, so a green test deletes its clip.
 * This wrapper tags the suite `@video-proof` and forces `video: 'on'`.
 */
export function describeVideoProof( title: string, callback: () => void ): void {
	test.describe( `${ title } @video-proof`, () => {
		test.use( { video: 'on' } );
		callback();
	} );
}
