const API_BASE_URL = 'http://127.0.0.1:8000/api/prompts';  

const API_ENDPOINTS = {
	GET_PROMPTS: `${API_BASE_URL}/`,  // Updated endpoint
	SEND_MESSAGE: `${API_BASE_URL}/message/`,
	GET_THERAPISTS: `${API_BASE_URL}/therapist-prompts/`,
	GET_SERVICES: `${API_BASE_URL}/service-prompts/`,
	GET_DATES: `${API_BASE_URL}/date-prompts/`,
	GET_TIMES: `${API_BASE_URL}/time-prompts/`,
	GET_ADDRESSES: `${API_BASE_URL}/address-prompts/`,
	GET_CARDS: `${API_BASE_URL}/credit-card-prompts/`
};

class AIChatService {
	async getInitialPrompts() {
		try {
			const response = await fetch(API_ENDPOINTS.GET_PROMPTS);
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
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
			
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}

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
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
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
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			const data = await response.json();
			return data.service_prompts;
		} catch (error) {
			console.error('Error fetching services:', error);
			throw error;
		}
	}
}

export default new AIChatService();