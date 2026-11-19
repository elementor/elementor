<?php

namespace Elementor\Testing\Modules\CompositeWidgets\Fixtures;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Site_Definition_Fixture {
	const WIDGET_ID = 'site/promo-card';
	const GLOBAL_CLASS_ID = 'g-9f1d2e';

	/**
	 * A site widget as the site provider registers it: template format, with a global class reference.
	 */
	public static function definition( string $id = self::WIDGET_ID ): array {
		return [
			'id' => $id,
			'version' => 1,
			'title' => 'Promo card',
			'template' => [
				'elType' => 'e-flexbox',
				'part' => 'root',
				'settings' => [
					'classes' => [
						'$$type' => 'classes',
						'value' => [ self::GLOBAL_CLASS_ID ],
					],
				],
				'elements' => [
					[
						'elType' => 'widget',
						'widgetType' => 'e-heading',
						'part' => 'title',
					],
				],
			],
			'general' => [],
		];
	}
}
