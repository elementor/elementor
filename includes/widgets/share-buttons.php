<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @deprecated will be removed in version 3.24
 */
class Widget_Share_Buttons extends Widget_Base {

	private static $supported_networks = [
		'facebook',
		'x-twitter',
		'twitter',
		'linkedin',
		'pinterest',
		'threads',
		'reddit',
		'vk',
		'odnoklassniki',
		'tumblr',
		'digg',
		'skype',
		'stumbleupon',
		'mix',
		'telegram',
		'pocket',
		'xing',
		'whatsapp',
		'email',
		'print',
	];

	/**
	 * @deprecated will be removed in version 3.24
	 */
	public function get_name() {
		return 'share-buttons-dummy';
	}

	/**
	 * @deprecated will be removed in version 3.24
	 */
	public function get_title() {
		return 'share-buttons-dummy';
	}

	/**
	 * @deprecated will be removed in version 3.24
	 */
	public function show_in_panel(): bool {
		return false;
	}

	/**
	 * @deprecated will be removed in version 3.24
	 */
	public static function get_supported_networks(): array {
		return self::$supported_networks;
	}
}
