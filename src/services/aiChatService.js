// src/services/aiChatService.js

const API_ENDPOINTS = {
	GET_PROMPTS: '/api/prompts/get_prompts/',
	SEND_MESSAGE: '/api/prompts/ai_chat_message/',
	GET_THERAPISTS: '/api/prompts/get_therapist_prompts/',
	GET_SERVICES: '/api/prompts/get_service_prompts/',
	GET_DATES: '/api/prompts/get_date_prompts/',
	GET_TIMES: '/api/prompts/get_time_prompts/',
	GET_ADDRESSES: '/api/prompts/get_address_prompts/',
	GET_CARDS: '/api/prompts/get_credit_card_prompts/'
};

class AIChatService {
	async getInitialPrompts() {
		try {
			const response = await fetch(API_ENDPOINTS.GET_PROMPTS);
			const data = await response.json();
			return data.prompts;
		} catch (error) {
			console.error('Error fetching initial prompts:', error);
			throw error;
		}
	}

	async sendMessage(message, currentState = 'initial', context = {}) {
		try {
			const response = await fetch(API_ENDPOINTS.SEND_MESSAGE, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					message,
					currentState,
					context
				}),
			});

			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error sending message:', error);
			throw error;
		}
	}

	async getTherapists() {
		try {
			const response = await fetch(API_ENDPOINTS.GET_THERAPISTS);
			const data = await response.json();
			return data.therapist_prompts;
		} catch (error) {
			console.error('Error fetching therapists:', error);
			throw error;
		}
	}

	async getServices() {
		try {
			const response = await fetch(API_ENDPOINTS.GET_SERVICES);
			const data = await response.json();
			return data.service_prompts;
		} catch (error) {
			console.error('Error fetching services:', error);
			throw error;
		}
	}

	// Add other API methods as needed
}

export default new AIChatService();