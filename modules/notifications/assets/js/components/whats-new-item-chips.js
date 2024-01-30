import { Chip, Stack } from '@elementor/ui';

export const WhatsNewItemChips = ( { chipPlan, chipTags, itemIndex } ) => {
	const chips = [];

	if ( chipPlan ) {
		chips.push( {
			color: 'promotion',
			size: 'small',
			label: chipPlan,
		} );
	}

	if ( chipTags ) {
		chipTags.forEach( ( chipTag ) => {
			chips.push( {
				variant: 'outlined',
				size: 'small',
				label: chipTag,
			} );
		} );
	}

	if ( ! chips.length ) {
		return null;
	}

	return (
		<Stack
			direction="row"
			flexWrap="wrap"
			gap={ 1 }
			sx={ {
				pb: 1,
			} }
		>
			{ chips.map( ( chip, chipIndex ) => {
				return (
					<Chip
						key={ `chip-${ itemIndex }${ chipIndex }` }
						{ ...chip }
					/>
				);
			} ) }
		</Stack>
	);
};

WhatsNewItemChips.propTypes = {
	chipPlan: PropTypes.string,
	chipTags: PropTypes.array,
	itemIndex: PropTypes.number.isRequired,
};
