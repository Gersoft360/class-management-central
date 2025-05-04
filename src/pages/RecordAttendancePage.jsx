
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { assignmentsAPI, coursesAPI, attendanceAPI, studentsAPI } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar as CalendarIcon, Loader2, Save } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '../context/AuthContext';

const RecordAttendancePage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [existingAttendance, setExistingAttendance] = useState(false);

  // Load teacher's courses
  useEffect(() => {
    const fetchTeacherCourses = async () => {
      if (!currentUser?.id) return;
      
      try {
        setLoading(true);
        const response = await assignmentsAPI.getByTeacher(currentUser.id);
        
        // Extract unique courses from assignments
        const uniqueCourses = Array.from(
          new Map(response.data.map(item => [item.curso_id, item])).values()
        );
        
        // Format courses for display
        setCourses(uniqueCourses.map(assignment => ({
          id: assignment.curso_id,
          name: `Curso ${assignment.curso_id}`, // In a real app, you'd have course names
        })));
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar los cursos',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherCourses();
  }, [currentUser?.id]);

  // Load subjects for selected course
  useEffect(() => {
    const fetchSubjectsForCourse = async () => {
      if (!selectedCourse || !currentUser?.id) return;
      
      try {
        setLoading(true);
        const response = await assignmentsAPI.getAll({
          curso_id: selectedCourse,
          docente_id: currentUser.id
        });
        
        // Format subjects for display
        setSubjects(response.data.map(assignment => ({
          id: assignment.materia_id,
          name: `Materia ${assignment.materia_id}`, // In a real app, you'd have subject names
        })));
        
        setSelectedSubject('');
      } catch (error) {
        console.error('Error fetching subjects:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar las materias',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectsForCourse();
  }, [selectedCourse, currentUser?.id]);

  // Load students for selected course
  useEffect(() => {
    const fetchStudentsForCourse = async () => {
      if (!selectedCourse) return;
      
      try {
        setLoading(true);
        const response = await studentsAPI.getByCourse(selectedCourse);
        setStudents(response.data);
        
        // Initialize attendance records
        const initialAttendance = {};
        response.data.forEach(student => {
          initialAttendance[student.id] = false;
        });
        setAttendanceRecords(initialAttendance);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar los estudiantes',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsForCourse();
  }, [selectedCourse]);

  // Check for existing attendance when course, subject and date are selected
  useEffect(() => {
    const checkExistingAttendance = async () => {
      if (!selectedCourse || !selectedSubject || !selectedDate) return;
      
      try {
        setLoading(true);
        // Format date for API query (YYYY-MM-DD)
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        
        const response = await attendanceAPI.getAll({
          materia_id: selectedSubject,
          fecha: formattedDate
        });
        
        if (response.data.length > 0) {
          setExistingAttendance(true);
          
          // Load existing attendance records
          const existingData = {};
          response.data.forEach(record => {
            existingData[record.estudiante_id] = record.presente;
          });
          setAttendanceRecords(existingData);
          
          toast({
            title: 'Registros encontrados',
            description: 'Se encontraron registros de asistencia para la fecha seleccionada',
          });
        } else {
          setExistingAttendance(false);
          
          // Reset attendance records
          const initialAttendance = {};
          students.forEach(student => {
            initialAttendance[student.id] = false;
          });
          setAttendanceRecords(initialAttendance);
        }
      } catch (error) {
        console.error('Error checking existing attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    checkExistingAttendance();
  }, [selectedCourse, selectedSubject, selectedDate]);

  const handleAttendanceChange = (studentId, isPresent) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: isPresent
    }));
  };

  const handleSelectAllAttendance = (value) => {
    const updatedRecords = {};
    students.forEach(student => {
      updatedRecords[student.id] = value;
    });
    setAttendanceRecords(updatedRecords);
  };

  const handleSaveAttendance = async () => {
    if (!selectedCourse || !selectedSubject || !selectedDate) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor selecciona curso, materia y fecha',
      });
      return;
    }

    if (students.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No hay estudiantes para registrar asistencia',
      });
      return;
    }

    try {
      setSavingAttendance(true);
      
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Prepare attendance records
      const attendanceData = Object.entries(attendanceRecords).map(([studentId, present]) => ({
        estudiante_id: studentId,
        materia_id: selectedSubject,
        fecha: formattedDate,
        presente: present
      }));
      
      // Use bulk create/update
      await attendanceAPI.bulkCreate(attendanceData);
      
      toast({
        title: 'Asistencia registrada',
        description: 'La asistencia ha sido registrada exitosamente',
      });
      
      setExistingAttendance(true);
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo guardar la asistencia',
      });
    } finally {
      setSavingAttendance(false);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Registrar Asistencia</h1>
        <p className="text-muted-foreground">
          Registra la asistencia de estudiantes por curso y materia
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecciona los parámetros</CardTitle>
          <CardDescription>
            Selecciona el curso, materia y fecha para registrar la asistencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Curso</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Materia</label>
              <Select 
                value={selectedSubject} 
                onValueChange={setSelectedSubject}
                disabled={!selectedCourse || loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar materia" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={loading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : <span>Seleccionar fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : selectedCourse && selectedSubject && selectedDate && students.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Lista de Estudiantes</CardTitle>
                <CardDescription>
                  {format(selectedDate, 'PPP')} - Total: {students.length} estudiantes
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleSelectAllAttendance(true)}
                  size="sm"
                >
                  Todos presentes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleSelectAllAttendance(false)}
                  size="sm"
                >
                  Todos ausentes
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="w-[100px] text-center">Presente</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.nombre}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={!!attendanceRecords[student.id]}
                            onCheckedChange={(checked) => 
                              handleAttendanceChange(student.id, !!checked)
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSaveAttendance}
                className="flex items-center gap-2"
                disabled={savingAttendance}
              >
                {savingAttendance ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {existingAttendance ? 'Actualizar Asistencia' : 'Guardar Asistencia'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : selectedCourse && selectedSubject && selectedDate ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay estudiantes registrados en este curso
        </div>
      ) : null}
    </div>
  );
};

export default RecordAttendancePage;
