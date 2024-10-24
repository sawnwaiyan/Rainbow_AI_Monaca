// src/services/api.js

const API_BASE_URL = 'http://127.0.0.1:8000/chat';

/**
 * Send a message to the chat API
 * @param {string} message - The message to send
 * @param {string} messageType - The type of message (initial, therapist_selection, etc.)
 * @param {Object} context - Additional context data for the request
 * @returns {Promise<Object>} The API response
 */
export const sendMessage = async (message, messageType, context = {}) => {
	try {
		console.log('Sending message:', { message, messageType, context });

		const response = await fetch(`${API_BASE_URL}/send_message/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				message,
				type: messageType,
				context: {
					...context,
					customer_id: localStorage.getItem('customerId') || '1'
				}
			}),
		});

		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}

		const data = await response.json();
		console.log('API Response:', data);
		
		// Normalize the response data
		const normalizedData = {
			response: data.response || '',
			therapists: data.therapists || [],
			services: data.services || [],
			dates: data.dates || [],
			times: data.times || [],
			addresses: data.addresses || [],
			credit_cards: data.credit_cards || []
		};

		console.log('Normalized Response:', normalizedData);
		return normalizedData;
	} catch (error) {
		console.error('Error in sendMessage:', error);
		throw new Error('メッセージの送信に失敗しました。もう一度お試しください。');
	}
};

// Keep these endpoints for backward compatibility if needed
// But mark them as deprecated since we're using sendMessage for everything now
/** @deprecated Use sendMessage with type='initial' instead */
export const fetchTherapists = async () => {
	try {
		const response = await sendMessage('start_booking', 'initial');
		return response.therapists || [];
	} catch (error) {
		console.error('Error in fetchTherapists:', error);
		return [];
	}
};

/** @deprecated Use sendMessage with type='therapist_selection' instead */
export const fetchServices = async () => {
	try {
		const response = await sendMessage('', 'therapist_selection');
		return response.services || [];
	} catch (error) {
		console.error('Error in fetchServices:', error);
		return [];
	}
};

/** @deprecated Use sendMessage with type='service_selection' instead */
export const fetchDates = async () => {
	try {
		const response = await sendMessage('', 'service_selection');
		return response.dates || [];
	} catch (error) {
		console.error('Error in fetchDates:', error);
		return [];
	}
};

/** @deprecated Use sendMessage with type='date_selection' and appropriate context instead */
export const fetchTimeSlots = async (therapistId, date, serviceTime = 30) => {
	try {
		const response = await sendMessage(date, 'date_selection', {
			therapist_id: therapistId,
			date,
			service_time: serviceTime
		});
		return response.times || [];
	} catch (error) {
		console.error('Error in fetchTimeSlots:', error);
		return [];
	}
};

/** @deprecated Use sendMessage with type='time_selection' and appropriate context instead */
export const fetchAddresses = async (customerId = '1') => {
	try {
		const response = await sendMessage('', 'time_selection', {
			customer_id: customerId
		});
		return response.addresses || [];
	} catch (error) {
		console.error('Error in fetchAddresses:', error);
		return [];
	}
};

/** @deprecated Use sendMessage with type='address_selection' and appropriate context instead */
export const fetchCreditCards = async (customerId = '1') => {
	try {
		const response = await sendMessage('', 'address_selection', {
			customer_id: customerId
		});
		return response.credit_cards || [];
	} catch (error) {
		console.error('Error in fetchCreditCards:', error);
		return [];
	}
};