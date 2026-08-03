import React from 'react';

const Login = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-primary-dark)' }}>
      <div className="glass-panel-dark" style={{ padding: '48px', width: '100%', maxWidth: '440px', color: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ color: 'var(--color-accent-lime)', marginBottom: '8px' }}>KAGABO</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>Sign in to your account</p>
        </div>
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Email Address</label>
            <input type="email" placeholder="you@example.com" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Password</label>
            <input type="password" placeholder="••••••••" />
          </div>
          <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
