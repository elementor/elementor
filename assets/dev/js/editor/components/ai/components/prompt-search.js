import { forwardRef } from 'react';
import SearchField from './ui/search-field';

const PromptSearch = forwardRef( ( props, ref ) => {
	return (
		<SearchField
			name="prompt"
			placeholder={ __( 'Describe the text and tone you want to use', 'elementor' ) + '...' }
			{ ...props }
			ref={ ref }
		/>
	);
} );

export default PromptSearch;
