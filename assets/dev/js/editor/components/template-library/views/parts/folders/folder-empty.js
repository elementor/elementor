module.exports = Marionette.ItemView.extend( {
    tagName: 'li',
    className: 'no-results',
    template: _.template( sprintf(
        /* Translators: 1: Empty message, 2: CTA. */
        '<p>%s<br>%s</p>',
        __( 'Folders you create will appear here.', 'elementor' ),
        __( 'To create a new one, go to Cloud library.', 'elementor' ),
    ) ),
} );
