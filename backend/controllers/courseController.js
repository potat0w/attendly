const pool = require('../config/db');

const createCourse = async (req, res) => {
    try {
        const { course_name, course_code, semester, batch, academic_session } = req.body;
        const teacher_id = req.user.id;

        const existingCourse = await pool.query(
            'SELECT * FROM courses WHERE course_code = $1',
            [course_code]
        );

        if (existingCourse.rows.length > 0) {
            return res.status(400).json({ message: 'Course code already exists' });
        }

        const result = await pool.query(
            'INSERT INTO courses (course_name, course_code, teacher_id, semester, batch, academic_session) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [course_name, course_code, teacher_id, semester, batch, academic_session]
        );

        res.status(201).json({
            message: 'Course created successfully',
            course: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getAllCourses = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT c.*, t.name as teacher_name, t.department FROM courses c JOIN teachers t ON c.teacher_id = t.id ORDER BY c.created_at DESC'
        );

        res.json({
            courses: result.rows
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getTeacherCourses = async (req, res) => {
    try {
        const teacher_id = req.user.id;

        const result = await pool.query(
            'SELECT * FROM courses WHERE teacher_id = $1 ORDER BY created_at DESC',
            [teacher_id]
        );

        res.json({
            courses: result.rows
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT c.*, t.name as teacher_name, t.department FROM courses c JOIN teachers t ON c.teacher_id = t.id WHERE c.id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json({
            course: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher_id = req.user.id;
        const { course_name, course_code, semester, batch, academic_session } = req.body;

        const course = await pool.query(
            'SELECT * FROM courses WHERE id = $1',
            [id]
        );

        if (course.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.rows[0].teacher_id !== teacher_id) {
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }

        const result = await pool.query(
            'UPDATE courses SET course_name = $1, course_code = $2, semester = $3, batch = $4, academic_session = $5 WHERE id = $6 RETURNING *',
            [course_name, course_code, semester, batch, academic_session, id]
        );

        res.json({
            message: 'Course updated successfully',
            course: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher_id = req.user.id;

        const course = await pool.query(
            'SELECT * FROM courses WHERE id = $1',
            [id]
        );

        if (course.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.rows[0].teacher_id !== teacher_id) {
            return res.status(403).json({ message: 'Not authorized to delete this course' });
        }

        await pool.query('DELETE FROM courses WHERE id = $1', [id]);

        res.json({
            message: 'Course deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const enrollCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const student_id = req.user.id;

        const course = await pool.query(
            'SELECT * FROM courses WHERE id = $1',
            [courseId]
        );

        if (course.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const existingEnrollment = await pool.query(
            'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
            [student_id, courseId]
        );

        if (existingEnrollment.rows.length > 0) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        const result = await pool.query(
            'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING *',
            [student_id, courseId]
        );

        res.status(201).json({
            message: 'Successfully enrolled in course',
            enrollment: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getTeacherStudents = async (req, res) => {
    try {
        const teacher_id = req.user.id;

        const result = await pool.query(
            `SELECT DISTINCT s.id, s.name, s.email, s.roll_number, s.batch,
                    COUNT(DISTINCT e.course_id) as enrolled_courses,
                    STRING_AGG(DISTINCT c.course_name, ', ' ORDER BY c.course_name) as courses_list
             FROM students s
             JOIN enrollments e ON s.id = e.student_id
             JOIN courses c ON e.course_id = c.id
             WHERE c.teacher_id = $1
             GROUP BY s.id, s.name, s.email, s.roll_number, s.batch
             ORDER BY s.name`,
            [teacher_id]
        );

        res.json({
            students: result.rows
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getCourseStudents = async (req, res) => {
    try {
        const { courseId } = req.params;
        const user_role = req.user.role;
        const user_id = req.user.id;

        const course = await pool.query(
            'SELECT * FROM courses WHERE id = $1',
            [courseId]
        );

        if (course.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (user_role === 'teacher' && course.rows[0].teacher_id !== user_id) {
            return res.status(403).json({ message: 'Not authorized to view students for this course' });
        }

        const result = await pool.query(
            `SELECT s.id, s.name, s.email, s.roll_number, s.batch, e.enrolled_at,
                    COUNT(DISTINCT CASE WHEN a.id IS NOT NULL THEN ses.id END) as attended_sessions,
                    COUNT(DISTINCT ses.id) as total_sessions,
                    CASE 
                        WHEN COUNT(DISTINCT ses.id) > 0 
                        THEN ROUND(COUNT(DISTINCT CASE WHEN a.id IS NOT NULL THEN ses.id END)::numeric / COUNT(DISTINCT ses.id) * 100, 2)
                        ELSE 0 
                    END as attendance_percentage
             FROM students s
             JOIN enrollments e ON s.id = e.student_id
             LEFT JOIN sessions ses ON ses.course_id = e.course_id
             LEFT JOIN attendance a ON a.session_id = ses.id AND a.student_id = s.id
             WHERE e.course_id = $1
             GROUP BY s.id, s.name, s.email, s.roll_number, s.batch, e.enrolled_at
             ORDER BY s.name`,
            [courseId]
        );

        res.json({
            course: course.rows[0],
            students: result.rows
        });
    } catch (error) {
        console.error('Error in getCourseStudents:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getStudentEnrolledCourses = async (req, res) => {
    try {
        const student_id = req.user.id;

        const result = await pool.query(
            `SELECT c.*, t.name as teacher_name, t.department, e.enrolled_at,
                    COUNT(DISTINCT s.id) as total_sessions,
                    COUNT(DISTINCT a.id) as attended_sessions,
                    CASE 
                        WHEN COUNT(DISTINCT s.id) > 0 
                        THEN ROUND(COUNT(DISTINCT a.id)::numeric / COUNT(DISTINCT s.id) * 100, 2)
                        ELSE 0 
                    END as attendance_percentage
             FROM courses c
             JOIN enrollments e ON c.id = e.course_id
             JOIN teachers t ON c.teacher_id = t.id
             LEFT JOIN sessions s ON s.course_id = c.id
             LEFT JOIN attendance a ON a.session_id = s.id AND a.student_id = e.student_id
             WHERE e.student_id = $1
             GROUP BY c.id, t.name, t.department, e.enrolled_at
             ORDER BY c.course_name`,
            [student_id]
        );

        res.json({
            courses: result.rows
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createCourse,
    getAllCourses,
    getTeacherCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    enrollCourse,
    getTeacherStudents,
    getCourseStudents,
    getStudentEnrolledCourses
};

