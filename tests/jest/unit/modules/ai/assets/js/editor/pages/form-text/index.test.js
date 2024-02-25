import { render, screen } from '@testing-library/react';
import FormText from 'elementor/modules/ai/assets/js/editor/pages/form-text';
import {
	PromptHistoryActionProvider,
} from 'elementor/modules/ai/assets/js/editor/components/prompt-history/context/prompt-history-action-context';

describe( 'FormText initialValue functionality', () => {
	it( 'renders the generate text screen when getControlValue equals defaultValue', () => {
		const mockGetControlValue = jest.fn().mockReturnValue( 'Some default value' );
		const additionalOptions = { defaultValue: 'Some default value' };

		render(
			<PromptHistoryActionProvider>
				<FormText
					type="text"
					onClose={ () => {} }
					getControlValue={ mockGetControlValue }
					setControlValue={ () => {} }
					additionalOptions={ additionalOptions }
					credits={ 100 }
				/>
			</PromptHistoryActionProvider>,
		);

		expect( screen.getByText( 'Generate text' ) ).toBeInTheDocument();
	} );

	it( 'renders the generate text when getControlValue equals defaultValue for repeater elenents', () => {
		const mockGetControlValue = jest.fn().mockReturnValue( 'Some 1 value' );
		const additionalOptions = { defaultValue: 'Some value' };

		render(
			<PromptHistoryActionProvider>
				<FormText
					type="text"
					onClose={ () => {} }
					getControlValue={ mockGetControlValue }
					setControlValue={ () => {} }
					additionalOptions={ additionalOptions }
					credits={ 100 }
				/>
			</PromptHistoryActionProvider>,
		);

		expect( screen.getByText( 'Generate text' ) ).toBeInTheDocument();
	} );

	it( 'renders the edit text screen when getControlValue not equals defaultValue', () => {
		const mockGetControlValue = jest.fn().mockReturnValue( 'Some default value' );
		const additionalOptions = { defaultValue: 'Other value' };

		render(
			<PromptHistoryActionProvider>
				<FormText
					type="text"
					onClose={ () => {} }
					getControlValue={ mockGetControlValue }
					setControlValue={ () => {} }
					additionalOptions={ additionalOptions }
					credits={ 100 }
				/>
			</PromptHistoryActionProvider>,
		);

		expect( screen.getByText( 'Generate text' ) ).not.toBeInTheDocument();
	} );
} );
