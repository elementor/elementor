<?php

namespace Elementor\Core\Abilities;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Abilities_Bootstrap {

	public function register_hooks(): void {
		add_action( 'wp_abilities_api_categories_init', [ $this, 'register_categories' ] );

		( new Get_Post_Content_Ability() )->register_hooks();
		( new Set_Post_Content_Ability() )->register_hooks();
		( new Delete_Post_Content_Ability() )->register_hooks();
		( new Append_Element_Ability() )->register_hooks();
		( new Append_Elements_Ability() )->register_hooks();
		( new Update_Element_Ability() )->register_hooks();
		( new Create_From_Template_Ability() )->register_hooks();
		( new Context_Ability(
			Plugin::$instance->kits_manager,
			Plugin::$instance->elements_manager,
			Plugin::$instance->breakpoints
		) )->register_hooks();
	}

	public function register_categories(): void {
		wp_register_ability_category( 'elementor', [
			'label'       => 'Elementor',
			'description' => 'Abilities for working with the Elementor page builder.',
		] );
	}
}
