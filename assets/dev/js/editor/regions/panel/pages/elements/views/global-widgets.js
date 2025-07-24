module.exports = Marionette.ItemView.extend({
    template: '#tmpl-elementor-panel-global-widgets',
    className: 'elementor-panel-global-widgets',

    initialize() {
        elementor.getPanelView().getCurrentPageView().search.reset();
    }
}); 