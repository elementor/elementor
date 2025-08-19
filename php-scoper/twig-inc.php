<?php

declare( strict_types=1 );

use Isolated\Symfony\Component\Finder\Finder;

/** @var \Symfony\Component\Finder\Finder $finder */
$finder = Finder::class;

return [
	'prefix' => 'ElementorDeps',
	'finders' => [
		$finder::create()->files()->in( 'vendor/twig/twig' )->name( [ '*.php', 'LICENSE', 'composer.json' ] ),
		$finder::create()->files()->in( 'vendor/symfony/polyfill-php80' )->name( [ '*.php', 'LICENSE', 'composer.json' ] ),
		$finder::create()->files()->in( 'vendor/symfony/polyfill-php81' )->name( [ '*.php', 'LICENSE', 'composer.json' ] ),
		$finder::create()->files()->in( 'vendor/symfony/deprecation-contracts' )->name( [ '*.php', 'LICENSE', 'composer.json' ] ),
		$finder::create()->files()->in( 'vendor/symfony/polyfill-mbstring' )->name( [ '*.php', 'LICENSE', 'composer.json' ] ),
		$finder::create()->files()->in( 'vendor/symfony/polyfill-ctype' )->name( [ '*.php', 'LICENSE', 'composer.json' ] ),
	],
	'patchers' => [
		/**
		 * Twig has a class that generates a template class with a namespace that is not prefixed,
		 * so we have to prefix it manually.
		 */
		function ( $file_path, $prefix, $content ) {
			$is_template_class_generator = (bool) preg_match( '/twig\/twig\/src\/Node\/ModuleNode\.php/', $file_path );

			if ( ! $is_template_class_generator ) {
				return $content;
			}

			// Example: "use Twig\Environment;\n" will replaced with "use ElementorDeps\Twig\Environment;\n"
			return preg_replace_callback(
				'/("use )([A-z\\\\]+;[\\\\n]*")/',
				fn( $matches ) => str_replace( '\\\\', '\\', "{$matches[1]}{$prefix}\\{$matches[2]}" ),
				$content
			);
		},
		function ( $file_path, $prefix, $content ) {
			$is_capture_node_file = (bool) preg_match( '/twig\/twig\/src\/Node\/CaptureNode\.php/', $file_path );

			if ( ! $is_capture_node_file ) {
				return $content;
			}

			return preg_replace_callback(
				"/'\\\\\\\\Twig\\\\\\\\Extension\\\\\\\\CoreExtension::captureOutput\('/",
				fn() => "'{$prefix}\\\\Twig\\\\Extension\\\\CoreExtension::captureOutput('",
				$content
			);
		},
	],
];
