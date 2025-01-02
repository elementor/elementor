<?php

declare( strict_types=1 );

use Isolated\Symfony\Component\Finder\Finder;

return array(
	'prefix' => 'ElementorDeps',
	'finders' => array(
		Finder::create()->files()->in( 'vendor/psr/container' )->name( array( '*.php', 'LICENSE', 'composer.json' ) ),
		Finder::create()->files()->in( 'vendor/laravel/serializable-closure' )->name( array( '*.php', 'LICENSE', 'composer.json' ) ),
		Finder::create()->files()->in( 'vendor/php-di' )->name( array( '*.php', 'LICENSE', 'composer.json' ) ),
	),
	'patchers' => array(
		/**
		 * Replaces the Adapter string references with the prefixed versions.
		 *
		 * @param string $filePath The path of the current file.
		 * @param string $prefix   The prefix to be used.
		 * @param string $content  The content of the specific file.
		 *
		 * @return string The modified content.
		 */
		function ( $file_path, $prefix, $content ) {
			if ( substr( $file_path, -46 ) !== 'vendor/php-di/php-di/src/Compiler/Template.php' ) {
				return $content;
			}
		},
	),
);
