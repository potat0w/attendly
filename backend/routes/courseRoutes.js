const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/courseController');
const { authenticate, isTeacher, isStudent } = require('../middlewares/authMiddleware');

router.post('/', authenticate, isTeacher, createCourse);
router.get('/', authenticate, getAllCourses);
router.get('/teacher', authenticate, isTeacher, getTeacherCourses);
router.get('/teacher/students', authenticate, isTeacher, getTeacherStudents);
router.get('/enrolled', authenticate, isStudent, getStudentEnrolledCourses);
router.get('/:id', authenticate, getCourseById);
router.get('/:courseId/students', authenticate, getCourseStudents);
router.put('/:id', authenticate, isTeacher, updateCourse);
router.delete('/:id', authenticate, isTeacher, deleteCourse);
router.post('/:courseId/enroll', authenticate, isStudent, enrollCourse);

module.exports = router;

