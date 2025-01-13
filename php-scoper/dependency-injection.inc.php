<?php

declare( strict_types=1 );

use Isolated\Symfony\Component\Finder\Finder;

return [
	'prefix' => 'ElementorDeps',
	'finders' => [
		Finder::create()->files()->in( 'vendor/psr/container' )->name( [ '*.php', 'LICENSE', 'composer.json' ] ),
		Finder::create()->files()->in( 'vendor/laravel/serializable-closure' )->name( [ '*.php', 'LICENSE', 'composer.json' ] ),
		Finder::create()->files()->in( 'vendor/php-di' )->name( [ '*.php', 'LICENSE', 'composer.json' ] ),
		Finder::create()->files()->in( 'vendor/twig/twig' )->name( [ '*.php', 'LICENSE', 'composer.json' ] ),
	],
	'patchers' => [
		/**
		 * Replaces the Adapter string references with the prefixed versions.
		 *
		 * @param string $filePath The path of the current file.
		 * @param string $prefix   The prefix to be used.
		 * @param string $content  The content of the specific file.
		 *
		 * @return string The modified content.
		 */
		function( $file_path, $prefix, $content ) {
			if ( substr( $file_path, -46 ) !== 'vendor/php-di/php-di/src/Compiler/Template.php' ) {
				return $content;
			}
		},

		function ( $file_path, $prefix, $content ) {
			$is_file = (bool) preg_match( '/twig\/twig\/src\/Node\/ModuleNode\.php/', $file_path );

			if ( ! $is_file ) {
				return $content;
			}

			return preg_replace_callback(
				'/("use )([A-z\\\\]+;[\\\\n]*")/',
				fn( $matches ) => str_replace( '\\\\', '\\', "{$matches[1]}{$prefix}\\{$matches[2]}" ),
				$content
			);
		},
	],
];
