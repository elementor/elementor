import PropTypes from 'prop-types';

export default function ThemeSelectionCard( {
	themeSlug,
	label,
	title,
	description,
	illustration,
	isSelected,
	isLoading,
	onSelect,
	'aria-label': ariaLabel,
	role,
	tabIndex,
	onKeyDown,
} ) {
	const handleClick = () => {
		if ( onSelect && ! isLoading ) {
			onSelect( themeSlug );
		}
	};

	const handleKeyDown = ( e ) => {
		if ( ( 'Enter' === e.key || ' ' === e.key ) && onSelect && ! isLoading ) {
			e.preventDefault();
			onSelect( themeSlug );
		}
	};

	const handleKeyDownEvent = onKeyDown || handleKeyDown;

	return (
		<div
			className={ `e-onboarding__theme-card ${ isSelected ? 'e-onboarding__theme-card--selected' : '' } ${ isLoading ? 'e-onboarding__theme-card--loading' : '' }` }
			data-theme={ themeSlug }
			onClick={ handleClick }
			role={ role || 'button' }
			tabIndex={ tabIndex !== undefined ? tabIndex : 0 }
			onKeyDown={ handleKeyDownEvent }
			aria-label={ ariaLabel }
		>
			<div className={ `e-onboarding__theme-card-illustration ${ illustration?.className || '' }` }>
				{ illustration?.svg }
			</div>
			<div className="e-onboarding__theme-card-content">
				<span className="e-onboarding__theme-card-label"><span>{ label }</span> by Elementor</span>
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
	label: PropTypes.string,
	title: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	illustration: PropTypes.shape( {
		svg: PropTypes.element.isRequired,
		className: PropTypes.string,
	} ).isRequired,
	isSelected: PropTypes.bool,
	isLoading: PropTypes.bool,
	onSelect: PropTypes.func,
	'aria-label': PropTypes.string,
	role: PropTypes.string,
	tabIndex: PropTypes.number,
	onKeyDown: PropTypes.func,
};
