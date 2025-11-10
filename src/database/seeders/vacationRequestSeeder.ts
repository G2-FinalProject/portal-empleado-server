import { VacationRequest } from '../../models/vacationRequestModel.js';

export async function seedVacationRequests() {
  console.log('Seeding vacation requests...');

  const requests = [
    // ==========================================
    // SOLICITUDES APROBADAS - PASADAS
    // ==========================================
    
    // Employee ID 9 - Pablo Moreno (I+D, 21 días)
    {
      requester_id: 9,
      start_date: '2025-07-01',
      end_date: '2025-07-10',
      requested_days: 8, // 8 días laborables (sin contar festivos)
      request_status: 'approved',
      requester_comment: 'Vacaciones de verano para viajar con mi familia',
      approver_comment: 'Aprobado. Disfruta tus vacaciones',
    },

    // Employee ID 12 - Sara López (Sistemas, 23 días)
    {
      requester_id: 12,
      start_date: '2025-03-10',
      end_date: '2025-03-14',
      requested_days: 5,
      request_status: 'approved',
      requester_comment: 'Vacaciones cortas de primavera',
      approver_comment: 'Aprobado sin problemas',
    },

    // Employee ID 10 - Nuria Vega (I+D, 22 días)
    {
      requester_id: 10,
      start_date: '2025-06-16',
      end_date: '2025-06-20',
      requested_days: 5,
      request_status: 'approved',
      requester_comment: 'Voy a asistir a la boda de un amigo fuera de Madrid',
      approver_comment: 'Sin problema, aprobado',
    },

    // Employee ID 14 - David Gómez (Contabilidad, 20 días)
    {
      requester_id: 14,
      start_date: '2025-02-17',
      end_date: '2025-02-21',
      requested_days: 5,
      request_status: 'approved',
      requester_comment: 'Necesito unos días de descanso',
      approver_comment: 'Confirmado y registrado en sistema',
    },

    // Employee ID 18 - Andrés Castro (Gestión, 18 días)
    {
      requester_id: 18,
      start_date: '2025-08-04',
      end_date: '2025-08-08',
      requested_days: 5,
      request_status: 'approved',
      requester_comment: 'Verano en familia',
      approver_comment: 'Aprobado',
    },

    // Employee ID 13 - Hugo Prieto (Sistemas, 21 días)
    {
      requester_id: 13,
      start_date: '2025-09-15',
      end_date: '2025-09-19',
      requested_days: 5,
      request_status: 'approved',
      requester_comment: 'Viaje personal planificado',
      approver_comment: 'Aprobado',
    },

    // ==========================================
    // SOLICITUDES APROBADAS - FUTURAS
    // ==========================================

    // Employee ID 11 - Claudia Pascual (I+D, 18 días)
    {
      requester_id: 11,
      start_date: '2025-11-24',
      end_date: '2025-11-28',
      requested_days: 5,
      request_status: 'approved',
      requester_comment: 'Puente de diciembre anticipado',
      approver_comment: 'Aprobado. Que lo disfrutes',
    },

    // Employee ID 15 - Isabel Delgado (Contabilidad, 23 días)
    {
      requester_id: 15,
      start_date: '2025-12-01',
      end_date: '2025-12-05',
      requested_days: 5,
      request_status: 'approved',
      requester_comment: 'Quiero adelantar mis vacaciones de Navidad',
      approver_comment: 'Sin problema',
    },

    // Employee ID 19 - Patricia León (Gestión, 20 días)
    {
      requester_id: 19,
      start_date: '2025-12-15',
      end_date: '2025-12-19',
      requested_days: 5,
      request_status: 'approved',
      requester_comment: 'Preparar las fiestas con la familia',
      approver_comment: 'Aprobado',
    },

    // ==========================================
    // SOLICITUDES RECHAZADAS - PASADAS
    // ==========================================

    // Employee ID 16 - Lucía Romero (Administración, 19 días)
    {
      requester_id: 16,
      start_date: '2025-04-14',
      end_date: '2025-04-17', // Semana Santa (evitando festivos)
      requested_days: 4,
      request_status: 'rejected',
      requester_comment: 'Me gustaría aprovechar Semana Santa',
      approver_comment: 'Ya hay varias ausencias en esas fechas',
    },

    // Employee ID 14 - David Gómez (Contabilidad, 20 días)
    {
      requester_id: 14,
      start_date: '2025-01-13',
      end_date: '2025-01-17',
      requested_days: 5,
      request_status: 'rejected',
      requester_comment: 'Vacaciones post navidad',
      approver_comment: 'No procede, recién incorporado tras vacaciones previas',
    },

    // Employee ID 20 - Beatriz Navarro (Control, 23 días)
    {
      requester_id: 20,
      start_date: '2025-05-19',
      end_date: '2025-05-23',
      requested_days: 5,
      request_status: 'rejected',
      requester_comment: 'Viaje personal pendiente desde el año pasado',
      approver_comment: 'Departamento con carga alta de trabajo en esas fechas',
    },

    // Employee ID 12 - Sara López (Sistemas, 23 días)
    {
      requester_id: 12,
      start_date: '2025-03-24',
      end_date: '2025-03-28',
      requested_days: 5,
      request_status: 'rejected',
      requester_comment: 'Necesito unos días de descanso',
      approver_comment: 'No se pueden conceder dos periodos tan cercanos',
    },

    // Employee ID 21 - Álvaro Domínguez (Control, 24 días)
    {
      requester_id: 21,
      start_date: '2025-10-20',
      end_date: '2025-10-24',
      requested_days: 5,
      request_status: 'rejected',
      requester_comment: 'Solicito unos días para descansar después del proyecto',
      approver_comment: 'No es posible por coincidencia con otros turnos',
    },

    // ==========================================
    // SOLICITUDES PENDIENTES - FUTURAS (Nov-Dic 2025)
    // ==========================================

    // Employee ID 9 - Pablo Moreno (I+D, 21 días - ya usó 8 = quedan 13)
    {
      requester_id: 9,
      start_date: '2025-11-24',
      end_date: '2025-11-28',
      requested_days: 5,
      request_status: 'pending',
      requester_comment: 'Puente de fin de mes',
      approver_comment: null,
    },

    // Employee ID 17 - Raúl Nieto (Administración, 19 días)
    {
      requester_id: 17,
      start_date: '2025-12-22',
      end_date: '2025-12-24', // 3 días (evita 25 navidad, 26 jueves, 27 viernes)
      requested_days: 3,
      request_status: 'pending',
      requester_comment: 'Vacaciones de fin de año',
      approver_comment: null,
    },

    // Employee ID 13 - Hugo Prieto (Sistemas, 21 días - ya usó 5 = quedan 16)
    {
      requester_id: 13,
      start_date: '2025-11-25',
      end_date: '2025-11-28',
      requested_days: 4,
      request_status: 'pending',
      requester_comment: 'Días personales antes de diciembre',
      approver_comment: null,
    },

    // Employee ID 10 - Nuria Vega (I+D, 22 días - ya usó 5 = quedan 17)
    {
      requester_id: 10,
      start_date: '2025-12-01',
      end_date: '2025-12-05',
      requested_days: 5,
      request_status: 'pending',
      requester_comment: 'Primera semana de diciembre',
      approver_comment: null,
    },

    // Employee ID 18 - Andrés Castro (Gestión, 18 días - ya usó 5 = quedan 13)
    {
      requester_id: 18,
      start_date: '2025-12-09',
      end_date: '2025-12-12',
      requested_days: 4,
      request_status: 'pending',
      requester_comment: 'Me gustaría viajar con amigos',
      approver_comment: null,
    },

    // Employee ID 16 - Lucía Romero (Administración, 19 días)
    {
      requester_id: 16,
      start_date: '2025-12-15',
      end_date: '2025-12-19',
      requested_days: 5,
      request_status: 'pending',
      requester_comment: 'Preparativos navideños',
      approver_comment: null,
    },

    // Employee ID 20 - Beatriz Navarro (Control, 23 días)
    {
      requester_id: 20,
      start_date: '2025-11-19',
      end_date: '2025-11-21',
      requested_days: 3,
      request_status: 'pending',
      requester_comment: 'Semana de descanso corta',
      approver_comment: null,
    },

    // Employee ID 21 - Álvaro Domínguez (Control, 24 días)
    {
      requester_id: 21,
      start_date: '2025-12-01',
      end_date: '2025-12-05',
      requested_days: 5,
      request_status: 'pending',
      requester_comment: 'Viaje programado a Italia',
      approver_comment: null,
    },

    // Manager ID 4 - Carlos Rodríguez (Manager I+D, 22 días)
    {
      requester_id: 4,
      start_date: '2025-11-24',
      end_date: '2025-11-28',
      requested_days: 5,
      request_status: 'pending',
      requester_comment: 'Vacaciones de fin de año como manager',
      approver_comment: null,
    },

    // Manager ID 5 - Iván Méndez (Manager Sistemas, 23 días)
    {
      requester_id: 5,
      start_date: '2025-12-09',
      end_date: '2025-12-13',
      requested_days: 5,
      request_status: 'pending',
      requester_comment: 'Descanso antes de las fiestas',
      approver_comment: null,
    },

    // Admin ID 2 - Elena Ruiz (Admin, 25 días)
    {
      requester_id: 2,
      start_date: '2025-11-19',
      end_date: '2025-11-22',
      requested_days: 4,
      request_status: 'pending',
      requester_comment: 'Necesito unos días de desconexión',
      approver_comment: null,
    },
  ];

  for (const request of requests) {
    await VacationRequest.findOrCreate({
      where: {
        requester_id: request.requester_id,
        start_date: request.start_date,
        end_date: request.end_date,
      },
      defaults: {
        ...request,
        created_at: new Date(),
        updated_at: new Date(),
      } as any,
    });
  }

  console.log('✅ Vacation requests seeded successfully');
}
