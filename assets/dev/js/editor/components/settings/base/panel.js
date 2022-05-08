module.exports = elementorModules.editor.views.ControlsStack.extend( {
	id() {
		return 'elementor-panel-' + this.getOption( 'name' ) + '-settings';
	},

	getTemplate() {
		return '#tmpl-elementor-panel-' + this.getOption( 'name' ) + '-settings';
	},

	childViewContainer() {
		return '#elementor-panel-' + this.getOption( 'name' ) + '-settings-controls';
	},

	childViewOptions() {
		return {
			container: this.getOption( 'editedView' ).getContainer(),
		};
	},
} );
