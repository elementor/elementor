<?php

namespace Elementor\Core\Admin\EditorOneMenu\Interfaces;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Third_Party_Menu_Item {

	/**
	 * Get the ID of the menu item.
	 * The ID is used to identify the menu item in the database and in the code.
	 * It must be unique and must not contain any spaces or special characters.
	 * It must be lowercase and must not contain any spaces or special characters.
	 * It must be 50 characters or less.
	 *
	 * Example: 'elementor-plugin-name'
	 *
	 * @return string The ID of the menu item.
	 */
	public function get_id(): string;

	/**
	 * Get the label of the menu item.
	 * The label is the text that will be displayed in the menu.
	 * It must not be empty and must not overwrite any existing label.
	 * It must be 50 characters or less.
	 *
	 * Example: 'Plugin Name'
	 *
	 * @return string The label of the menu item.
	 */
	public function get_label(): string;

	/**
	 * Get the capability of the menu item.
	 * The capability is the capability that will be used to determine if the user has access to the menu item.
	 * It must be a valid capability.
	 *
	 * Example: 'manage_options'
	 *
	 * @return string The capability of the menu item.
	 */
	public function get_capability(): string;

	/**
	 * Get the target URL of the menu item.
	 * The target URL is the URL that will be opened when the menu item is clicked.
	 * It must be a valid URL.
	 *
	 * Example: 'https://example.com/wp-admin/admin.php?page=elementor-plugin-name'
	 *
	 * @return string The target URL of the menu item.
	 */
	public function get_target_url(): string;

	/**
	 * Get the owner of the menu item.
	 * The owner is the owner of the menu item.
	 * It must not be empty and must not contain any spaces or special characters.
	 * It must be 100 characters or less.
	 *
	 * Example: 'plugin-name'
	 *
	 * @return string The owner of the menu item.
	 */
	public function get_owner(): string;

	/**
	 * Get the visibility of the menu item.
	 * The visibility is the visibility of the menu item.
	 * It must be a boolean.
	 * In the base implementation, it will return true if the user has the capability of the menu item.
	 *
	 * Example: true
	 *
	 * @return bool The visibility of the menu item.
	 */
	public function is_visible(): bool;
}
