export function applyNavigatorSearch( rootView, query ) {
	const normalized = ( query || '' ).trim().toLowerCase();
	const matches = new Set();

	const walk = ( view ) => {
		if ( ! view?.model?.get ) {
			return false;
		}

		if ( view.isNavigatorContainer?.() ) {
			view.children?.each( ( child ) => walk( child ) );
			return false;
		}

		let subtreeMatch = false;

		view.children?.each( ( child ) => {
			if ( walk( child ) ) {
				subtreeMatch = true;
			}
		} );

		const title = `${ view.model.getTitle() || '' }`.toLowerCase();
		const hint = `${ view.$el.find( '.elementor-navigator__element__title__hint' ).text() || '' }`.toLowerCase();
		const selfMatch = ! normalized || title.includes( normalized ) || hint.includes( normalized );

		if ( selfMatch && normalized ) {
			matches.add( view.model.id );
		}

		const visible = ! normalized || selfMatch || subtreeMatch;

		view.$el.toggleClass( 'elementor-navigator__element--search-hidden', ! visible );

		if ( visible && normalized && ! selfMatch ) {
			view.$el.addClass( 'elementor-navigator__element--search-muted' );
		} else {
			view.$el.removeClass( 'elementor-navigator__element--search-muted' );
		}

		if ( selfMatch && normalized ) {
			view.$el.addClass( 'elementor-navigator__element--search-match' );
		} else {
			view.$el.removeClass( 'elementor-navigator__element--search-match' );
		}

		return visible;
	};

	walk( rootView );

	if ( normalized && matches.size ) {
		rootView.recursiveChildInvoke( 'revealForSearch', [ ...matches ] );
	}
}
