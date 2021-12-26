<?php
namespace Opencart\Catalog\Model\Checkout;
class PaymentMethod extends \Opencart\System\Engine\Controller {
	public function getMethods(array $payment_address): array {
		$method_data = [];

		$this->load->model('setting/extension');

		$results = $this->model_setting_extension->getExtensionsByType('payment');

		$recurring = $this->cart->hasRecurring();

		foreach ($results as $result) {
			if ($this->config->get('payment_' . $result['code'] . '_status')) {
				$this->load->model('extension/' . $result['extension'] . '/payment/' . $result['code']);

				$payment_method = $this->{'model_extension_' . $result['extension'] . '_payment_' . $result['code']}->getMethod($payment_address);

				if ($payment_method) {
					if ($recurring) {
						if (property_exists($this->{'model_extension_' . $result['extension'] . '_payment_' . $result['code']}, 'recurringPayments') && $this->{'model_extension_' . $result['extension'] . '_payment_' . $result['code']}->recurringPayments()) {
							$method_data[$result['code']] = $payment_method;
						}
					} else {
						$method_data[$result['code']] = $payment_method;
					}
				}
			}
		}

		$sort_order = [];

		foreach ($method_data as $key => $value) {
			$sort_order[$key] = $value['sort_order'];
		}

		array_multisort($sort_order, SORT_ASC, $method_data);

		return $method_data;
	}
}