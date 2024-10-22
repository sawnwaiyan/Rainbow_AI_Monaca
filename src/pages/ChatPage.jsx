import React, { useState, useRef, useEffect } from 'react';
import { Page, Toolbar, BottomToolbar } from 'react-onsenui';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import PromptButton from '../components/common/PromptButton';
import { fetchTherapists, fetchServices, fetchDates, fetchTimeSlots } from '../services/api';
import '../styles/custom.css';

const defaultPrompts = [
	{ key: 'reservation', label: '予約', icon: 'fa-calendar' },
	{ key: 'reservationList', label: '予約リスト', icon: 'fa-list' },
	{ key: 'chat', label: 'チャット', icon: 'fa-comments' },
	{ key: 'profile', label: 'プロフィール', icon: 'fa-user' },
];

export default function ChatPage() {
	const [inputText, setInputText] = useState('');
	const [currentPrompts, setCurrentPrompts] = useState(defaultPrompts);
	const [childPrompts, setChildPrompts] = useState([]);
	const [messages, setMessages] = useState([]);
	const [therapists, setTherapists] = useState([]);
	const [services, setServices] = useState([]);
	const [dates, setDates] = useState([]);
	const [timeSlots, setTimeSlots] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [bookingStep, setBookingStep] = useState('');
	const inputRef = useRef(null);
	const chatRef = useRef(null);

	useEffect(() => {
		if (chatRef.current) {
			chatRef.current.scrollTop = chatRef.current.scrollHeight;
		}
	}, [messages]);

	const renderToolbar = () => (
		<Toolbar>
			<div className="center">りらこい　AI チャット</div>
		</Toolbar>
	);

	const handleSend = () => {
		if (inputText.trim()) {
			addMessage({ type: 'user', text: inputText });
			setInputText('');
			// Simulate AI response
			setTimeout(() => {
				addMessage({ type: 'ai', text: 'こんにちは！どのようなご用件ですか？' });
			}, 1000);
		}
	};

	const addMessage = (message) => {
		setMessages(prevMessages => [...prevMessages, message]);
	};

	const handlePromptClick = async (key) => {
		if (key === 'reservation') {
			setBookingStep('therapistSelection');
			setCurrentPrompts([{ key: 'therapistSelection', label: 'セラピスト選択', icon: 'fa-user-md' }]);
			addMessage({ type: 'user', text: '予約' });
			addMessage({ type: 'ai', text: 'セラピストを選択してください。' });
			
			setIsLoading(true);
			const fetchedTherapists = await fetchTherapists();
			setIsLoading(false);

			if (fetchedTherapists.length > 0) {
				setTherapists(fetchedTherapists);
				setChildPrompts(fetchedTherapists.map(therapist => ({
					key: `therapist-${therapist.id}`,
					label: therapist.name,
					onClick: () => handleTherapistSelection(therapist)
				})));
			} else {
				addMessage({ type: 'ai', text: 'セラピストの情報を取得できませんでした。もう一度お試しください。' });
			}
		}
	};

	const handleTherapistSelection = async (therapist) => {
		localStorage.setItem('selectedTherapist', JSON.stringify(therapist));
		setChildPrompts([]);
		addMessage({ type: 'user', text: `${therapist.name}を選択` });
		addMessage({ type: 'ai', text: `${therapist.name}が選択されました。サービスメニューを選択してください。` });
		
		setBookingStep('serviceSelection');
		setCurrentPrompts([{ key: 'serviceSelection', label: 'サービスメニュー選択', icon: 'fa-list-alt' }]);
		
		setIsLoading(true);
		const fetchedServices = await fetchServices();
		setIsLoading(false);

		if (fetchedServices.length > 0) {
			setServices(fetchedServices);
			setChildPrompts(fetchedServices.map(service => ({
				key: `service-${service.id}`,
				label: service.name,
				onClick: () => handleServiceSelection(service)
			})));
		} else {
			addMessage({ type: 'ai', text: 'サービスメニューの情報を取得できませんでした。もう一度お試しください。' });
		}
	};

	const handleServiceSelection = async (service) => {
		localStorage.setItem('selectedService', JSON.stringify(service));
		setChildPrompts([]);
		addMessage({ type: 'user', text: `${service.name}を選択` });
		addMessage({ type: 'ai', text: `${service.name}が選択されました。日付を選択してください。` });
		
		setBookingStep('dateSelection');
		setCurrentPrompts([{ key: 'dateSelection', label: '日付選択', icon: 'fa-calendar' }]);
		
		setIsLoading(true);
		const fetchedDates = await fetchDates();
		setIsLoading(false);

		if (fetchedDates.length > 0) {
			setDates(fetchedDates);
			setChildPrompts(fetchedDates.map(date => ({
				key: `date-${date.id}`,
				label: date.date,
				onClick: () => handleDateSelection(date)
			})));
		} else {
			addMessage({ type: 'ai', text: '日付の情報を取得できませんでした。もう一度お試しください。' });
		}
	};

	const handleDateSelection = async (date) => {
		localStorage.setItem('selectedDate', JSON.stringify(date));
		setChildPrompts([]);
		addMessage({ type: 'user', text: `${date.date}を選択` });
		addMessage({ type: 'ai', text: `${date.date}が選択されました。時間を選択してください。` });
		
		setBookingStep('timeSelection');
		setCurrentPrompts([{ key: 'timeSelection', label: '時間選択', icon: 'fa-clock' }]);
		
		// Get stored data
		const selectedTherapist = JSON.parse(localStorage.getItem('selectedTherapist'));
		const selectedService = JSON.parse(localStorage.getItem('selectedService'));
		
		if (!selectedTherapist || !selectedService) {
			addMessage({ type: 'ai', text: 'セラピストとサービスを先に選択してください。' });
			return;
		}
		
		setIsLoading(true);
		try {
			const fetchedTimeSlots = await fetchTimeSlots(
				selectedTherapist.id,
				date.date,
				selectedService.duration || 30
			);

			if (fetchedTimeSlots.length > 0) {
				setChildPrompts(fetchedTimeSlots.map(slot => ({
					key: `time-${slot.id}`,
					label: slot.time,
					onClick: () => handleTimeSelection(slot)
				})));
			} else {
				addMessage({ type: 'ai', text: '指定の日付の予約可能な時間がありません。別の日付を選択してください。' });
				// Reset to date selection if no time slots available
				setCurrentPrompts([{ key: 'dateSelection', label: '日付選択', icon: 'fa-calendar' }]);
			}
		} catch (error) {
			console.error('Error fetching time slots:', error);
			addMessage({ type: 'ai', text: '時間枠の取得中にエラーが発生しました。もう一度お試しください。' });
		} finally {
			setIsLoading(false);
		}
	};

	const handleTimeSelection = (timeSlot) => {
		localStorage.setItem('selectedTime', JSON.stringify(timeSlot));
		setChildPrompts([]);
		addMessage({ type: 'user', text: `${timeSlot.time}を選択` });
		addMessage({ type: 'ai', text: `${timeSlot.time}が選択されました。次の手順に進んでください。` });
		
		// Move to next step (address selection)
		setBookingStep('addressSelection');
		setCurrentPrompts([{ key: 'addressSelection', label: '住所選択', icon: 'fa-map-marker-alt' }]);
	};

	const renderBottomToolbar = () => (
		<BottomToolbar>
			<div style={{ display: 'flex', padding: '8px' }}>
				<Input
					value={inputText}
					onChange={(e) => setInputText(e.target.value)}
					modifier="underbar"
					placeholder="メッセージを入力"
					style={{ flex: 1, marginRight: '8px' }}
					ref={inputRef}
				/>
				<Button
					label="送信"
					onClick={handleSend}
					primary={true}
				/>
			</div>
		</BottomToolbar>
	);

	return (
		<Page renderToolbar={renderToolbar} renderBottomToolbar={renderBottomToolbar} className="custom-page">
			<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
				{/* Main Prompts */}
				<div style={{ 
					display: 'grid',
					gridTemplateColumns: 'repeat(2, 1fr)',
					gap: '12px',
					padding: '12px',
					borderBottom: '1px solid #e0e0e0'
				}}>
					{currentPrompts.map((prompt) => (
						<PromptButton
							key={prompt.key}
							icon={prompt.icon}
							label={prompt.label}
							onClick={() => handlePromptClick(prompt.key)}
						/>
					))}
				</div>

				{/* Child Prompts */}
				{childPrompts.length > 0 && (
					<div style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
						{isLoading ? (
							<p>Loading...</p>
						) : (
							childPrompts.map((prompt) => (
								<Button
									key={prompt.key}
									label={prompt.label}
									onClick={prompt.onClick}
									style={{ marginRight: '8px', marginBottom: '8px' }}
								/>
							))
						)}
					</div>
				)}

				{/* Chat Messages */}
				<div 
					ref={chatRef}
					style={{ 
						flex: 1,
						overflowY: 'auto',
						padding: '16px'
					}}
				>
					{messages.map((message, index) => (
						<div key={index} style={{
							marginBottom: '10px',
							textAlign: message.type === 'user' ? 'right' : 'left'
						}}>
							<span style={{
								background: message.type === 'user' ? '#007AFF' : '#E5E5EA',
								color: message.type === 'user' ? 'white' : 'black',
								padding: '8px 12px',
								borderRadius: '18px',
								display: 'inline-block',
								maxWidth: '70%'
							}}>
								{message.text}
							</span>
						</div>
					))}
				</div>
			</div>
		</Page>
	);
}