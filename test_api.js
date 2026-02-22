import axios from 'axios';

async function test() {
    try {
        console.log('Testing forgot-password...');
        const res = await axios.post('http://localhost:3000/api/auth/forgot-password', {
            email: 'saviocharles@gmail.com'
        });
        console.log('Success:', res.data);
    } catch (err) {
        if (err.response) {
            console.log('Error Response:', err.response.status, err.response.data);
        } else {
            console.log('Error Message:', err.message);
        }
    }
}

test();
