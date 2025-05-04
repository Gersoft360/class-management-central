
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors by redirecting to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication endpoints
export const authAPI = {
  login: (credentials) => api.post('/usuarios/login', credentials),
  getCurrentUser: () => api.get('/usuarios/me'),
};

// Users endpoints
export const usersAPI = {
  getAll: (params) => api.get('/usuarios', { params }),
  getById: (id) => api.get(`/usuarios/${id}`),
  create: (userData) => api.post('/usuarios', userData),
  update: (id, userData) => api.put(`/usuarios/${id}`, userData),
  changePassword: (id, passwordData) => api.patch(`/usuarios/${id}/password`, passwordData),
  delete: (id) => api.delete(`/usuarios/${id}`),
};

// Courses endpoints
export const coursesAPI = {
  getAll: (params) => api.get('/cursos', { params }),
  getById: (id) => api.get(`/cursos/${id}`),
  create: (courseData) => api.post('/cursos', courseData),
  update: (id, courseData) => api.put(`/cursos/${id}`, courseData),
  delete: (id) => api.delete(`/cursos/${id}`),
};

// Subjects endpoints
export const subjectsAPI = {
  getAll: (params) => api.get('/materias', { params }),
  getById: (id) => api.get(`/materias/${id}`),
  create: (subjectData) => api.post('/materias', subjectData),
  update: (id, subjectData) => api.put(`/materias/${id}`, subjectData),
  delete: (id) => api.delete(`/materias/${id}`),
};

// Students endpoints
export const studentsAPI = {
  getAll: (params) => api.get('/estudiantes', { params }),
  getById: (id) => api.get(`/estudiantes/${id}`),
  getByCourse: (courseId) => api.get(`/estudiantes?curso_id=${courseId}`),
  create: (studentData) => api.post('/estudiantes', studentData),
  update: (id, studentData) => api.put(`/estudiantes/${id}`, studentData),
  delete: (id) => api.delete(`/estudiantes/${id}`),
};

// Assignments endpoints
export const assignmentsAPI = {
  getAll: (params) => api.get('/asignaciones', { params }),
  getById: (id) => api.get(`/asignaciones/${id}`),
  getByTeacher: (teacherId) => api.get(`/asignaciones?docente_id=${teacherId}`),
  create: (assignmentData) => api.post('/asignaciones', assignmentData),
  update: (id, assignmentData) => api.put(`/asignaciones/${id}`, assignmentData),
  delete: (id) => api.delete(`/asignaciones/${id}`),
};

// Attendance endpoints
export const attendanceAPI = {
  getAll: (params) => api.get('/asistencias', { params }),
  getByStudent: (studentId) => api.get(`/asistencias?estudiante_id=${studentId}`),
  getBySubject: (subjectId) => api.get(`/asistencias?materia_id=${subjectId}`),
  create: (attendanceData) => api.post('/asistencias', attendanceData),
  bulkCreate: (attendanceList) => api.post('/asistencias/bulk', attendanceList),
  update: (id, attendanceData) => api.put(`/asistencias/${id}`, attendanceData),
  delete: (id) => api.delete(`/asistencias/${id}`),
};

// Grades endpoints
export const gradesAPI = {
  getAll: (params) => api.get('/calificaciones', { params }),
  getByStudent: (studentId) => api.get(`/calificaciones?estudiante_id=${studentId}`),
  getBySubject: (subjectId) => api.get(`/calificaciones?materia_id=${subjectId}`),
  create: (gradeData) => api.post('/calificaciones', gradeData),
  bulkCreate: (gradesList) => api.post('/calificaciones/bulk', gradesList),
  update: (id, gradeData) => api.put(`/calificaciones/${id}`, gradeData),
  delete: (id) => api.delete(`/calificaciones/${id}`),
};

// Reports endpoints
export const reportsAPI = {
  getCourseGrades: (courseId, params) => api.get(`/reportes/curso/${courseId}/notas`, { params, responseType: params.format === 'pdf' ? 'blob' : 'json' }),
  getCourseAttendance: (courseId, params) => api.get(`/reportes/curso/${courseId}/asistencias`, { params, responseType: params.format === 'pdf' ? 'blob' : 'json' }),
  getTeacherSubjectCourseGrades: (teacherId, subjectId, courseId, params) => 
    api.get(`/reportes/docente/${teacherId}/materia/${subjectId}/curso/${courseId}/notas`, { params, responseType: params.format === 'pdf' ? 'blob' : 'json' }),
  getTeacherSubjectCourseAttendance: (teacherId, subjectId, courseId, params) => 
    api.get(`/reportes/docente/${teacherId}/materia/${subjectId}/curso/${courseId}/asistencias`, { params, responseType: params.format === 'pdf' ? 'blob' : 'json' }),
  getStudentGrades: (studentId, params) => api.get(`/reportes/estudiante/${studentId}/notas`, { params, responseType: params.format === 'pdf' ? 'blob' : 'json' }),
  getStudentAttendance: (studentId, params) => api.get(`/reportes/estudiante/${studentId}/asistencias`, { params, responseType: params.format === 'pdf' ? 'blob' : 'json' }),
};

export default api;
