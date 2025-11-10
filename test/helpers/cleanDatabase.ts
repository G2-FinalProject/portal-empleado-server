import { VacationRequest } from '../../src/models/vacationRequestModel';
import { User } from '../../src/models/userModel';
import { Department } from '../../src/models/departmentModel';
import { Location } from '../../src/models/locationModel';
import { Role } from '../../src/models/roleModel';
import { Holiday } from '../../src/models/holidayModel';



export async function cleanDatabase() {
  await VacationRequest.destroy({ where: {}, force: true });
  await Holiday.destroy({ where: {}, force: true });
  await Department.destroy({ where: {}, force: true });
  await User.destroy({ where: {}, force: true });
  await Location.destroy({ where: {}, force: true });
  await Role.destroy({ where: {}, force: true });
}
