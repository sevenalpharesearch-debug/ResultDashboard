'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (id === 'resultdashboard' && password === 'Abc@1234') {
      sessionStorage.setItem('isLoggedIn', 'true');
      router.replace('/dashboard');
    } else {
      setError('Invalid ID or Password');
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .login-card {
          width: 430px;
          background: #ffffff;
          border-radius: 18px;
          padding: 44px 38px;
          box-shadow: 0 22px 45px rgba(0, 0, 0, 0.35);
        }

        .brand {
          text-align: center;
          margin-bottom: 32px;
        }

        .brand-icon {
          width: 62px;
          height: 62px;
          margin: 0 auto 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00c6ff, #0072ff);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 30px;
          font-weight: bold;
          box-shadow: 0 8px 18px rgba(0, 114, 255, 0.35);
        }

        .brand h1 {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: 1px;
          margin-bottom: 14px;
          margin-top: 0;
          background: linear-gradient(135deg, #0072ff, #00c6ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .brand h2 {
          font-size: 24px;
          color: #111827;
          margin-bottom: 10px;
          margin-top: 0;
        }

        .brand p {
          font-size: 15px;
          color: #5f6b7a;
          margin: 0;
        }

        .form-group {
          margin-bottom: 22px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          color: #333333;
          margin-bottom: 6px;
          font-weight: 500;
          text-align: left;
        }

        .input-box {
          display: flex;
          align-items: center;
          border: 1px solid #d5dce7;
          border-radius: 8px;
          background: #f4f7fb;
          overflow: hidden;
          transition: 0.3s ease;
        }

        .input-box:focus-within {
          border-color: #0072ff;
          box-shadow: 0 0 0 3px rgba(0, 114, 255, 0.12);
          background: #ffffff;
        }

        .input-box span {
          width: 48px;
          text-align: center;
          color: #6b7280;
          font-size: 18px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .input-box input {
          width: 100%;
          border: none;
          outline: none;
          padding: 15px 12px 15px 0;
          font-size: 15px;
          background: transparent;
          color: #111827;
        }

        .login-btn {
          width: 100%;
          padding: 15px;
          margin-top: 8px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #0072ff, #00c6ff);
          color: #ffffff;
          font-size: 17px;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 8px 18px rgba(0, 114, 255, 0.35);
          transition: 0.3s ease;
        }

        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0, 114, 255, 0.45);
        }

        .error-message {
          color: #ef4444;
          font-size: 14px;
          text-align: center;
          margin-bottom: 16px;
        }

        @media (max-width: 480px) {
          .login-card {
            width: 90%;
            padding: 34px 24px;
          }

          .brand h1 {
            font-size: 27px;
          }
        }
      `}} />

      <div className="login-wrapper">
        <div className="login-card">
          <div className="brand">
            <div className="brand-icon">R</div>
            <h1>Result Dashboard</h1>
            <h2>Welcome Back</h2>
            <p>Sign in to view and manage your results</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Login ID *</label>
              <div className="input-box">
                <span>
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </span>
                <input 
                  type="text" 
                  placeholder="Enter your Login ID" 
                  required 
                  value={id}
                  onChange={(e) => {
                    setId(e.target.value);
                    setError('');
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password *</label>
              <div className="input-box">
                <span>🔒</span>
                <input 
                  type="password" 
                  placeholder="Enter your password" 
                  required 
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-btn">Sign In</button>
          </form>
        </div>
      </div>
    </>
  );
}
