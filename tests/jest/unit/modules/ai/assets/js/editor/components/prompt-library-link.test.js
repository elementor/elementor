import PromptLibraryLink from 'elementor/modules/ai/assets/js/editor/components/prompt-library-link';
import { renderWithTheme } from '../test-utils';

describe( 'PromptLibraryLink', () => {
	it( 'Should render a link to the library from props', async () => {
		const { getByRole } = renderWithTheme(
			<PromptLibraryLink libraryLink="http://ai-team-rules.ai/" />,
		);

		const element = await getByRole( 'link', { name: 'prompt library' } );

		expect( element.href ).toBe( 'http://ai-team-rules.ai/' );
	} );
} );
