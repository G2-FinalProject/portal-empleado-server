import type { Request, Response } from 'express';
import { Department } from '../models/departmentModel.js';
import { User } from '../models/userModel.js';
import type { DepartmentCreationAttributes } from '../types/departmentInterface.js';

export const createDepartment = async (req: Request, res: Response) => {
  // Los datos ya vienen validados por 'express-validator'
  const { department_name, manager_id } = req.body;

  try {
    // La validación (si el nombre ya existe) la hace el validador,
    // así que aquí solo nos centramos en crear.
    const newDepartment = await Department.create({
      department_name,
      manager_id: manager_id || null, // Si no viene manager_id, lo ponemos a null
    } as DepartmentCreationAttributes);

    res.status(201).json(newDepartment);
  } catch (error) {
    console.error('Error al crear el departamento:', error);
    res.status(500).json({ message: 'Error al crear el departamento.' });
  }
};

// GET /departments
 
export const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await Department.findAll({
      include: [
        { 
          model: User, 
          as: 'manager', // Trae la info del Mánager (User)
          attributes: ['id', 'first_name', 'last_name', 'email'] // Solo datos seguros
        },
        {
          model: User,
          as: 'users', // Trae la info de los Empleados (User) de este depto
          attributes: ['id', 'first_name', 'last_name']
        }
      ]
    });
    res.status(200).json(departments);
  } catch (error) {
    console.error('Error al obtener los departamentos:', error);
    res.status(500).json({ message: 'Error al obtener los departamentos.' });
  }
};
// GET /departments/:id
export const getDepartmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const department = await Department.findByPk(id, {
      include: ['manager', 'users'] // Incluimos mánager y empleados
    });

    if (!department) {
      return res.status(404).json({ message: 'Departamento no encontrado.' });
    }
    res.status(200).json(department);
  } catch (error) {
    console.error('Error al obtener el departamento:', error);
    res.status(500).json({ message: 'Error al obtener el departamento.' });
  }
};

//ACTUALIZAR un Departamento
export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { department_name, manager_id } = req.body;

    // 1. Buscar el departamento
    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({ message: 'Departamento no encontrado.' });
    }

    //  La validación (si el nombre ya existe) la hace el validador.
    // Aquí solo actualizamos los campos que nos llegan.
    if (department_name !== undefined) {
      department.department_name = department_name;
    }
    if (manager_id !== undefined) {
      department.manager_id = manager_id;
    }

    // 3. Guardar los cambios
    await department.save();

    res.status(200).json(department);
  } catch (error) {
    console.error('Error al actualizar el departamento:', error);
    res.status(500).json({ message: 'Error al actualizar el departamento.' });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    //  Buscar el departamento
    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({ message: 'Departamento no encontrado.' });
    }

    //  Lógica de negocio: No dejar borrar un depto si tiene empleados
    const userCount = await User.count({ where: { department_id: id } });
    if (userCount > 0) {
      return res.status(400).json({ 
        message: `No se puede borrar el departamento porque tiene ${userCount} empleado(s) asignado(s).`
      });
    }

    //  Borrar
    await department.destroy();
    res.status(200).json({ message: 'Departamento eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar el departamento:', error);
    res.status(500).json({ message: 'Error al eliminar el departamento.' });
  }
};

