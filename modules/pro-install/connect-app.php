<?php
namespace Elementor\Modules\ProInstall;

use Elementor\Modules\Ai\Connect\Ai as AiConnect;

class Connect_App extends AiConnect {

	public function get_pro_subscriptions() {
		return $this->ai_request(
			'POST',
			'test/pro-subscriptions',
			[
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			]
		);
	}

	public function get_pro_package_url( $sub_id ) {
		return $this->ai_request(
			'POST',
			'test/pro-package-url',
			[
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
				'sub_id' => $sub_id,
			]
		);
	}
}
