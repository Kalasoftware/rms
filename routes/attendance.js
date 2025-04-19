const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// GET attendance list
router.get('/', attendanceController.listAttendance);
// POST mark attendance
router.post('/mark', attendanceController.markAttendance);
// GET attendance PDF
router.get('/pdf', attendanceController.attendancePDF);

module.exports = router;
