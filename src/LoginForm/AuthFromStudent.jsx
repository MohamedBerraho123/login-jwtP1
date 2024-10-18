import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AuthFromStudent.css';

const StudentComponent = ({ token, userId, codeUIR, firstName, lastName, handleLogout }) => {
  const [fetchedStudent, setFetchedStudent] = useState(null);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false); // To toggle the popup

  useEffect(() => {
    const getStudentByUserId = async () => {
      try {
        const response = await axios.get(`https://localhost:7125/api/Students/${userId}`);
        setFetchedStudent(response.data);
        setShowPopup(true); // Show popup when data is fetched
      } catch (err) {
        console.error('Error fetching student:', err);
        setError('Failed to fetch student');
      }
    };

    if (userId) {
      getStudentByUserId();
    }
  }, [userId]);

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div>
      {fetchedStudent && showPopup && (
        <div className="popup">
          <h3>Student Details</h3>
          <p>First Name: {fetchedStudent.firstName}</p>
          <p>Last Name: {fetchedStudent.lastName}</p>
          <p>User ID: {fetchedStudent.userId}</p>
          <p>Code UIR: {fetchedStudent.codeUIR}</p>

        </div>
      )}
      {error && <p className="error-message">{error}</p>}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

const AuthFromStudent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    if (token) {
      const { userId, codeUIR, firstName, lastName } = JSON.parse(localStorage.getItem('studentData')) || {};
      setStudentData({ userId, codeUIR, firstName, lastName });
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://localhost:7253/api/Account/registerAutomaticallyAndLoginAutomatically', {
        email,
        password,
      });

      const { token, userId, codeUIR, firstName, lastName } = response.data;
      setToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('studentData', JSON.stringify({ userId, codeUIR, firstName, lastName }));

      setStudentData({ userId, codeUIR, firstName, lastName });
    } catch (error) {
      setErrorMessage(error.response?.data?.Message || 'Registration/Login failed');
    }
  };

  const handleLogout = () => {
    setToken('');
    setStudentData(null);
    setEmail('');
    setPassword('');
    localStorage.removeItem('token');
    localStorage.removeItem('studentData');
  };

  return (
    <div className="container">
      {!token ? (
        <div>
          <h1>Login</h1>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">Login</button>
          </form>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
      ) : (
        studentData && (
          <StudentComponent
            token={token}
            userId={studentData.userId}
            codeUIR={studentData.codeUIR}
            firstName={studentData.firstName}
            lastName={studentData.lastName}
            handleLogout={handleLogout}
          />
        )
      )}
    </div>
  );
};

export default AuthFromStudent;
