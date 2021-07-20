<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\V2\Base\Mock\Template;

use Elementor\Data\V2\Base\Exceptions\Error_404;
use Elementor\Data\V2\Base\Exceptions\Error_500;
use Elementor\Data\V2\Base\Exceptions\Data_Exception;

class ControllerGetItemsException extends Controller {

	/**
	 * @inheritDoc
	 * @throws \Exception
	 */
	public function get_items( $request ) {
		switch ( $request->get_param( 'error' ) ) {
			case 404:
				throw new Error_404();
			case 500:
				throw new Error_500();
			case 501:
				throw new Data_Exception();

			case 'mysqli':
				throw new \mysqli_sql_exception();

			default:
				throw new \Exception( 'default' );
		}
	}
}
