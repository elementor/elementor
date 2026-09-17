<?php

declare( strict_types=1 );

use Isolated\Symfony\Component\Finder\Finder;

/** @var \Symfony\Component\Finder\Finder $finder */
$finder = Finder::class;

return [
	'prefix' => 'ElementorDeps',
	'finders' => [
		$finder::create()->files()->in( 'vendor/mixpanel/mixpanel-php/lib' )->name( '*.php' ),
		$finder::create()->files()->in( 'vendor/mixpanel/mixpanel-php' )->depth( 0 )->name( [ 'LICENSE', 'composer.json' ] ),
	],
];
