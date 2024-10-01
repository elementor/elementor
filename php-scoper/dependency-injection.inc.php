<?php

declare( strict_types= 1 );

use Isolated\Symfony\Component\Finder\Finder;

return [
	'prefix' => 'ElementorDeps',
	'finders' => [
		Finder::create()->files()->in( 'vendor/psr/container' )->name( [ '*.php', 'LICENSE', 'composer.json' ] ),
		Finder::create()->files()->in( 'vendor/laravel/serializable-closure' )->name( [ '*.php', 'LICENSE', 'composer.json' ] ),
		Finder::create()->files()->in( 'vendor/php-di' )->name( [ '*.php', 'LICENSE', 'composer.json' ] ),
	],
	'exclude-files' => [
		'vendor/php-di/php-di/src/Compiler/Template.php',
	],
];
