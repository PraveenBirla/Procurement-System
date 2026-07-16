const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// Mock departments
app.get('/depts', (req, res) => {
    res.json([
        { id: 1, name: 'Engineering' },
        { id: 2, name: 'Finance' },
        { id: 3, name: 'Operations' },
        { id: 4, name: 'Procurement' },
        { id: 5, name: 'Human Resources' },
        { id: 6, name: 'Sales' }
    ]);
});

// Mock registration
app.post('/auth/register', (req, res) => {
    console.log("Registration requested:", req.body);
    setTimeout(() => {
        res.json({
            message: "User registered successfully",
            userId: 999
        });
    }, 1000);
});

// Mock login
app.post('/auth/login', (req, res) => {
    console.log("Login requested:", req.body);
    setTimeout(() => {
        if (req.body.password === 'WrongPassword1!') {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        
        // Dynamic role based on email for presentation demo
        const email = req.body.email.toLowerCase();
        let role = "EMPLOYEE";
        if (email.includes('manager')) role = "MANAGER";
        else if (email.includes('admin')) role = "ADMIN";
        else if (email.includes('supplier')) role = "SUPPLIER";
        
        res.json({
            data: {
                accessToken: "mock-jwt-token-12345",
                role: role
            }
        });
    }, 1000);
});

app.listen(8080, () => {
    console.log("Mock backend running on http://localhost:8080");
});
