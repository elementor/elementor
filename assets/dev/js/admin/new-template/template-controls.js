export default class TemplateControls {
	setDynamicControlsVisibility( lookupControlIdPrefix, controls ) {
		if ( undefined === controls ) {
			return;
		}

		const controlsArray = Object.entries( controls );

		for ( const [ controlId, controlSettings ] of controlsArray ) {
			this.setVisibilityForControl( lookupControlIdPrefix, controlSettings, controlId );
		}
	}

	setVisibilityForControl( lookupControlIdPrefix, controlSettings, controlId ) {
		const conditions = Object.entries( controlSettings.conditions ?? {} );

		conditions.forEach( ( condition ) => {
			this.changeVisibilityBasedOnCondition( lookupControlIdPrefix, condition, controlId );
		} );
	}

	changeVisibilityBasedOnCondition( lookupControlIdPrefix, condition, controlId ) {
		const [ conditionKey, conditionValue ] = condition;
		const targetControlWrapper = document.getElementById( lookupControlIdPrefix + controlId + '__wrapper' );
		const lookupControl = document.getElementById( lookupControlIdPrefix + conditionKey );

		targetControlWrapper.classList.toggle( 'elementor-hidden', ! lookupControl || conditionValue !== lookupControl.value );
	}
}

