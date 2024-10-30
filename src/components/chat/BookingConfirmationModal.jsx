import React, { useState, useEffect } from 'react';
import { Modal } from 'react-onsenui';
import logoMarkBlue from '../img/logo_mark_blue.png';
import { fetchCreditCardsList, fetchTermsAndConditions } from '../../services/api';

const API_ENDPOINT = 'https://bookingtest.vision-c.co.jp/api/booking/create/';

// Success Alert Modal Component
const SuccessAlertModal = ({ isOpen, onClose }) => (
	<Modal isOpen={isOpen} onClose={onClose}>
		<div style={{
			backgroundColor: 'white',
			padding: '20px',
			borderRadius: '8px',
			textAlign: 'center',
			maxWidth: '80%',
			margin: '0 auto'
		}}>
			<div style={{
				fontSize: '20px',
				marginBottom: '20px',
				color: '#333'
			}}>
				予約を登録しました。
			</div>
			<button
				onClick={onClose}
				className="button button--cta"
				style={{
					padding: '12px 24px',
					backgroundColor: '#330002',
					color: 'white',
					borderRadius: '4px',
					border: 'none',
					width: '100%',
					fontSize: '16px'
				}}
			>
				閉じる
			</button>
		</div>
	</Modal>
);

const BookingConfirmationModal = ({ isOpen, onClose, bookingDetails }) => {
    const [creditCards, setCreditCards] = useState([]);
	const [selectedCard, setSelectedCard] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
    const [cancelPolicy, setCancelPolicy] = useState('');
	const [isPolicyLoading, setIsPolicyLoading] = useState(false);
	const [policyError, setPolicyError] = useState(null);
    const [isAgreedToTerms, setIsAgreedToTerms] = useState(false);
    const [bookingStatus, setBookingStatus] = useState(null);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    useEffect(() => {
		const loadCreditCards = async () => {
			if (isOpen) {
				setIsLoading(true);
				setError(null);
				try {
					const cards = await fetchCreditCardsList();
					console.log('Processed cards:', cards); // Debug log
					setCreditCards(cards);
					
					// Set initial selected card to default card if exists
					const defaultCard = cards.find(card => card.isDefault);
					if (defaultCard) {
						setSelectedCard(defaultCard.id);
					} else if (cards.length > 0) {
						setSelectedCard(cards[0].id);
					}
				} catch (err) {
					console.error('Error loading cards:', err);
					setError(err.message);
					setCreditCards([]);
				} finally {
					setIsLoading(false);
				}
			}
		};

		loadCreditCards();
	}, [isOpen]);

	const handleCardChange = (e) => {
		setSelectedCard(e.target.value);
	};

    useEffect(() => {
		const loadCancelPolicy = async () => {
			if (isOpen) {
				setIsPolicyLoading(true);
				setPolicyError(null);
				try {
					const policyText = await fetchTermsAndConditions();
					setCancelPolicy(policyText);
				} catch (err) {
					console.error('Error loading policy:', err);
					setPolicyError(err.message);
				} finally {
					setIsPolicyLoading(false);
				}
			}
		};

		loadCancelPolicy();
	}, [isOpen]);

	const handleAgreementChange = (e) => {
		setIsAgreedToTerms(e.target.checked);
	};

    const calculateEndTime = (startTime, durationMinutes) => {
		const [hours, minutes] = startTime.split(':').map(Number);
		let totalMinutes = hours * 60 + minutes + durationMinutes;
		
		const endHours = Math.floor(totalMinutes / 60);
		const endMinutes = totalMinutes % 60;
		
		return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00`;
	};

	const transformBookingData = () => {
		const startTime = bookingDetails.time?.time.split(':').slice(0, 2).join(':');
		const duration = bookingDetails.service?.duration.toString();
		
		return {
			address: bookingDetails.address?.address || '',
			booking_date: bookingDetails.date?.date || '',
			card: bookingDetails.creditCard?.id || selectedCard,
			customer: "1",
			end_time: calculateEndTime(startTime, parseInt(duration)),
			penalty: 0,
			service_duration: duration,
			service_menu_name: bookingDetails.service?.name || '',
			service_price: bookingDetails.service?.price.toString() || '',
			start_time: startTime,
			status: "unconfirmed",
			therapist: bookingDetails.therapist?.id.toString() || '',
			unread_flag: 1,
			user_id: "1"
		};
	};

	const submitBooking = async (bookingData) => {
		try {
			const response = await fetch(API_ENDPOINT, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(bookingData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || '予約の作成に失敗しました');
			}

			const data = await response.json();
			return data;
		} catch (error) {
			console.error('API Error:', error);
			throw error;
		}
	};

    const handleSuccessAlertClose = () => {
		setShowSuccessAlert(false);
        window.location.reload();
	};

	const handleConfirmBooking = async () => {
		try {
			setIsLoading(true);
			setError(null);
			setBookingStatus('processing');

			const bookingData = transformBookingData();
			console.log('Sending booking data:', bookingData);

			const response = await submitBooking(bookingData);
			console.log('Booking response:', response);

			if (response) {
				setBookingStatus('success');
				onClose(); // Close the booking confirmation modal
				setShowSuccessAlert(true); // Show success alert modal
			}
		} catch (error) {
			console.error('Booking confirmation error:', error);
			setError('予約の確定中にエラーが発生しました。もう一度お試しください。');
			setBookingStatus('error');
		} finally {
			setIsLoading(false);
		}
	};

	const renderCancellationPolicySection = () => (
		<div className="confirm customer" style={{ 
			marginBottom: '20px', 
			padding: '15px', 
			border: '1px solid #ddd', 
			borderRadius: '8px' 
		}}>
			<div className="policy-text" style={{ 
				marginBottom: '10px', 
				fontSize: '20px' 
			}}>
				予約登録するにはキャンセルポリシーに同意いただく必要がございます。
			</div>
			<div className="cancellation-policy-label" style={{ 
				fontWeight: 'bold', 
				marginBottom: '8px', 
				fontSize: '20px',
				textAlign: 'left' 
			}}>
				キャンセルポリシー
			</div>
			{isPolicyLoading ? (
				<div style={{ textAlign: 'center', padding: '10px' }}>
					ポリシーを読み込み中...
				</div>
			) : policyError ? (
				<div style={{ color: 'red', padding: '10px' }}>
					{policyError}
				</div>
			) : (
				<textarea
					className="cancellation-policy"
					readOnly
					value={cancelPolicy}
					style={{
						width: '100%',
						height: '150px',
						padding: '10px',
						marginBottom: '10px',
						border: '1px solid #ddd',
						borderRadius: '4px'
					}}
				/>
			)}
			<div className="cancel-agree-checkbox" style={{ 
				display: 'flex', 
				alignItems: 'center', 
				gap: '8px' 
			}}>
				<input 
					type="checkbox" 
					style={{ width: '20px', height: '20px' }}
					checked={isAgreedToTerms}
					onChange={handleAgreementChange}
					id="terms-agreement"
				/>
				<label htmlFor="terms-agreement">同意する</label>
			</div>
		</div>
	);

	const renderPaymentSection = () => (
		<div id="payment">
			<p style={{ textAlign: "left", fontSize: "20px" }}>
				決済を行うクレジットカードを選択してください。
			</p>
			
			{error ? (
				<div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>
			) : (
				<select
					className="input-datalist"
					modifier="material"
					value={selectedCard || ''}
					onChange={handleCardChange}
					disabled={isLoading}
					style={{
						width: '100%',
						padding: '8px',
						marginBottom: '15px',
						borderRadius: '4px',
						border: '1px solid #ddd'
					}}
				>
					<option value="">カードを選択してください</option>
					{creditCards.map(card => (
						<option key={card.id} value={card.id}>
							{card.display}
							{/* {card.isDefault ? ' (デフォルト)' : ''} */}
						</option>
					))}
				</select>
			)}
			
			{isLoading && (
				<div style={{ textAlign: 'center', marginBottom: '15px' }}>
					カード情報を読み込み中...
				</div>
			)}
			
			<div className="card-actions" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
				<button 
                    className="button button--cta"
                    style={{ padding: '12px', backgroundColor: '#330002', color: 'white', borderRadius: '4px' }}
                    disabled={isLoading}
				>
					カード登録/追加
				</button>
				<button 
                    className="button button--cta"
                    style={{ padding: '12px', backgroundColor: '#330002', color: 'white', borderRadius: '4px' }}
                    disabled={isLoading}
				>
					カード削除
				</button>
			</div>
		</div>
	);

    
    // Utility function to format date
    const formatDateToJapanese = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const [year, month, day] = dateStr.split('-');
            return `${year}年${parseInt(month)}月${parseInt(day)}日`;
        } catch (error) {
            console.error('Date formatting error:', error);
            return '-';
        }
    };

    // Utility function to format time
    const formatTime = (timeStr) => {
        if (!timeStr) return '-';
        try {
            // Split the time string and take only the first two parts (hours and minutes)
            const [hours, minutes] = timeStr.split(':');
            return `${hours}:${minutes}`;
        } catch (error) {
            console.error('Time formatting error:', error);
            return '-';
        }
    };

	return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <section style={{ 
                    backgroundColor: 'white',
                    maxHeight: '90vh', // Maximum height of 90% viewport height
                    display: 'flex',
                    flexDirection: 'column'
                }} className="customer body1">
                    <h1 className="G-font">サービス予約確認</h1>
                    
                    <div style={{ 
                        padding: "12px",
                        overflowY: 'auto',
                        WebkitOverflowScrolling: 'touch', // Enable smooth scrolling on iOS
                        flex: 1 
                    }}>
                        {/* Booking Details Card */}
                        <div className="booking-details-card" style={{
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            padding: '20px',
                            marginBottom: '24px',
                            border: '1px solid #e9ecef',
                            textAlign: 'left',
                            overflowY: 'auto',
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div className="booking-detail-item">
                                    <div style={{
                                        fontSize: '24px',
                                        color: '#6c757d',
                                        marginBottom: '4px',
                                        fontWeight: '700'
                                    }}>セラピスト</div>
                                    <div style={{
                                        fontSize: '24px',
                                        color: '#212529',
                                        fontWeight: '500'
                                    }}>{bookingDetails.therapist?.name || '-'}</div>
                                </div>

                                <div className="booking-detail-item">
                                    <div style={{
                                        fontSize: '24px',
                                        color: '#6c757d',
                                        marginBottom: '4px',
                                        fontWeight: '700'
                                    }}>サービス</div>
                                    <div style={{
                                        fontSize: '24px',
                                        color: '#212529',
                                        fontWeight: '500'
                                    }}>{bookingDetails.service?.name || '-'}</div>
                                </div>

                                <div className="booking-detail-item">
                                    <div style={{
                                        fontSize: '24px',
                                        color: '#6c757d',
                                        marginBottom: '4px',
                                        fontWeight: '700'
                                    }}>時間</div>
                                    <div style={{
                                        fontSize: '24px',
                                        color: '#212529',
                                        fontWeight: '500'
                                    }}>{bookingDetails.service?.duration || '-'} 分</div>
                                </div>

                                <div className="booking-detail-item">
                                    <div style={{
                                        fontSize: '24px',
                                        color: '#6c757d',
                                        marginBottom: '4px',
                                        fontWeight: '700'
                                    }}>価格</div>
                                    <div style={{
                                        fontSize: '24px',
                                        color: '#212529',
                                        fontWeight: '500'
                                    }}>¥ {bookingDetails.service?.price || '-'}</div>
                                </div>

                                <div className="booking-detail-item">
                                    <div style={{
                                        fontSize: '24px',
                                        color: '#6c757d',
                                        marginBottom: '4px',
                                        fontWeight: '700'
                                    }}>予約日</div>
                                    <div style={{
                                        fontSize: '24px',
                                        color: '#212529',
                                        fontWeight: '500'
                                    }}>{formatDateToJapanese(bookingDetails.date?.date)}</div>
                                </div>

                                <div className="booking-detail-item">
                                    <div style={{
                                        fontSize: '24px',
                                        color: '#6c757d',
                                        marginBottom: '4px',
                                        fontWeight: '700'
                                    }}>予約時間</div>
                                    <div style={{
                                        fontSize: '24px',
                                        color: '#212529',
                                        fontWeight: '500'
                                    }}>{formatTime(bookingDetails.time?.time)}</div>
                                </div>

                                <div className="booking-detail-item">
                                    <div style={{
                                        fontSize: '24px',
                                        color: '#6c757d',
                                        marginBottom: '4px',
                                        fontWeight: '700'
                                    }}>住所</div>
                                    <div style={{
                                        fontSize: '24px',
                                        color: '#212529',
                                        fontWeight: '500'
                                    }}>{bookingDetails.address?.address || '-'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Rest of the modal content remains unchanged */}
                        {renderPaymentSection()}

                        {/* Cancellation Policy section remains unchanged */}
                        {renderCancellationPolicySection()}

                        {/* Security section and rest of the content remains unchanged */}
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <img 
                                src={logoMarkBlue} 
                                alt="PAY.JP セキュリティロゴ" 
                                width="128" 
                                style={{ margin: '20px auto' }} 
                            />
                            <div className="body1">
                                <p style={{ fontSize: '20px', textAlign: 'left', marginBottom: '10px' }}>
                                    クレジットカード情報はPCI DCCに準拠した形で、安全に取り扱いが行われます。
                                </p>
                                <p style={{ fontSize: '20px', textAlign: 'left' }}>
                                    また、カード情報はPAY.JPサイト内でのみ保管されており、りらこい上ではカード情報を保持しておりません。
                                </p>
                            </div>
                        </div>

                        <div style={{ fontSize: "15px", marginBottom: '20px', textAlign: 'center' }}>
                            ※決済は施術完了後に行います。
                        </div>

                        {error && (
                            <div style={{ 
                                color: 'red', 
                                padding: '10px', 
                                marginBottom: '10px',
                                textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button 
                                className="button button--cta"
                                style={{ 
                                    padding: '12px', 
                                    backgroundColor: '#330002', 
                                    color: 'white', 
                                    borderRadius: '4px',
                                    opacity: isAgreedToTerms && !isLoading ? '1' : '0.5'
                                }}
                                disabled={!isAgreedToTerms || isLoading}
                                onClick={handleConfirmBooking}
                            >
                                {isLoading ? '処理中...' : '予約を確定する'}
                            </button>
                            <button 
                                className="button button--outline"
                                onClick={onClose}
                                style={{ padding: '12px', borderRadius: '4px' }}
                                disabled={isLoading}
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                </section>
            </Modal>

            <SuccessAlertModal
				isOpen={showSuccessAlert}
				onClose={handleSuccessAlertClose}
			/>
        </>
		

        
	);
};

export default BookingConfirmationModal;