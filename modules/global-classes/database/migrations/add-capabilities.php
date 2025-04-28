<?php

namespace Elementor\Modules\GlobalClasses\Database\Migrations;

use Elementor\Core\Database\Base_Migration;

class Add_Capabilities extends Base_Migration {
	const ACCESS_CLASS_MANAGER = 'elementor_access_class_manager';
	const UPDATE_CLASS = 'elementor_update_css_class';
	const REMOVE_CSS_CLASS = 'elementor_remove_css_class';
	const APPLY_CSS_CLASS = 'elementor_apply_css_class';

	public function up() {
		$capabilities = [
			self::ACCESS_CLASS_MANAGER      => [ 'administrator' ],
			self::UPDATE_CLASS              => [ 'administrator' ],
			self::REMOVE_CSS_CLASS          => [ 'administrator', 'editor', 'author', 'contributor', 'shop_manager' ],
			self::APPLY_CSS_CLASS           => [ 'administrator', 'editor', 'author', 'contributor', 'shop_manager' ],
		];

		foreach ( $capabilities as $capability => $roles ) {
			foreach ( $roles as $role_name ) {
				$role = get_role( $role_name );

				if ( $role instanceof \WP_Role ) {
					$role->add_cap( $capability );
				}
			}
		}
	}
}
