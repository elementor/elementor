<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

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

	public function get_name() {
		return 'share-buttons';
	}

	public static function get_supported_networks() {
		return self::$supported_networks;
	}
}
