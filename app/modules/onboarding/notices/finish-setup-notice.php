<?php
namespace Elementor\App\Modules\Onboarding\Notices;

use Elementor\App\Modules\Onboarding\Onboarding_Entry;
use Elementor\Core\Admin\Notices\Base_Notice;
use Elementor\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Finish_Setup_Notice extends Base_Notice {

	const NOTICE_ID = 'onboarding_finish_setup';

	public function should_print() {
		return Onboarding_Entry::should_show_partner_notice()
			&& ! User::is_user_notice_viewed( self::NOTICE_ID );
	}

	public function get_config() {
		return [
			'id' => self::NOTICE_ID,
			'type' => 'info',
			'title' => esc_html__( 'Finish setting up Elementor', 'elementor' ),
			'description' => esc_html__( 'Complete setup to get the most out of Elementor - connect your account, pick your starting point, and start building.', 'elementor' ),
			'dismissible' => true,
			'button' => [
				'text' => esc_html__( 'Run setup', 'elementor' ),
				'url' => Onboarding_Entry::get_url(),
				'type' => 'cta',
			],
		];
	}
}
