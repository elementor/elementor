import Arr from 'elementor-utils/arr';

const STATE_ACTIVE = 'active';
const STATE_INACTIVE = 'inactive';
const STATE_DEFAULT = 'default';

export default class ExperimentsModule extends elementorModules.ViewModule {
	getDefaultSettings() {
		return {
			selectors: {
				experimentIndicators: '.e-experiment__title__indicator',
				experimentForm: '#elementor-settings-form',
				experimentSelects: '.e-experiment__select',
				experimentsButtons: '.e-experiment__button',
			},
		};
	}

	getDefaultElements() {
		const { selectors } = this.getSettings();

		return {
			$experimentIndicators: jQuery( selectors.experimentIndicators ),
			$experimentForm: jQuery( selectors.experimentForm ),
			$experimentSelects: jQuery( selectors.experimentSelects ),
			$experimentsButtons: jQuery( selectors.experimentsButtons ),
		};
	}

	bindEvents() {
		this.elements.$experimentsButtons.on( 'click', ( event ) => this.onExperimentsButtonsClick( event ) );
		this.elements.$experimentSelects.on( 'change', ( event ) => this.onExperimentStateChange( event ) );
    }

	onExperimentsButtonsClick( event ) {
		const submitButton = jQuery( event.currentTarget );

		this.elements.$experimentSelects.val( submitButton.val() );
		this.elements.$experimentForm.find( '#submit' ).trigger( 'click' );
	}

	onExperimentStateChange( e ) {
		const { experimentId } = e.currentTarget.dataset,
			experimentNewState = this.getExperimentActualState( experimentId );

		switch ( experimentNewState ) {
			case STATE_ACTIVE:
				this.showDependenciesDialog( experimentId );
				break;

			case STATE_INACTIVE:
				this.deactivateDependantExperiments( experimentId );
				break;

			default:
				break;
		}
	}

	getExperimentSelect( experimentId ) {
		return this.elements.$experimentSelects.filter( `[data-experiment-id="${ experimentId }"]` );
	}

	setExperimentState( experimentId, state ) {
		this.getExperimentSelect( experimentId ).val( state );
	}

	getExperimentActualState( experimentId ) {
		const state = this.getExperimentSelect( experimentId ).val();

		if ( state !== STATE_DEFAULT ) {
			return state;
		}

		// Normalize the "default" state to the actual state value.
		return this.isExperimentActiveByDefault( experimentId )
			? STATE_ACTIVE
			: STATE_INACTIVE;
	}

	isExperimentActive( experimentId ) {
		return ( this.getExperimentActualState( experimentId ) === STATE_ACTIVE );
	}

	isExperimentActiveByDefault( experimentId ) {
		return ( elementorAdmin.config.experiments[ experimentId ].default === STATE_ACTIVE );
	}

	areAllDependenciesActive( dependencies ) {
		return dependencies.every( ( dependency ) => this.isExperimentActive( dependency.name ) );
	}

	deactivateDependantExperiments( experimentId ) {
		Object
			.entries( elementorAdmin.config.experiments )
			.forEach( ( [ id, experimentData ] ) => {
				const isDependant = ( experimentData.dependencies.includes( experimentId ) );

				if ( isDependant ) {
					this.setExperimentState( id, STATE_INACTIVE );
				}
			} );
	}

	showDependenciesDialog( experimentId ) {
		const experiment = elementorAdmin.config.experiments[ experimentId ];

		const dependencies = experiment
			.dependencies
			.map( ( dependencyId ) => (
				elementorAdmin.config.experiments[ dependencyId ]
			) );

		if ( this.areAllDependenciesActive( dependencies ) ) {
			return;
		}

		const dependenciesList = Arr.join( dependencies.map( ( d ) => d.title ), ', ', ' & ' );

		// Translators: %1$s: Experiment title, %2$s: Experiment dependencies list
		const message = __( 'In order to use %1$s, first you need to activate %2$s.', 'elementor' )
			.replace( '%1$s', `<strong>${ experiment.title }</strong>` )
			.replace( '%2$s', `<strong>${ dependenciesList }</strong>` );

		elementorCommon.dialogsManager.createWidget( 'confirm', {
			id: 'e-experiments-dependency-dialog',
			headerMessage: __( 'First, activate another experiment.', 'elementor' ),
			message,
			position: {
				my: 'center center',
				at: 'center center',
			},
			strings: {
				confirm: __( 'Activate', 'elementor' ),
				cancel: __( 'Cancel', 'elementor' ),
			},
			hide: {
				onOutsideClick: false,
				onBackgroundClick: false,
				onEscKeyPress: false,
			},
			onConfirm: () => {
				dependencies.forEach( ( dependency ) => {
					this.setExperimentState( dependency.name, STATE_ACTIVE );
				} );

				this.elements.$experimentForm.find( '#submit' ).trigger( 'click' );
			},
			onCancel: () => {
				this.setExperimentState( experimentId, STATE_INACTIVE );
			},
		} ).show();
	}

	addTipsy( $element ) {
		$element.tipsy( {
			gravity: 's',
			offset: 8,
			title() {
				return this.getAttribute( 'data-tooltip' );
			},
		} );
	}

	addIndicatorsTooltips() {
		this.elements.$experimentIndicators.each( ( index, experimentIndicator ) => this.addTipsy( jQuery( experimentIndicator ) ) );
	}

	onInit() {
		super.onInit();

		if ( this.elements.$experimentIndicators.length ) {
			import(
				/* webpackIgnore: true */
				`${ elementorCommon.config.urls.assets }lib/tipsy/tipsy.min.js?ver=1.0.0`
				).then( () => this.addIndicatorsTooltips() );
		}
	}
}
