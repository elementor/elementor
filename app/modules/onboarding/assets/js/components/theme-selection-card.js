import PropTypes from 'prop-types';

export default function ThemeSelectionCard( { 
	themeSlug, 
	title, 
	description, 
	illustration, 
	isSelected, 
	onSelect 
} ) {
	const handleClick = () => {
		if ( onSelect ) {
			onSelect( themeSlug );
		}
	};

	const handleKeyDown = ( e ) => {
		if ( ( e.key === 'Enter' || e.key === ' ' ) && onSelect ) {
			e.preventDefault();
			onSelect( themeSlug );
		}
	};

	return (
		<div 
			className={ `e-onboarding__theme-card ${ isSelected ? 'e-onboarding__theme-card--selected' : '' }` }
			data-theme={ themeSlug }
			onClick={ handleClick }
			role="button"
			tabIndex={ 0 }
			onKeyDown={ handleKeyDown }
		>
			<div className={ `e-onboarding__theme-card-illustration ${ illustration?.className || '' }` }>
				{ illustration?.svg }
			</div>
			<div className="e-onboarding__theme-card-content">
				<h3 className="e-onboarding__theme-card-title">
					{ title }
				</h3>
				<p className="e-onboarding__theme-card-description">
					{ description }
				</p>
			</div>
		</div>
	);
}

ThemeSelectionCard.propTypes = {
	themeSlug: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	illustration: PropTypes.shape( {
		svg: PropTypes.element.isRequired,
		className: PropTypes.string,
	} ).isRequired,
	isSelected: PropTypes.bool,
	onSelect: PropTypes.func,
};
