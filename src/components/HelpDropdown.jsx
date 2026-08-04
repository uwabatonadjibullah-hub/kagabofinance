import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, Phone, Mail, X } from 'lucide-react';

const HelpDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="help-dropdown-wrapper" ref={dropdownRef}>
      <button
        className="header-icon-btn help-btn"
        id="need-help-btn"
        aria-label="Need Help?"
        title="Need Help?"
        onClick={() => setIsOpen(!isOpen)}
      >
        <HelpCircle size={20} />
        <span className="help-btn-text">Need Help?</span>
      </button>

      {isOpen && (
        <div className="help-dropdown">
          <div className="help-dropdown-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={18} color="white" />
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'white' }}>Need Help?</h4>
            </div>
            <button className="help-close-btn" onClick={() => setIsOpen(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="help-dropdown-body">
            <p style={{ fontSize: '13px', color: 'white', marginBottom: '16px', lineHeight: 1.4 }}>
              If you have any questions or require support with the system, please reach out to us:
            </p>

            <div className="help-contact-list">
              <a href="tel:+250786408234" className="help-contact-item">
                <div className="help-contact-icon"><Phone size={16} /></div>
                <div>
                  <span className="help-contact-label">Tel 1</span>
                  <span className="help-contact-val">+250 786 408 234</span>
                </div>
              </a>

              <a href="tel:+250789530709" className="help-contact-item">
                <div className="help-contact-icon"><Phone size={16} /></div>
                <div>
                  <span className="help-contact-label">Tel 2</span>
                  <span className="help-contact-val">+250 789 530 709</span>
                </div>
              </a>

              <a href="mailto:nadjibullahu@gmail.com" className="help-contact-item">
                <div className="help-contact-icon"><Mail size={16} /></div>
                <div>
                  <span className="help-contact-label">Email</span>
                  <span className="help-contact-val">nadjibullahu@gmail.com</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpDropdown;
