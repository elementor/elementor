<?php

namespace Elementor\Modules\AtomicWidgets;

use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\String_Prop_Type;
use Elementor\Modules\DynamicTags\Module as DynamicTags;

class Dynamic_Tags {

	public function register_hooks() {
		add_filter( 'elementor/editor/localize_settings', fn( $settings ) => $this->add_prop_types_dynamic_categories_config( $settings ) );
	}

	private function add_prop_types_dynamic_categories_config( array $settings ): array {
		$settings['atomicPropTypes'] = [
			Image_Prop_Type::get_key() => [
				'dynamic_categories' => [
					DynamicTags::IMAGE_CATEGORY,
				],
			],

			Number_Prop_Type::get_key() => [
				'dynamic_categories' => [
					DynamicTags::NUMBER_CATEGORY,
				],
			],

			String_Prop_Type::get_key() => [
				'dynamic_categories' => [
					DynamicTags::TEXT_CATEGORY,
				],
			],
		];

		return $settings;
	}
}
