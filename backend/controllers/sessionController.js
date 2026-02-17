const pool = require('../config/db');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const createSession = async (req, res) => {
    try {
        const { course_id, duration_minutes } = req.body;
        const teacher_id = req.user.id;

        if (!duration_minutes || duration_minutes < 1) {
            return res.status(400).json({ message: 'Duration must be at least 1 minute' });
        }

        const course = await pool.query(
            'SELECT * FROM courses WHERE id = $1',
            [course_id]
        );

        if (course.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.rows[0].teacher_id !== teacher_id) {
            return res.status(403).json({ message: 'Not authorized to create session for this course' });
        }

        const now = new Date();
        const sessionDate = now.toISOString().split('T')[0];
        const sessionTime = now.toTimeString().split(' ')[0];

        const qrToken = `session_${course_id}_${uuidv4()}`;
        const qrCodeDataURL = await QRCode.toDataURL(qrToken);

        const result = await pool.query(
            'INSERT INTO sessions (course_id, session_date, session_time, duration_minutes, qr_code) VALUES ($1, $2::date, $3, $4, $5) RETURNING id, course_id, session_date::text as session_date, session_time, duration_minutes, qr_code, created_at',
            [course_id, sessionDate, sessionTime, duration_minutes, qrToken]
        );

        const session = result.rows[0];

        res.status(201).json({
            message: 'Session created successfully',
            session: {
                ...session,
                qr_code_image: qrCodeDataURL,
                valid_until: new Date(now.getTime() + duration_minutes * 60000).toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getCourseSessions = async (req, res) => {
    try {
        const { courseId } = req.params;

        const result = await pool.query(
            'SELECT id, course_id, session_date::text as session_date, session_time, duration_minutes, qr_code, created_at FROM sessions WHERE course_id = $1 ORDER BY session_date DESC, session_time DESC',
            [courseId]
        );

        res.json({
            sessions: result.rows
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getSessionById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT s.id, s.course_id, s.session_date::text as session_date, s.session_time, s.duration_minutes, s.qr_code, s.created_at, c.course_name, c.course_code FROM sessions s JOIN courses c ON s.course_id = c.id WHERE s.id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const session = result.rows[0];
        const qrCodeDataURL = await QRCode.toDataURL(session.qr_code);
        const durationMin = session.duration_minutes != null ? Number(session.duration_minutes) : 60;
        const createdAt = new Date(session.created_at);
        const validUntilDate = new Date(createdAt.getTime() + durationMin * 60000);
        const validUntil = validUntilDate.toISOString();
        const secondsRemaining = Math.max(0, Math.floor((validUntilDate.getTime() - Date.now()) / 1000));

        res.json({
            session: {
                ...session,
                qr_code_image: qrCodeDataURL,
                valid_until: validUntil,
                seconds_remaining: secondsRemaining
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateSession = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher_id = req.user.id;
        const { session_date, session_time, duration_minutes } = req.body;

        const session = await pool.query(
            'SELECT s.*, c.teacher_id FROM sessions s JOIN courses c ON s.course_id = c.id WHERE s.id = $1',
            [id]
        );

        if (session.rows.length === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }

        if (session.rows[0].teacher_id !== teacher_id) {
            return res.status(403).json({ message: 'Not authorized to update this session' });
        }

        const result = await pool.query(
            'UPDATE sessions SET session_date = $1::date, session_time = $2, duration_minutes = $3 WHERE id = $4 RETURNING id, course_id, session_date::text as session_date, session_time, duration_minutes, qr_code, created_at',
            [session_date, session_time, duration_minutes || null, id]
        );

        res.json({
            message: 'Session updated successfully',
            session: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteSession = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher_id = req.user.id;

        const session = await pool.query(
            'SELECT s.*, c.teacher_id FROM sessions s JOIN courses c ON s.course_id = c.id WHERE s.id = $1',
            [id]
        );

        if (session.rows.length === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }

        if (session.rows[0].teacher_id !== teacher_id) {
            return res.status(403).json({ message: 'Not authorized to delete this session' });
        }

        await pool.query('DELETE FROM sessions WHERE id = $1', [id]);

        res.json({
            message: 'Session deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getActiveSessions = async (req, res) => {
    try {
        const student_id = req.user.id;

        const result = await pool.query(
            `SELECT s.id, s.course_id, s.session_date::text as session_date, 
                    s.session_time, s.duration_minutes, s.qr_code, s.created_at,
                    c.course_name, c.course_code, c.semester, c.batch,
                    t.name as teacher_name,
                    EXTRACT(EPOCH FROM (s.created_at + (s.duration_minutes || ' minutes')::INTERVAL - NOW())) as seconds_remaining,
                    EXISTS(SELECT 1 FROM attendance a WHERE a.session_id = s.id AND a.student_id = $1) as already_marked
             FROM sessions s
             JOIN courses c ON s.course_id = c.id
             JOIN teachers t ON c.teacher_id = t.id
             JOIN enrollments e ON c.id = e.course_id
             WHERE e.student_id = $1
               AND s.created_at + (s.duration_minutes || ' minutes')::INTERVAL > NOW()
             ORDER BY s.created_at DESC`,
            [student_id]
        );

        res.json({
            sessions: result.rows.map(session => ({
                ...session,
                is_active: session.seconds_remaining > 0,
                valid_until: new Date(Date.now() + session.duration_minutes * 60000).toISOString()
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createSession,
    getCourseSessions,
    getSessionById,
    updateSession,
    deleteSession,
    getActiveSessions
};

