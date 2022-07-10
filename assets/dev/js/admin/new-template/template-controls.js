export default class TemplateControls  {

 setDynamicFieldsVisibility = function ( lookup_control_id_prefix , controls )  {
	if ( undefined === controls ){
		return;
	}

	let controls_array = Object.entries( controls );
	for ( const [ control_id , control_settings ] of controls_array ) {
		setVisibilityForControl( lookup_control_id_prefix , control_settings , control_id );
	}

	function setVisibilityForControl( lookup_control_id_prefix , control_settings , control_id ) {
		let conditions = Object.entries( control_settings.conditions ?? {} );
		conditions.forEach( condition => {
			changeVisibilityBasedOnCondition( lookup_control_id_prefix , condition , control_id );
		})
	}

	function changeVisibilityBasedOnCondition( lookup_control_id_prefix , condition , control_id ) {
		const [ condition_key , condition_value ] = condition;
		const target_control_wrapper = document.getElementById( lookup_control_id_prefix + control_id + '__wrapper' );
		if (target_control_wrapper) {
			target_control_wrapper.classList.add( 'elementor-hidden' );
		}
		let lookup_control = document.getElementById( lookup_control_id_prefix + condition_key );
		if ( ! lookup_control ) {
			return;
		}
		if ( ! ( condition_value === lookup_control.value ) ) {
			return;
		}
		if ( target_control_wrapper ) {
			target_control_wrapper.classList.remove( 'elementor-hidden' );
		}
	}
}

