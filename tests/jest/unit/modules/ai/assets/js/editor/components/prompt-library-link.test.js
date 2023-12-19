import { render } from '@testing-library/react';
import PromptLibraryLink from '../../../../../../../../../modules/ai/assets/js/editor/components/prompt-library-link';

describe( 'PromptLibraryLink', () => {
	it( 'Should render a link to the library from props', async () => {
		const { getByRole } = render(
			<div data-testid="test_id">
				<PromptLibraryLink libraryLink="http://ai-team-rules.ai/" />,
			</div>,
		);

		const element = await getByRole( 'link', { name: 'prompt library' } );

		expect( element.href ).toBe( 'http://ai-team-rules.ai/' );
	} );
} );
