const PanelElementsElementView = require( '../views/element' );

module.exports = Marionette.CompositeView.extend({
    template: '#tmpl-elementor-panel-global-components',
    childView: PanelElementsElementView,
    childViewContainer: '.elementor-panel-global-components-list',

    initialize() {
        this.collection = new Backbone.Collection([{
            title: elementor.translate('Profile Card Component'),
            elType: 'widget',
            name: 'e-component',
            icon: 'eicon-user-circle-o',
            categories: ['basic'],
            keywords: ['component', 'profile', 'card']
        }]);
    }
}); 