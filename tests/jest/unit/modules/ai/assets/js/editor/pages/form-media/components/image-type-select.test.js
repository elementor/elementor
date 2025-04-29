import { render } from '@testing-library/react';
import ImageTypeSelect from 'elementor/modules/ai/assets/js/editor/pages/form-media/components/image-type-select';
import useIntroduction from 'elementor/modules/ai/assets/js/editor/hooks/use-introduction';

jest.mock( 'elementor/modules/ai/assets/js/editor/hooks/use-introduction', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

describe( 'ImageTypeSelect Component', () => {
	const mockOnChange = jest.fn();
	const mockMarkAsViewed = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();

		useIntroduction.mockImplementation( () => ( {
			isViewed: true,
			markAsViewed: mockMarkAsViewed,
		} ) );
	} );

	it( 'calls markAsViewed when vector option is selected', () => {
		const { unmount } = render( <ImageTypeSelect onChange={ mockOnChange } /> );

		const event = { target: { value: 'vector' } };
		const instance = ImageTypeSelect( {} );
		const onChangeHandler = instance.props.onChange;
		onChangeHandler( event );

		expect( mockMarkAsViewed ).toHaveBeenCalled();

		unmount();
	} );

	it( 'does not call markAsViewed when other options are selected', () => {
		const { unmount } = render( <ImageTypeSelect onChange={ mockOnChange } /> );

		const event = { target: { value: 'photographic' } };
		const instance = ImageTypeSelect( {} );
		const onChangeHandler = instance.props.onChange;
		onChangeHandler( event );

		expect( mockMarkAsViewed ).not.toHaveBeenCalled();

		unmount();
	} );
} );
