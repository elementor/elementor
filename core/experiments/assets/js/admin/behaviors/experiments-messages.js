const STATE_ACTIVE = 'active';
const STATE_INACTIVE = 'inactive';
const STATE_DEFAULT = 'default';

export default class ExperimentsMessages {
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
				if ( this.shouldShowDeactivationDialog( experimentId ) ) {
					this.showDeactivationDialog( experimentId );
				} else {
					this.deactivateDependantExperiments( experimentId );
				}
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
		const state = this.getExperimentSelect( experimentId )?.value;

		if ( ! state ) {
			return this.getExperimentData( experimentId ).state;
		}

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
				const isDependant = experimentData.dependencies.includes( experimentId ),
					isActive = this.getExperimentActualState( id ) === STATE_ACTIVE;

				if ( isDependant && isActive ) {
					this.setExperimentState( id, STATE_INACTIVE );
				}
			} );
	}

	shouldShowDependenciesDialog( experimentId ) {
		const dependencies = this.getExperimentDependencies( experimentId );

		return ! this.areAllDependenciesActive( dependencies );
	}

	shouldShowDeactivationDialog( experimentId ) {
		const getExperimentData = this.getExperimentData( experimentId ),
			isInitialStateActive = getExperimentData.state === STATE_ACTIVE || ( getExperimentData.state === STATE_DEFAULT && getExperimentData.default === STATE_ACTIVE ),
			hasMessage = !! this.getMessage( experimentId, 'on_deactivate' );

		return hasMessage && isInitialStateActive;
	}

	showDialog( dialog ) {
		return elementorCommon.dialogsManager.createWidget( 'confirm', {
			id: 'e-experiments-messages-dialog',
			headerMessage: dialog.headerMessage,
			message: dialog.message,
			position: {
				my: 'center center',
				at: 'center center',
			},
			strings: {
				confirm: dialog.strings.confirm,
				cancel: dialog.strings.cancel,
			},
			hide: {
				onOutsideClick: false,
				onBackgroundClick: false,
				onEscKeyPress: false,
			},
			onConfirm: dialog.onConfirm,
			onCancel: dialog.onCancel,
		} ).show();
	}

	getSiteLanguageCode() {
		const languageCode = document.querySelector( 'html' ).getAttribute( 'lang' );

		return languageCode ?? 'en'; // Fallback to English if no language code found.
	}

	formatDependenciesList( dependencies ) {
		const dependenciesTitles = dependencies.map( ( d ) => d.title );
		const languageCode = this.getSiteLanguageCode();

		return new Intl.ListFormat( languageCode ).format( dependenciesTitles );
	}

	showDependenciesDialog( experimentId ) {
		const experiment = this.getExperimentData( experimentId ),
			experimentName = experiment.title,
			dependenciesList = this.formatDependenciesList( this.getExperimentDependencies( experimentId ) );

		// Translators: %1$s: Experiment title, %2$s: Comma-separated dependencies list
		const message = __( 'In order to use %1$s, first you need to activate %2$s.', 'elementor' )
			.replace( '%1$s', `<strong>${ experimentName }</strong>` )
			.replace( '%2$s', dependenciesList );

		this.showDialog( {
			message,
			headerMessage: __( 'First, activate another experiment.', 'elementor' ),
			strings: {
				confirm: __( 'Activate', 'elementor' ),
				cancel: __( 'Cancel', 'elementor' ),
			},
			onConfirm: () => {
				this.getExperimentDependencies( experimentId ).forEach( ( dependency ) => {
					this.setExperimentState( dependency.name, STATE_ACTIVE );
				} );
				this.elements.submit.click();
			},
			onCancel: () => {
				this.setExperimentState( experimentId, STATE_INACTIVE );
			},
		} );
	}

	showDeactivationDialog( experimentId ) {
		this.showDialog( {
			message: this.getMessage( experimentId, 'on_deactivate' ),
			headerMessage: __( 'Are you sure?', 'elementor' ),
			strings: {
				confirm: __( 'Deactivate', 'elementor' ),
				cancel: __( 'Cancel', 'elementor' ),
			},
			onConfirm: () => {
				this.setExperimentState( experimentId, STATE_INACTIVE );
				this.deactivateDependantExperiments( experimentId );
				this.elements.submit.click();
			},
			onCancel: () => {
				this.setExperimentState( experimentId, STATE_ACTIVE );
			},
		} );
	}

	getMessage( experimentId, messageId ) {
		return this
			.getExperimentData( experimentId )
			?.messages[ messageId ];
	}
}
