import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle } from 'lucide-react';
import styles from './Contact.module.css';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.name && form.email && form.message) {
      // Simulate API submit
      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className={`${styles.contactWrapper} container animate-fade-in`}>
      <div className={styles.headerCentered}>
        <h1 className={styles.title}>Contact Us</h1>
        <p className={styles.subtitle}>We'd love to hear from you. Get in touch with our team for questions, feedback, or support.</p>
      </div>

      <div className={styles.gridContainer}>
        {/* Contact Info Cards */}
        <div className={styles.infoColumn}>
          <div className={styles.infoCard}>
            <div className={styles.iconBox}>
              <Phone size={20} />
            </div>
            <div className={styles.infoDetails}>
              <h3>Call Us</h3>
              <p>+91 1800-456-7890</p>
              <span>Mon - Sun: 7:00 AM - 11:00 PM</span>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.iconBox}>
              <Mail size={20} />
            </div>
            <div className={styles.infoDetails}>
              <h3>Email Support</h3>
              <p>support@freshmart.com</p>
              <span>Typical response in under 2 hours</span>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.iconBox}>
              <MapPin size={20} />
            </div>
            <div className={styles.infoDetails}>
              <h3>Corporate Office</h3>
              <p>4th Floor, Tech Hub, Phase 2</p>
              <span>Gurugram, Haryana - 122001</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <MessageSquare size={20} className={styles.formIcon} />
            <h2>Send a Message</h2>
          </div>

          {submitted ? (
            <div className={styles.successMessage}>
              <CheckCircle size={44} className={styles.successIcon} />
              <h3>Message Sent Successfully!</h3>
              <p>Thank you for reaching out. A customer support representative will get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  required
                  rows="4"
                  className="form-control"
                  style={{ resize: 'none' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Send Message <Send size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
