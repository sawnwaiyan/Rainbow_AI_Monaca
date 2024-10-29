import React from 'react';
import { Modal } from 'react-onsenui';

const BookingConfirmationModal = ({ isOpen, onClose, bookingDetails }) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<section style={{ padding: '16px', backgroundColor: 'white' }}>
				<h2 style={{ marginBottom: '16px' }}>予約確認</h2>
				
				<div style={{ marginBottom: '24px' }}>
					<p><strong>セラピスト:</strong> {bookingDetails.therapist?.name || '-'}</p>
					<p><strong>サービス:</strong> {bookingDetails.service?.name || '-'}</p>
					<p><strong>日付:</strong> {bookingDetails.date?.date || '-'}</p>
					<p><strong>時間:</strong> {bookingDetails.time?.time || '-'}</p>
					<p><strong>住所:</strong> {bookingDetails.address?.address || '-'}</p>
					<p><strong>支払方法:</strong> {bookingDetails.creditCard?.display || '-'}</p>
				</div>
				
				<div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
					<button 
						className="button button--outline"
						onClick={onClose}
						style={{ marginRight: '10px' }}
					>
						キャンセル
					</button>
					<button 
						className="button button--cta"
						onClick={() => {
							// Handle booking confirmation
							onClose();
						}}
					>
						予約を確定する
					</button>
				</div>
			</section>
		</Modal>
	);
};

export default BookingConfirmationModal;