const { statusUpdateValidation } = require('./middleware/validation');
const express = require('express');
const request = require('supertest');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Mock route
app.patch('/test/:id/status', statusUpdateValidation, (req, res) => {
    res.json({ success: true });
});

async function runTests() {
    console.log("Testing Validation Rules...");

    const testCases = [
        { status: 'In-Progress', shouldPass: true },
        { status: 'In Progress', shouldPass: true },
        { status: 'Canceled', shouldPass: true },
        { status: 'Cancelled', shouldPass: true },
        { status: 'Pending', shouldPass: true },
        { status: 'Invalid', shouldPass: false },
        { status: '', shouldPass: false }
    ];

    for (const test of testCases) {
        try {
            const response = await request(app)
                .patch('/test/2/status')
                .send({ status: test.status });

            const passed = response.status === 200;
            if (passed === test.shouldPass) {
                console.log(`✅ Status "${test.status}": Passed correctly (Expected: ${test.shouldPass})`);
            } else {
                console.error(`❌ Status "${test.status}": FAILED (Expected: ${test.shouldPass}, Got: ${passed ? 'Pass' : 'Fail'})`);
                if (!passed) console.log("   Errors:", response.body.errors);
            }
        } catch (e) {
            console.error("Test Error:", e);
        }
    }
}

runTests();
