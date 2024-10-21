import React, { useState, useRef, useEffect } from 'react';
import { Page, Toolbar, BottomToolbar } from 'react-onsenui';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import PromptButton from '../components/common/PromptButton';
import { fetchTherapists, fetchServices } from '../services/api';
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

	const handleServiceSelection = (service) => {
		localStorage.setItem('selectedService', JSON.stringify(service));
		setChildPrompts([]);
		addMessage({ type: 'user', text: `${service.name}を選択` });
		addMessage({ type: 'ai', text: `${service.name}が選択されました。次の手順に進んでください。` });
		// Here you can add logic to move to the next step in the booking process
		setBookingStep('');
		setCurrentPrompts(defaultPrompts);
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