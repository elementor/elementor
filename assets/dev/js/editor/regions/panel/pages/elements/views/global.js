const GlobalWidgetsView = Marionette.ItemView.extend({
    template: '#tmpl-elementor-panel-global-widgets',
    className: 'elementor-panel-global-widgets'
});

const GlobalComponentsView = Marionette.ItemView.extend({
    template: '#tmpl-elementor-panel-global-components',
    className: 'elementor-panel-global-components'
});

module.exports = Marionette.LayoutView.extend({
    template: '#tmpl-elementor-panel-global',

    id: 'elementor-panel-global',

    regions: {
        widgets: '#elementor-panel-global-widgets',
        components: '#elementor-panel-global-components'
    },

    initialize() {
        elementor.getPanelView().getCurrentPageView().search.reset();
        this.showGlobalWidgets();
        this.showGlobalComponents();
    },

    showGlobalWidgets() {
        this.widgets.show(new GlobalWidgetsView());
    },

    showGlobalComponents() {
        this.components.show(new GlobalComponentsView());
    }
});
