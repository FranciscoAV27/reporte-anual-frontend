// src/app/core/services/pdf.service.ts
import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReporteResponse } from '../../shared/models/reporte/reporte.model';
import { CursoImpartidoResponse } from '../../shared/models/reporte/s1/curso-impartido.model';
import { ProductoApoyoDocenteResponse } from '../../shared/models/reporte/s1/producto-apoyo-docente.model';
import { AsignaturaAfinidadResponse } from '../../shared/models/reporte/s1/asignatura-afinidad.model';
import { TutoriaResponse } from '../../shared/models/reporte/s2/tutoria.model';
import { DireccionTesisResponse } from '../../shared/models/reporte/s2/direccion-tesis.model';
import { ProyectoInvestigacionResponse } from '../../shared/models/reporte/s3/proyecto-investigacion.model';
import { IndicadorProyectoResponse } from '../../shared/models/reporte/s3/indicador-proyecto.model';
import { PublicacionResponse } from '../../shared/models/reporte/s3/publicacion.model';
import { ActividadDesarrolloResponse } from '../../shared/models/reporte/s3/actividad-desarrollo.model';
import { ActividadGestionResponse } from '../../shared/models/reporte/s4/actividad-gestion.model';
import { ActividadDifusionResponse } from '../../shared/models/reporte/s5/actividad-difusion.model';
import { DistribucionTiempoResponse } from '../../shared/models/reporte/s7/distribucion-tiempo.model';

export interface DatosPdf {
  reporte:       ReporteResponse;
  cursos:        CursoImpartidoResponse[];
  productos:     ProductoApoyoDocenteResponse[];
  asignaturas:   AsignaturaAfinidadResponse[];
  tutorias:      TutoriaResponse[];
  tesis:         DireccionTesisResponse[];
  proyectos:     ProyectoInvestigacionResponse[];
  indicadores:   IndicadorProyectoResponse[];
  publicaciones: PublicacionResponse[];
  desarrollo:    ActividadDesarrolloResponse[];
  gestion:       ActividadGestionResponse[];
  difusion:      ActividadDifusionResponse[];
  distribucion:  DistribucionTiempoResponse[];
}

@Injectable({ providedIn: 'root' })
export class PdfService {

  generarReporte(datos: DatosPdf): void {
    const doc  = new jsPDF('p', 'mm', 'letter');
    const pW   = doc.internal.pageSize.getWidth();
    const pH   = doc.internal.pageSize.getHeight();
    const ml   = 18;
    const mr   = 18;
    const cW   = pW - ml - mr;
    let   y    = ml;

    // ── Paleta ─────────────────────────────────────────────
    const grayBg:   [number,number,number] = [235,235,235];
    const black:    [number,number,number] = [0,0,0];
    const darkGray: [number,number,number] = [80,80,80];
    const lightGray:[number,number,number] = [200,200,200];

    // ── Sincronizar y después de cada autoTable ─────────────
    const syncY = (): void => {
      const last = (doc as any).lastAutoTable?.finalY;
      if (last !== undefined) y = last;
    };

    // ── Verificar espacio y saltar página si es necesario ───
    const ensureSpace = (needed: number): void => {
      if (y + needed > pH - ml - 10) {
        doc.addPage();
        y = ml;
      }
    };

    // ── Título de sección ───────────────────────────────────
    const sectionTitle = (title: string): void => {
      ensureSpace(16);
      y += 5;
      doc.setFillColor(...grayBg);
      doc.rect(ml, y, cW, 7, 'F');
      doc.setDrawColor(...lightGray);
      doc.rect(ml, y, cW, 7, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...black);
      doc.text(title, ml + 3, y + 5);
      y += 10;
    };

    // ── Título de subsección ────────────────────────────────
    const subsecTitle = (title: string): void => {
      ensureSpace(12);
      y += 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...darkGray);
      doc.text(title, ml, y + 4);
      y += 7;
    };

    // ── Leyenda ─────────────────────────────────────────────
    const legend = (text: string): void => {
      y += 1;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      const lines = doc.splitTextToSize(text, cW);
      const h     = lines.length * 3.5 + 2;
      ensureSpace(h);
      doc.text(lines, ml, y + 3);
      y += h + 2;
    };

    // ── Bloque de texto libre (una o dos columnas) ──────────
    const textBlock = (
      label1: string, text1: string,
      label2?: string, text2?: string
    ): void => {
      const labelH  = 5;
      const padding = 4;
      const minH    = 18;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      if (label2 !== undefined && text2 !== undefined) {
        const colW  = (cW - 6) / 2;
        const lines1 = doc.splitTextToSize(text1 || 'Sin información.', colW - padding * 2);
        const lines2 = doc.splitTextToSize(text2 || 'Sin información.', colW - padding * 2);
        const boxH   = Math.max(lines1.length * 4, lines2.length * 4, minH) + padding * 2;
        ensureSpace(labelH + boxH + 6);
        y += 4;

        // Etiquetas
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...darkGray);
        doc.text(label1.toUpperCase(), ml, y);
        doc.text(label2.toUpperCase(), ml + colW + 6, y);
        y += labelH;

        // Cajas
        doc.setDrawColor(...lightGray);
        doc.setLineWidth(0.3);
        doc.rect(ml, y, colW, boxH);
        doc.rect(ml + colW + 6, y, colW, boxH);

        // Textos
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...black);
        doc.text(lines1, ml + padding, y + padding + 1);
        doc.text(lines2, ml + colW + 6 + padding, y + padding + 1);

        y += boxH + 6;

      } else {
        const lines1 = doc.splitTextToSize(text1 || 'Sin información.', cW - padding * 2);
        const boxH   = Math.max(lines1.length * 4, minH) + padding * 2;
        ensureSpace(labelH + boxH + 6);
        y += 4;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...darkGray);
        doc.text(label1.toUpperCase(), ml, y);
        y += labelH;

        doc.setDrawColor(...lightGray);
        doc.setLineWidth(0.3);
        doc.rect(ml, y, cW, boxH);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...black);
        doc.text(lines1, ml + padding, y + padding + 1);

        y += boxH + 6;
      }
    };

    // ── Tabla estándar ──────────────────────────────────────
    const tabla = (
      head: string[][],
      body: (string|number)[][]
    ): void => {
      autoTable(doc, {
        startY: y,
        head,
        body: body.length > 0 ? body : [Array(head[0].length).fill('Sin registros')],
        margin: { left: ml, right: mr },
        styles: {
          fontSize: 8,
          cellPadding: { top: 2, right: 3, bottom: 2, left: 3 },
          lineColor: lightGray,
          lineWidth: 0.3,
          textColor: black,
          font: 'helvetica',
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: grayBg, textColor: black,
          fontStyle: 'bold', fontSize: 8,
          lineColor: lightGray, lineWidth: 0.3
        },
        alternateRowStyles: { fillColor: [250,250,250] },
        tableLineColor: lightGray,
        tableLineWidth: 0.3,
        didParseCell: (data) => {
          if (body.length === 0 && data.section === 'body') {
            data.cell.styles.halign    = 'center';
            data.cell.styles.textColor = [150,150,150] as [number,number,number];
            data.cell.styles.fontStyle = 'italic';
          }
        }
      });
      syncY(); // ← sincronizar y SIEMPRE después de autoTable
    };

    // ══════════════════════════════════════════════════════
    // ENCABEZADO
    // ══════════════════════════════════════════════════════
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...black);
    doc.text('Universidad del Papaloapan', pW / 2, y + 6, { align: 'center' });
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(
      `Informe Anual de Actividades. Octubre ${datos.reporte.anio - 1} a Septiembre ${datos.reporte.anio}.`,
      pW / 2, y + 5, { align: 'center' }
    );
    y += 9;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    //doc.text(`Profesor Investigador: ${datos.reporte.profesorNombre} ${datos.reporte.profesorApellido}`, ml, y + 5);
    doc.text(
        `Profesor Investigador: ${datos.reporte.profesorNombre} ${datos.reporte.profesorApellidos ?? ''}`.trim(),
        ml, y + 5
    );
    y += 9;

    doc.setDrawColor(...black);
    doc.setLineWidth(0.6);
    doc.line(ml, y, pW - mr, y);
    y += 5;

    // ══════════════════════════════════════════════════════
    // 1. DOCENCIA
    // ══════════════════════════════════════════════════════
    sectionTitle('1. Docencia');

    subsecTitle('1.1 Cursos impartidos');
    tabla(
      [['Núm', 'Carrera', 'Asignatura', 'Semestre', 'Ciclo escolar', 'Horas/sem', 'Núm. alumnos']],
      datos.cursos.map(c => [c.numeroCurso, c.carrera, c.asignatura, c.semestre, c.cicloEscolar, c.horasSemana, c.numAlumnos])
    );

    subsecTitle('1.2 Productos de las actividades de apoyo docente');
    tabla(
      [['Núm. de curso', 'Descripción de los productos', 'Enlace']],
      datos.productos.map(p => [p.numeroCurso, p.descripcion, p.enlace ?? '—'])
    );

    subsecTitle('1.3 Asignaturas de mayor afinidad curricular');
    tabla(
      [['Núm.', 'Carrera', 'Asignatura', 'Semestre']],
      datos.asignaturas.map(a => [a.numAsignatura, a.carrera, a.asignatura, a.semestre])
    );

    subsecTitle('1.4 Problemas y oportunidades en docencia');
    textBlock(
      'Oportunidades', datos.reporte.oportunidadesDocencia ?? '',
      'Problemas',     datos.reporte.problemasDocencia ?? ''
    );

    // ══════════════════════════════════════════════════════
    // 2. FORMACIÓN DE RECURSOS HUMANOS
    // ══════════════════════════════════════════════════════
    sectionTitle('2. Formación de Recursos Humanos');

    subsecTitle('2.1 Tutorías');
    tabla(
      [['Nombre del Estudiante', 'Carrera', 'Semestre', 'FR']],
      datos.tutorias.map(t => [t.nombreAlumno, t.carrera, t.semestre, t.fechaRegistro ?? '—'])
    );
    legend('FR = Fecha de registro de la tutoría (dd/mm/aa)');

    subsecTitle('2.2 Dirección de tesis');
    tabla(
      [['Título', 'Nombre del Estudiante', 'G', 'A%', 'FR', 'FTP', 'FTR']],
      datos.tesis.map(t => [
        t.titulo, t.nombreAlumno,
        t.grado === 'L' ? 'L' : 'M',
        `${t.avancePorcentaje}%`,
        t.fechaRegistro   ?? '—',
        t.fechaProgTerm   ?? '—',
        t.fechaReprogTerm ?? '—'
      ])
    );
    legend(
      'G = Grado a obtener: L (Licenciatura), M (Maestría)   ' +
      'A% = Porcentaje de avance   ' +
      'FR = Fecha de registro del tema   ' +
      'FTP = Fecha programada de terminación   ' +
      'FTR = Fecha reprogramada de terminación'
    );

    // ══════════════════════════════════════════════════════
    // 3. INVESTIGACIÓN
    // ══════════════════════════════════════════════════════
    sectionTitle('3. Investigación y/o Promoción al Desarrollo');

    subsecTitle('3.1 Proyectos de investigación');
    tabla(
      [['Núm', 'Título', 'R', 'FA', 'IA', 'FI', 'FT', 'FTR', 'AGP%']],
      datos.proyectos.map(p => [
        p.numProyecto, p.titulo,
        p.responsabilidad, p.faseAprobacion, p.instancia,
        p.fechaInicio      ?? '—',
        p.fechaTerminacion ?? '—',
        p.fechaReprog      ?? '—',
        `${p.avancePorcentaje ?? 0}%`
      ])
    );
    legend(
      'R = Responsabilidad: D (Director), C (Colaborador), O (otro)   ' +
      'FA = Fase de aprobación: PEU (Proyecto enviado a UNPA para su registro), PEE (Proyecto enviado a dependencia externa)   ' +
      'IA = Instancia: C (CONACYT), P (PROMEP), O (Otra)   ' +
      'FI = Fecha de inicio   FT = Fecha de terminación programada   ' +
      'FTR = Fecha de terminación reprogramada   ' +
      'AGP% = Porcentaje del avance global del proyecto a septiembre'
    );

    subsecTitle('Indicadores cuantitativos de avances obtenidos durante el periodo');
    if (datos.proyectos.length === 0) {
      legend('Sin proyectos registrados.');
    } else {
      datos.proyectos.forEach(p => {
        const inds = datos.indicadores.filter(i => i.numProyecto === p.numProyecto);
        subsecTitle(`Proyecto ${p.numProyecto}: ${p.titulo}`);
        tabla(
          [['Núm. indicador', 'Descripción']],
          inds.map(i => [i.numIndicador, i.descripcion])
        );
      });
    }

    subsecTitle('Publicación de artículos');
    tabla(
      [['Título', 'Revista', 'Fase', 'Año']],
      datos.publicaciones.map(p => [
        p.titulo, p.revista,
        p.fase === 'P' ? 'Publicado' : p.fase === 'A' ? 'Aceptado' : 'Revisión',
        p.anio
      ])
    );
    legend('Fase: P (Publicado), A (Aceptado), R (Revisión)');

    subsecTitle('3.2 Promoción al desarrollo');
    tabla(
      [['Núm.', 'Actividad', 'Institución solicitante', 'Horas req.', 'Producto']],
      datos.desarrollo.map(d => [
        d.numActividad, d.actividad,
        d.institucionSolicitante, d.horasRequeridas,
        d.producto ?? '—'
      ])
    );

    subsecTitle('3.3 Problemas y oportunidades en investigación');
    textBlock(
      'Oportunidades', datos.reporte.oportunidadesInvestigacion ?? '',
      'Problemas',     datos.reporte.problemasInvestigacion ?? ''
    );

    // ══════════════════════════════════════════════════════
    // 4. GESTIÓN ACADÉMICA
    // ══════════════════════════════════════════════════════
    sectionTitle('4. Gestión Académica');
    tabla(
      [['Nombre de la actividad / comisión / puesto', 'Período inicio', 'Período fin']],
      datos.gestion.map(g => [g.nombre, g.periodoInicio ?? '—', g.periodoFin ?? '—'])
    );

    // ══════════════════════════════════════════════════════
    // 5. DIFUSIÓN
    // ══════════════════════════════════════════════════════
    sectionTitle('5. Difusión');
    tabla(
      [['Nombre de la actividad', 'Período inicio', 'Período fin']],
      datos.difusion.map(d => [d.nombre, d.periodoInicio ?? '—', d.periodoFin ?? '—'])
    );

    // ══════════════════════════════════════════════════════
    // 6. COMENTARIOS GENERALES
    // ══════════════════════════════════════════════════════
    sectionTitle('6. Comentarios Generales');
    textBlock('Comentarios', datos.reporte.comentariosGenerales ?? '');

    // ══════════════════════════════════════════════════════
    // 7. DISTRIBUCIÓN DE TIEMPO
    // ══════════════════════════════════════════════════════
    sectionTitle('7. Distribución de Tiempo (horas promedio por semana)');

    const totalOi = datos.distribucion.reduce((s, f) => s + (f.horasCicloOi ?? 0), 0);
    const totalPv = datos.distribucion.reduce((s, f) => s + (f.horasCicloPv ?? 0), 0);
    const totalVe = datos.distribucion.reduce((s, f) => s + (f.horasVerano  ?? 0), 0);

    const distBody: (string|number)[][] = [
      ...datos.distribucion.map(f => [
        f.actividadAcademica,
        f.horasCicloOi ?? 0,
        f.horasCicloPv ?? 0,
        f.horasVerano  ?? 0
      ]),
      ['Suma', totalOi, totalPv, totalVe]
    ];

    autoTable(doc, {
      startY: y,
      head: [['Actividad Académica', 'Ciclo (oct–feb)', 'Ciclo (mar–jul)', 'Verano (jul–sep)']],
      body: distBody,
      margin: { left: ml, right: mr },
      columnStyles: {
        0: { cellWidth: cW * 0.52 },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' }
      },
      styles: {
        fontSize: 8, cellPadding: 2,
        lineColor: lightGray, lineWidth: 0.3,
        textColor: black, font: 'helvetica',
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: grayBg, textColor: black,
        fontStyle: 'bold', fontSize: 8
      },
      alternateRowStyles: { fillColor: [250,250,250] },
      didParseCell: (data) => {
        if (data.row.index === distBody.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [232,245,242] as [number,number,number];
          data.cell.styles.halign    = data.column.index === 0 ? 'left' : 'center';
        }
      }
    });
    syncY();

    // Fecha de entrega
    if (datos.reporte.enviadoEn) {
      const fecha = new Date(datos.reporte.enviadoEn)
        .toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
      ensureSpace(10);
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...black);
      doc.text(`Fecha de entrega: ${fecha}`, pW - mr, y, { align: 'right' });
    }

    // ── Números de página ───────────────────────────────────
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(`Página ${i} de ${totalPages}`, pW / 2, pH - 8, { align: 'center' });
    }

    doc.output('dataurlnewwindow');
  }
}