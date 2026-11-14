<?php

namespace Elementor\Testing\Modules\CompositeWidgets\Fixtures;

use Elementor\Modules\CompositeWidgets\ClosedStructure\Closed_Structure;
use Elementor\Modules\CompositeWidgets\Definitions\Validation\Widget_Definition_Validator;
use Elementor\Modules\CompositeWidgets\Definitions\Widgets_Definitions_Registry;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Closed_Structure_Factory {
	const WIDGET_ID = 'test/closed-widget';

	public static function make(): Closed_Structure {
		$registry = new Widgets_Definitions_Registry( Widget_Definition_Validator::make() );

		if ( ! $registry->register( self::definition() ) ) {
			throw new \RuntimeException( 'The closed-structure test definition did not register.' );
		}

		return new Closed_Structure( $registry );
	}

	private static function definition(): array {
		return [
			'id' => self::WIDGET_ID,
			'version' => 1,
			'title' => 'Closed widget',
			'template' => [
				'elType' => 'e-flexbox',
				'part' => 'root',
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
