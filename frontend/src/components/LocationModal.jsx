import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { MapPin, Navigation, X, Loader2 } from 'lucide-react';
import styles from './LocationModal.module.css';

const LocationModal = () => {
  const { 
    deliveryLocation, 
    setDeliveryLocation, 
    showLocationModal, 
    setShowLocationModal 
  } = useContext(AppContext);

  const [detecting, setDetecting] = useState(false);

  const mockAddresses = [
    { label: 'HSR Layout, Sector 3, Bengaluru', postcode: '560102' },
    { label: 'Connaught Place, Block E, New Delhi', postcode: '110001' },
    { label: 'Andheri West, Link Road, Mumbai', postcode: '400053' },
    { label: 'Salt Lake City, Sector V, Kolkata', postcode: '700091' }
  ];

  const handleDetectLocation = () => {
    setDetecting(true);
    // Simulate high-fidelity geolocator detection
    setTimeout(() => {
      setDetecting(false);
      const randomAddress = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
      setDeliveryLocation(`${randomAddress.label} - ${randomAddress.postcode}`);
      setShowLocationModal(false);
    }, 1500);
  };

  const handleSelectManual = (address) => {
    setDeliveryLocation(`${address.label} - ${address.postcode}`);
    setShowLocationModal(false);
  };

  if (!showLocationModal) return null;

  // Prevent closing on first launch without selecting location
  const isClosable = !!deliveryLocation;

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalCard} card animate-fade-in`}>
        {isClosable && (
          <button 
            className={styles.closeBtn} 
            onClick={() => setShowLocationModal(false)}
            title="Close"
          >
            <X size={18} />
          </button>
        )}

        <div className={styles.modalHeader}>
          <div className={styles.iconCircle}>
            <MapPin size={28} />
          </div>
          <h2>Select Delivery Location</h2>
          <p>Please share your location to check standard 12-minute grocery delivery in your local area.</p>
        </div>

        {/* 1. Detect Automatically Button */}
        <button 
          onClick={handleDetectLocation} 
          disabled={detecting}
          className={`${styles.detectBtn} btn btn-primary`}
        >
          {detecting ? (
            <>
              <Loader2 size={18} className={styles.spinner} />
              <span>Detecting Location...</span>
            </>
          ) : (
            <>
              <Navigation size={18} />
              <span>Detect My Location Automatically</span>
            </>
          )}
        </button>

        <div className={styles.orDivider}>
          <span>OR SELECT MANUALLY</span>
        </div>

        {/* 2. Manual Lists */}
        <div className={styles.addressList}>
          {mockAddresses.map((addr, index) => (
            <button 
              key={index} 
              onClick={() => handleSelectManual(addr)}
              className={styles.addressItemBtn}
            >
              <MapPin size={16} className={styles.itemIcon} />
              <div className={styles.itemText}>
                <strong>{addr.label}</strong>
                <span>PIN: {addr.postcode}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
