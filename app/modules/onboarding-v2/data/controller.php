<?php

namespace Elementor\App\Modules\OnboardingV2\Data;

use Elementor\App\Modules\OnboardingV2\Data\Endpoints\User_Choices;
use Elementor\App\Modules\OnboardingV2\Data\Endpoints\User_Progress;
use Elementor\Data\V2\Base\Controller as Base_Controller;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Controller extends Base_Controller {

	public function get_name(): string {
		return 'onboarding-v2';
	}

	public function register_endpoints(): void {
		$this->register_endpoint( new User_Progress() );
		$this->register_endpoint( new User_Choices() );
	}
}
