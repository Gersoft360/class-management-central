
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { reportsAPI, coursesAPI, studentsAPI } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';

const ReportsPage = () => {
  const { currentUser, isAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [reportType, setReportType] = useState('grades'); // 'grades' or 'attendance'
  const [reportScope, setReportScope] = useState('course'); // 'course' or 'student'
  
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTrimester, setSelectedTrimester] = useState('1');
  const [selectedFormat, setSelectedFormat] = useState('pdf');

  // These would typically come from API calls
  const courses = [
    { id: '1', label: '1° A - Primaria' },
    { id: '2', label: '2° B - Primaria' },
    { id: '3', label: '3° A - Primaria' },
  ];

  const students = [
    { id: '1', name: 'Ana García' },
    { id: '2', name: 'Carlos López' },
    { id: '3', name: 'María Rodríguez' },
  ];

  const subjects = [
    { id: '1', name: 'Matemáticas' },
    { id: '2', name: 'Lengua' },
    { id: '3', name: 'Ciencias Naturales' },
  ];

  const trimesters = [
    { id: '1', name: 'Primer Trimestre' },
    { id: '2', name: 'Segundo Trimestre' },
    { id: '3', name: 'Tercer Trimestre' },
  ];

  const downloadFile = (data, fileName) => {
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleGenerateReport = async () => {
    if (reportScope === 'course' && !selectedCourse) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor selecciona un curso',
      });
      return;
    }

    if (reportScope === 'student' && !selectedStudent) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor selecciona un estudiante',
      });
      return;
    }

    setLoading(true);
    try {
      let response;
      const params = { format: selectedFormat };
      if (selectedTrimester) params.trimestre = selectedTrimester;
      if (selectedSubject) params.materia_id = selectedSubject;
      if (currentUser.id) params.docente_id = currentUser.id;

      if (reportScope === 'course') {
        if (reportType === 'grades') {
          response = await reportsAPI.getCourseGrades(selectedCourse, params);
        } else {
          response = await reportsAPI.getCourseAttendance(selectedCourse, params);
        }
      } else {
        if (reportType === 'grades') {
          response = await reportsAPI.getStudentGrades(selectedStudent, params);
        } else {
          response = await reportsAPI.getStudentAttendance(selectedStudent, params);
        }
      }

      const fileNamePrefix = reportType === 'grades' ? 'notas' : 'asistencias';
      const fileNameSuffix = reportScope === 'course' ? `curso_${selectedCourse}` : `estudiante_${selectedStudent}`;
      const fileName = `${fileNamePrefix}_${fileNameSuffix}.${selectedFormat}`;

      downloadFile(response.data, fileName);

      toast({
        title: 'Reporte generado',
        description: 'El reporte ha sido descargado exitosamente',
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo generar el reporte',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Reportes</h1>
        <p className="text-muted-foreground">
          Genera y descarga reportes de notas y asistencias
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart size={20} />
              <span>Generador de Reportes</span>
            </CardTitle>
            <CardDescription>
              Configura los parámetros para generar el reporte deseado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="grades" onValueChange={setReportType} className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="grades">Notas</TabsTrigger>
                <TabsTrigger value="attendance">Asistencias</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Seleccionar vista</Label>
                <Tabs defaultValue="course" onValueChange={setReportScope} className="w-full">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="course">Por Curso</TabsTrigger>
                    <TabsTrigger value="student">Por Estudiante</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {reportScope === 'course' ? (
                <div className="space-y-2">
                  <Label htmlFor="course">Curso</Label>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger id="course">
                      <SelectValue placeholder="Seleccionar curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="student">Estudiante</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger id="student">
                      <SelectValue placeholder="Seleccionar estudiante" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {reportType === 'grades' && (
                <div className="space-y-2">
                  <Label htmlFor="trimester">Trimestre</Label>
                  <Select value={selectedTrimester} onValueChange={setSelectedTrimester}>
                    <SelectTrigger id="trimester">
                      <SelectValue placeholder="Seleccionar trimestre" />
                    </SelectTrigger>
                    <SelectContent>
                      {trimesters.map((trimester) => (
                        <SelectItem key={trimester.id} value={trimester.id}>
                          {trimester.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {!isAdmin() && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Materia</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Seleccionar materia" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="format">Formato</Label>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger id="format">
                    <SelectValue placeholder="Seleccionar formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGenerateReport} 
                className="w-full flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Descargar Reporte
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Frecuentes</CardTitle>
              <CardDescription>Accede rápidamente a reportes comunes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full flex justify-start gap-2">
                  <FileSpreadsheet size={16} />
                  <span>Lista de asistencia mensual</span>
                </Button>
                <Button variant="outline" className="w-full flex justify-start gap-2">
                  <FileText size={16} />
                  <span>Boletín de calificaciones</span>
                </Button>
                {isAdmin() && (
                  <Button variant="outline" className="w-full flex justify-start gap-2">
                    <BarChart size={16} />
                    <span>Estadísticas generales</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ayuda</CardTitle>
              <CardDescription>Información sobre los reportes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-4">
                <div>
                  <h3 className="font-semibold">Reportes de Notas</h3>
                  <p className="text-muted-foreground">Los reportes de notas incluyen todas las calificaciones del período seleccionado, organizadas por materia.</p>
                </div>
                <div>
                  <h3 className="font-semibold">Reportes de Asistencia</h3>
                  <p className="text-muted-foreground">Los reportes de asistencia muestran un resumen de la asistencia y ausencias en el período seleccionado.</p>
                </div>
                <div>
                  <h3 className="font-semibold">Formatos</h3>
                  <p className="text-muted-foreground">
                    <strong>PDF:</strong> Ideal para imprimir o compartir.<br />
                    <strong>Excel:</strong> Útil para análisis adicionales.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
