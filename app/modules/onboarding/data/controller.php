<?php
namespace Elementor\App\Modules\Onboarding\Data;

use Elementor\Data\V2\Base\Controller as Base_Controller;
use Elementor\App\Modules\Onboarding\Data\Endpoints\Update_Site_Name;
use Elementor\App\Modules\Onboarding\Data\Endpoints\Update_Site_Logo;
use Elementor\App\Modules\Onboarding\Data\Endpoints\Upload_Site_Logo;
use Elementor\App\Modules\Onboarding\Data\Endpoints\Activate_Hello_Theme;
use Elementor\App\Modules\Onboarding\Data\Endpoints\Upload_And_Install_Pro;
use Elementor\App\Modules\Onboarding\Data\Endpoints\Update_Onboarding_DB_Option;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Controller extends Base_Controller {

	public function get_name() {
		return 'onboarding';
	}

	public function register_endpoints() {
		$this->register_endpoint( new Update_Site_Name( $this ) );
		$this->register_endpoint( new Update_Site_Logo( $this ) );
		$this->register_endpoint( new Upload_Site_Logo( $this ) );
		$this->register_endpoint( new Activate_Hello_Theme( $this ) );
		$this->register_endpoint( new Upload_And_Install_Pro( $this ) );
		$this->register_endpoint( new Update_Onboarding_DB_Option( $this ) );
	}

	// Empty method implemented to neutralize index endpoint, since there is no need for one.
	protected function register_index_endpoint() {}

	public static function sanitize_input( $input ): string {
		return htmlspecialchars( stripslashes( trim( $input ) ) );
	}
}
