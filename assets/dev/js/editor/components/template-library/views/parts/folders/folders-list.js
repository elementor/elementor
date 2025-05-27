const EmptyView = require( './folder-empty' );
const FolderItemView = require( './folder-item' );

module.exports = Marionette.CollectionView.extend( {
    tagName: 'ul',
    className: 'folder-list',
    childView: FolderItemView,
    emptyView: EmptyView,
} );
