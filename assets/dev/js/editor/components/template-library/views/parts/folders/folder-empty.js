module.exports = Marionette.ItemView.extend( {
    tagName: 'li',
    className: 'no-results',
    template: _.template('<p>Folders you create will appear here.<br>To create a new one, go to Cloud library.</p>'),
} );
