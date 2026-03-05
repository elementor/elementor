# WP Media

This package is an adapter for WordPress' `wp.media` function. It allows you to open the WordPress media modal, select or upload images from the media library, and get attachment data.
It assumes that the `wp.media` function is available in the global scope, and will throw otherwise. Therefore, to use this package, make sure to add the `media-models` handle in the dependencies array of this package.
