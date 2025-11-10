import { Holiday } from '../../models/holidayModel.js';

export async function seedHolidays() {
  console.log('Seeding holidays...');

  const holidays = [
    // ==========================================
    // FESTIVOS NACIONALES (para todas las ubicaciones)
    // ==========================================
    // Año Nuevo
    { holiday_name: 'Año Nuevo', holiday_date: '2025-01-01', location_id: 1 }, // Madrid
    { holiday_name: 'Año Nuevo', holiday_date: '2025-01-01', location_id: 2 }, // Barcelona
    { holiday_name: 'Año Nuevo', holiday_date: '2025-01-01', location_id: 3 }, // Pontevedra

    // Reyes
    { holiday_name: 'Reyes', holiday_date: '2025-01-06', location_id: 1 },
    { holiday_name: 'Reyes', holiday_date: '2025-01-06', location_id: 2 },
    { holiday_name: 'Reyes', holiday_date: '2025-01-06', location_id: 3 },

    // Viernes Santo
    { holiday_name: 'Viernes Santo', holiday_date: '2025-04-18', location_id: 1 },
    { holiday_name: 'Viernes Santo', holiday_date: '2025-04-18', location_id: 2 },
    { holiday_name: 'Viernes Santo', holiday_date: '2025-04-18', location_id: 3 },

    // Fiesta del Trabajo
    { holiday_name: 'Fiesta del Trabajo', holiday_date: '2025-05-01', location_id: 1 },
    { holiday_name: 'Fiesta del Trabajo', holiday_date: '2025-05-01', location_id: 2 },
    { holiday_name: 'Fiesta del Trabajo', holiday_date: '2025-05-01', location_id: 3 },

    // Asunción de la Virgen
    { holiday_name: 'Asunción de la Virgen', holiday_date: '2025-08-15', location_id: 1 },
    { holiday_name: 'Asunción de la Virgen', holiday_date: '2025-08-15', location_id: 2 },
    { holiday_name: 'Asunción de la Virgen', holiday_date: '2025-08-15', location_id: 3 },

    // Fiesta Nacional de España
    { holiday_name: 'Fiesta Nacional', holiday_date: '2025-10-12', location_id: 1 },
    { holiday_name: 'Fiesta Nacional', holiday_date: '2025-10-12', location_id: 2 },
    { holiday_name: 'Fiesta Nacional', holiday_date: '2025-10-12', location_id: 3 },

    // Todos los Santos
    { holiday_name: 'Todos los Santos', holiday_date: '2025-11-01', location_id: 1 },
    { holiday_name: 'Todos los Santos', holiday_date: '2025-11-01', location_id: 2 },
    { holiday_name: 'Todos los Santos', holiday_date: '2025-11-01', location_id: 3 },

    // Día de la Constitución
    { holiday_name: 'Día de la Constitución', holiday_date: '2025-12-06', location_id: 1 },
    { holiday_name: 'Día de la Constitución', holiday_date: '2025-12-06', location_id: 2 },
    { holiday_name: 'Día de la Constitución', holiday_date: '2025-12-06', location_id: 3 },

    // Inmaculada Concepción
    { holiday_name: 'Inmaculada Concepción', holiday_date: '2025-12-08', location_id: 1 },
    { holiday_name: 'Inmaculada Concepción', holiday_date: '2025-12-08', location_id: 2 },
    { holiday_name: 'Inmaculada Concepción', holiday_date: '2025-12-08', location_id: 3 },

    // Navidad
    { holiday_name: 'Navidad', holiday_date: '2025-12-25', location_id: 1 },
    { holiday_name: 'Navidad', holiday_date: '2025-12-25', location_id: 2 },
    { holiday_name: 'Navidad', holiday_date: '2025-12-25', location_id: 3 },

    // ==========================================
    // FESTIVOS AUTONÓMICOS - Madrid
    // ==========================================
    { holiday_name: 'Día de la Comunidad de Madrid', holiday_date: '2025-05-02', location_id: 1 },

    // ==========================================
    // FESTIVOS AUTONÓMICOS - Cataluña
    // ==========================================
    { holiday_name: 'Lunes de Pascua', holiday_date: '2025-04-21', location_id: 2 },
    { holiday_name: 'San Juan', holiday_date: '2025-06-24', location_id: 2 },
    { holiday_name: 'Diada de Cataluña', holiday_date: '2025-09-11', location_id: 2 },
    { holiday_name: 'San Esteban', holiday_date: '2025-12-26', location_id: 2 },

    // ==========================================
    // FESTIVOS AUTONÓMICOS - Galicia
    // ==========================================
    { holiday_name: 'Día de las Letras Gallegas', holiday_date: '2025-05-17', location_id: 3 },
    { holiday_name: 'Día de Galicia', holiday_date: '2025-07-25', location_id: 3 },
  ];

  for (const holiday of holidays) {
    await Holiday.findOrCreate({
      where: {
        holiday_date: holiday.holiday_date,
        location_id: holiday.location_id,
      },
      defaults: holiday as any,
    });
  }

  console.log('Holidays seeded successfully');
}