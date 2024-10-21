// src/services/api.js

const API_BASE_URL = 'http://127.0.0.1:8000/chat';

export const fetchTherapists = async () => {
	try {
		const response = await fetch(`${API_BASE_URL}/get_therapist_prompts/`);
		if (!response.ok) {
			throw new Error('Failed to fetch therapists');
		}
		const data = await response.json();
		return data.therapist_prompts;
	} catch (error) {
		console.error('Error fetching therapists:', error);
		return [];
	}
};

export const fetchServices = async () => {
	try {
		const response = await fetch(`${API_BASE_URL}/get_service_prompts/`);
		if (!response.ok) {
			throw new Error('Failed to fetch services');
		}
		const data = await response.json();
		return data.service_prompts;
	} catch (error) {
		console.error('Error fetching services:', error);
		return [];
	}
};