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
		( new Get_Element_Ability() )->register_hooks();
		( new Append_Element_Ability() )->register_hooks();
		( new Append_Elements_Ability() )->register_hooks();
		( new Update_Element_Ability() )->register_hooks();
		( new Delete_Element_Ability() )->register_hooks();
		( new Move_Element_Ability() )->register_hooks();
		( new Create_From_Template_Ability() )->register_hooks();
		( new Build_Page_Ability() )->register_hooks();
		( new Validate_Elements_Ability() )->register_hooks();
		( new Make_Widget_Ability() )->register_hooks();
		( new Make_Layout_Ability() )->register_hooks();
		( new Diff_Tree_Ability() )->register_hooks();
		( new Create_Post_Ability() )->register_hooks();
		( new Preview_Render_Ability() )->register_hooks();
		( new Force_Clear_Styles_Ability() )->register_hooks();
		( new Find_Media_Ability() )->register_hooks();
		( new Upload_Media_Ability() )->register_hooks();
		( new Get_Kit_Ability() )->register_hooks();
		( new Update_Kit_Ability() )->register_hooks();
		( new Edit_Page_Ability() )->register_hooks();
		( new Css_To_Props_Ability() )->register_hooks();
		( new Make_Style_Ability() )->register_hooks();
		( new Make_Page_Ability() )->register_hooks();
		( new Make_Section_Ability() )->register_hooks();
		( new Context_Ability(
			Plugin::$instance->kits_manager,
			Plugin::$instance->widgets_manager,
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
