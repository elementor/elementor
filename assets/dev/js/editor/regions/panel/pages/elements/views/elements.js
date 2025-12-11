var PanelElementsElementsView;

PanelElementsElementsView = Marionette.CollectionView.extend( {
	childView: require( 'elementor-panel/pages/elements/views/element' ),

	id: 'elementor-panel-elements',

	className: 'elementor-responsive-panel',

	initialize() {
		this.listenTo( elementor.channels.panelElements, 'filter:change', this.onFilterChanged );
		this.initVectorCollection();
	},

	filter( childModel ) {
		const filterValue = elementor.channels.panelElements.request( 'filter:value' );

		if ( ! filterValue ) {
			return true;
		}

		// Prevent from wordpress widgets to show in search result.
		if ( childModel.get( 'hideOnSearch' ) ) {
			return false;
		}

		if ( -1 !== childModel.get( 'title' ).toLowerCase().indexOf( filterValue.toLowerCase() ) ) {
			return true;
		}

		// Get the filter input localized value.
		const localized = elementor.channels.panelElements.request( 'filter:localized' ) || '';

		const hasKeywordsResult = _.any( childModel.get( 'keywords' ), function( keyword ) {
			keyword = keyword.toLowerCase();

			const regularFilter = ( -1 !== keyword.indexOf( filterValue.toLowerCase() ) ),
				localizedFilter = ( localized && -1 !== keyword.indexOf( localized.toLowerCase() ) );

			return regularFilter || localizedFilter;
		} );

		if ( hasKeywordsResult ) {
			return true;
		}

		return this.similarityResults?.find( function( result ) {
			return result.id === childModel.get( 'widgetType' );
		} );
	},

	onFilterChanged() {
		const filterValue = elementor.channels.panelElements.request( 'filter:value' );

		if ( ! filterValue ) {
			this.onFilterEmpty();
		}

		this.similarityResults = this.getResults( filterValue.toLowerCase() )
			.filter( ( result ) => result.similarity > 0.8 )
			.slice( 0, 5 );

		this._renderChildren();

		this.triggerMethod( 'children:render' );
	},

	onFilterEmpty() {
		$e.routes.refreshContainer( 'panel' );
	},

	word2vec( word ) {
		const vector = [];
		const maxVectorLength = 8;
		for ( const char of word ) {
			const charCode = char.charCodeAt( 0 );
			if ( charCode >= 97 && charCode <= 122 ) {
				vector.push( charCode - 96 );
			} else if ( charCode >= 65 && charCode <= 90 ) {
				vector.push( charCode - 64 );
			} else {
				vector.push( charCode );
			}
		}

		while ( vector.length < maxVectorLength ) {
			vector.push( 0 );
		}

		return vector.slice( 0, maxVectorLength );
	},

	cosineSimilarity( a, b ) {
		const dotProduct = a.reduce( ( acc, _, i ) => acc + a[ i ] * b[ i ], 0 );
		const magnitudeA = Math.sqrt( a.reduce( ( acc, _, i ) => acc + a[ i ] * a[ i ], 0 ) );
		const magnitudeB = Math.sqrt( b.reduce( ( acc, _, i ) => acc + b[ i ] * b[ i ], 0 ) );
		return dotProduct / ( magnitudeA * magnitudeB );
	},

	getResults( query ) {
		const queryVector = this.word2vec( query );
		const results = [];
		for ( const [ id, vector ] of Object.entries( this.widgetVectors ) ) {
			const similarity = this.cosineSimilarity( queryVector, vector );
			results.push( { id, similarity } );
		}
		// Sort results by similarity
		results.sort( ( a, b ) => b.similarity - a.similarity );
		return results;
	},

	initVectorCollection() {
		this.widgetVectors = Object.values( elementor.widgetsCache ).reduce( ( acc, config ) => {
			acc[ config.name ] = this.word2vec( config.title );
			return acc;
		}, {} );
	},
} );

module.exports = PanelElementsElementsView;
