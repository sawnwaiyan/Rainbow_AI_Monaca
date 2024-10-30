// src/components/common/Button.jsx
import React, { forwardRef } from 'react';
import { Button as OnsenButton, Icon } from 'react-onsenui';
import '../../styles/custom.css';

const Button = forwardRef(({ icon, label, onClick, modifier = '', primary = false, imageUrl }, ref) => {
	const buttonClass = `custom-button ${primary ? 'custom-button--primary' : ''}`;
	
	return (
		<OnsenButton 
			onClick={onClick} 
			modifier={`${modifier} ${buttonClass}`}
			ref={ref}
		>
			<div className="custom-button__content">
				{imageUrl ? (
					<div className="custom-button__image-container">
						<img 
							src={imageUrl}
							alt={label}
							className="custom-button__image"
							onError={(e) => {
								e.target.style.display = 'none';
								if (e.target.nextElementSibling) {
									e.target.nextElementSibling.style.display = 'inline-block';
								}
							}}
						/>
						{icon && (
							<Icon 
								icon={icon} 
								className="custom-button__icon" 
								style={{display: 'none'}}
							/>
						)}
					</div>
				) : (
					icon && <Icon icon={icon} className="custom-button__icon" />
				)}
				<span className="custom-button__label">{label}</span>
			</div>
		</OnsenButton>
	);
});

export default Button;