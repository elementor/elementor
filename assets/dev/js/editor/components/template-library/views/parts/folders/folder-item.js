module.exports = Marionette.View.extend( {
    tagName: 'li',
    template: _.template('<%= title %>'),

	attributes() {
        const data = this.model.toJSON();
        
        return {
            'data-id': data.template_id,
            'data-value': data.title
        };
    },

    render() {
        const data = this.model.toJSON();

        this.$el.html(this.template(data));

        return this;
    }
} );
