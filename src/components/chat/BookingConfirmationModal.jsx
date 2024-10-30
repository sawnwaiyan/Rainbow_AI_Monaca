import React from 'react';
import { Modal } from 'react-onsenui';
import logoMarkBlue from '../img/logo_mark_blue.png';

const BookingConfirmationModal = ({ isOpen, onClose, bookingDetails }) => {
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
								}}>{bookingDetails.service?.duration || '-'}</div>
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
								}}>{bookingDetails.service?.price || '-'}</div>
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
					<div id="payment">
						<p style={{ textAlign: "left", fontSize: "20px" }}>決済を行うクレジットカードを選択してください。</p>
						<select
							className="input-datalist"
							modifier="material"
							value={bookingDetails.creditCard?.id || ''}
							style={{
								width: '100%',
								padding: '8px',
								marginBottom: '15px',
								borderRadius: '4px',
								border: '1px solid #ddd'
							}}
						>
							<option value={bookingDetails.creditCard?.id}>
								{bookingDetails.creditCard?.display || 'カードを選択してください'}
							</option>
						</select>
						
						<div className="card-actions" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
							<button className="button button--outline" style={{ flex: 1, padding: '10px' }}>
								カード登録/追加
							</button>
							<button className="button button--outline" style={{ flex: 1, padding: '10px' }}>
								カード削除
							</button>
						</div>
					</div>

					{/* Cancellation Policy section remains unchanged */}
					<div className="confirm customer" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
						<div className="policy-text" style={{ marginBottom: '10px' }}>
							予約登録するにはキャンセルポリシーに同意いただく必要がございます。
						</div>
						<div className="cancellation-policy-label" style={{ fontWeight: 'bold', marginBottom: '8px' }}>
							キャンセルポリシー
						</div>
						<textarea
							className="cancellation-policy"
							readOnly
							style={{
								width: '100%',
								height: '150px',
								padding: '10px',
								marginBottom: '10px',
								border: '1px solid #ddd',
								borderRadius: '4px'
							}}
						></textarea>
						<div className="cancel-agree-checkbox" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
							<input type="checkbox" style={{ width: '20px', height: '20px' }} />
							<span>同意する</span>
						</div>
					</div>

					{/* Security section and rest of the content remains unchanged */}
					<div style={{ textAlign: 'center', marginBottom: '20px' }}>
						<img 
							src={logoMarkBlue} 
							alt="PAY.JP セキュリティロゴ" 
							width="128" 
							style={{ margin: '20px auto' }} 
						/>
						<div className="body1">
							<p style={{ fontSize: '16px', textAlign: 'left', marginBottom: '10px' }}>
								クレジットカード情報はPCI DCCに準拠した形で、安全に取り扱いが行われます。
							</p>
							<p style={{ fontSize: '16px', textAlign: 'left' }}>
								また、カード情報はPAY.JPサイト内でのみ保管されており、りらこい上ではカード情報を保持しておりません。
							</p>
						</div>
					</div>

					<div style={{ fontSize: "15px", marginBottom: '20px', textAlign: 'center' }}>
						※決済は施術完了後に行います。
					</div>
					
					<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
						<button 
							className="button button--cta"
							style={{ padding: '12px', backgroundColor: '#330002', color: 'white', borderRadius: '4px' }}
							disabled={true}
						>
							予約を確定する
						</button>
						<button 
							className="button button--outline"
							onClick={onClose}
							style={{ padding: '12px', borderRadius: '4px' }}
						>
							キャンセル
						</button>
					</div>
				</div>
			</section>
		</Modal>
	);
};

export default BookingConfirmationModal;