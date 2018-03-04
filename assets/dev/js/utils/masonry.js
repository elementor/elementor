var ViewModule = require( './view-module' );

module.exports = ViewModule.extend( {

	getDefaultSettings: function() {
		return {
			container: null,
			items: null,
			columnsCount: 3,
			verticalSpaceBetween: 30
		};
	},

	getDefaultElements: function() {
		return {
			$container: jQuery( this.getSettings( 'container' ) ),
			$items: jQuery( this.getSettings( 'items' ) )
		};
	},

	run: function() {
		var heights = [],
			distanceFromTop = this.elements.$container.position().top,
			settings = this.getSettings(),
			columnsCount = settings.columnsCount;

		distanceFromTop += parseInt( this.elements.$container.css( 'margin-top' ), 10 );

		this.elements.$container.height( '' );

		this.elements.$items.each( function( index ) {
			var row = Math.floor( index / columnsCount ),
				indexAtRow = index % columnsCount,
				$item = jQuery( this ),
				itemPosition = $item.position(),
				itemHeight = $item[0].getBoundingClientRect().height + settings.verticalSpaceBetween;

			if ( row ) {
				var pullHeight = itemPosition.top - distanceFromTop - heights[ indexAtRow ];

				pullHeight -= parseInt( $item.css( 'margin-top' ), 10 );

				pullHeight *= -1;

				$item.css( 'margin-top', pullHeight + 'px' );

				heights[ indexAtRow ] += itemHeight;
			} else {
				heights.push( itemHeight );
			}
		} );

		this.elements.$container.height( Math.max.apply( Math, heights ) );
	}
} );
