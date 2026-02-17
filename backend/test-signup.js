const testSignup = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/student/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Student',
        email: 'test@example.com',
        password: 'password123',
        roll_number: 'TEST001',
        batch: '2024',
        academic_session: '2024-2025'
      })
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};

testSignup();
