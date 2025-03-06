module.exports = Marionette.ItemView.extend( {
    tagName: 'li',
    template: _.template( '<i class="eicon-folder-o" aria-hidden="true"></i><%= title %>' ),
    className: 'folder-item',

    attributes() {
        const data = this.model.toJSON();

        return {
            'data-id': data.template_id,
            'data-value': data.title,
        };
    },

    render() {
        this.$el.html( this.template( this.model.toJSON() ) );

        return this;
    },
} );
