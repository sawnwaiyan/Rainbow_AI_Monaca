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

export const fetchDates = async () => {
	try {
		const response = await fetch(`${API_BASE_URL}/get_date_prompts/`);
		if (!response.ok) {
			throw new Error('Failed to fetch dates');
		}
		const data = await response.json();
		return data.date_prompts;
	} catch (error) {
		console.error('Error fetching dates:', error);
		return [];
	}
};

export const fetchTimeSlots = async (therapistId, date, serviceTime = 30) => {
	try {
		const queryParams = new URLSearchParams({
			therapist_id: therapistId,
			date: date,
			service_time: serviceTime
		});

		const response = await fetch(`${API_BASE_URL}/get_time_prompts/?${queryParams}`);
		if (!response.ok) {
			throw new Error('Failed to fetch time slots');
		}
		const data = await response.json();
		return data.time_prompts;
	} catch (error) {
		console.error('Error fetching time slots:', error);
		return [];
	}
};

export const fetchAddresses = async (customerId = '1') => {
	try {
		const queryParams = new URLSearchParams({
			customer_id: customerId
		});

		const response = await fetch(`${API_BASE_URL}/get_address_prompts/?${queryParams}`);
		if (!response.ok) {
			throw new Error('Failed to fetch addresses');
		}
		const data = await response.json();
		return data.address_prompts;
	} catch (error) {
		console.error('Error fetching addresses:', error);
		return [];
	}
};

export const fetchCreditCards = async (customerId = '1') => {
	try {
		const queryParams = new URLSearchParams({
			customer_id: customerId
		});

		const response = await fetch(`${API_BASE_URL}/get_credit_card_prompts/?${queryParams}`);
		if (!response.ok) {
			throw new Error('Failed to fetch credit cards');
		}
		const data = await response.json();
		return data.credit_card_prompts;
	} catch (error) {
		console.error('Error fetching credit cards:', error);
		return [];
	}
};