const express = require('express');
const router = express.Router();
const uuidv4 = require('uuid/v4');

jest.mock('uuid/v4', () => {
    return () => 'mock_uuid'
});


router.post('/:group/:service/:environment', ((req, res) => {
    res.status(201);
    res.json({
        ticket: uuidv4(),
        state: 'passed' //queued, rejected
    });
}));

module.exports = router;
