const STATE_ACTIVE = 'active';
const STATE_INACTIVE = 'inactive';
const STATE_DEFAULT = 'default';

export default class ExperimentsDependency {
	elements = {};

	constructor( { selects, submit } ) {
		this.elements = {
			/**
			 * @type {HTMLSelectElement[]}
			 */
			selects,

			/**
			 * @type {HTMLInputElement}
			 */
			submit,
		};
	}

	bindEvents() {
		this.elements.selects.forEach( ( select ) => {
			select.addEventListener( 'change', ( e ) => this.onExperimentStateChange( e ) );
		} );
	}

	onExperimentStateChange( e ) {
		const { experimentId } = e.currentTarget.dataset,
			experimentNewState = this.getExperimentActualState( experimentId );

		switch ( experimentNewState ) {
			case STATE_ACTIVE:
				if ( this.shouldShowDependenciesDialog( experimentId ) ) {
					this.showDependenciesDialog( experimentId );
				}
				break;

			case STATE_INACTIVE:
				this.deactivateDependantExperiments( experimentId );
				break;

			default:
				break;
		}
	}

	getExperimentData( experimentId ) {
		return elementorAdminConfig.experiments[ experimentId ];
	}

	getExperimentDependencies( experimentId ) {
		return this
			.getExperimentData( experimentId )
			.dependencies
			.map( ( dependencyId ) => (
				this.getExperimentData( dependencyId )
			) );
	}

	getExperimentSelect( experimentId ) {
		return this.elements.selects.find( ( select ) => select.matches( `[data-experiment-id="${ experimentId }"]` ) );
	}

	setExperimentState( experimentId, state ) {
		this.getExperimentSelect( experimentId ).value = state;
	}

	getExperimentActualState( experimentId ) {
		const state = this.getExperimentSelect( experimentId ).value;

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
		return ( this.getExperimentData( experimentId ).default === STATE_ACTIVE );
	}

	areAllDependenciesActive( dependencies ) {
		return dependencies.every( ( dependency ) => this.isExperimentActive( dependency.name ) );
	}

	deactivateDependantExperiments( experimentId ) {
		Object
			.entries( elementorAdminConfig.experiments )
			.forEach( ( [ id, experimentData ] ) => {
				const isDependant = ( experimentData.dependencies.includes( experimentId ) );

				if ( isDependant ) {
					this.setExperimentState( id, STATE_INACTIVE );
				}
			} );
	}

	shouldShowDependenciesDialog( experimentId ) {
		const dependencies = this.getExperimentDependencies( experimentId );

		return ! this.areAllDependenciesActive( dependencies );
	}

	showDependenciesDialog( experimentId ) {
		const experiment = this.getExperimentData( experimentId ),
			dependencies = this.getExperimentDependencies( experimentId );

		const dependenciesList = this.joinDepenednciesNames( dependencies.map( ( d ) => d.title ), ', ', ' & ' );

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

				this.elements.submit.click();
			},
			onCancel: () => {
				this.setExperimentState( experimentId, STATE_INACTIVE );
			},
		} ).show();
	}

	joinDepenednciesNames( array, glue, finalGlue = '' ) {
		if ( '' === finalGlue ) {
			return array.join( glue );
		}

		if ( ! array.length ) {
			return '';
		}

		if ( 1 === array.length ) {
			return array[ 0 ];
		}

		const clone = [ ...array ],
			lastItem = clone.pop();

		return clone.join( glue ) + finalGlue + lastItem;
	}
}
