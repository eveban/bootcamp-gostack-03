import { Op } from 'sequelize';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import User from '../models/User';
import Appointment from '../models/Appointment';

class ScheduleProvider {
  async index(req, res) {
    const checkUserProvider = await User.findOne({
      where: {
        id: req.userId,
        provider: true,
      },
    });
    if (!checkUserProvider) {
      return res
        .status(401)
        .json({ error: 'Usuário não é um prestador de serviço' });
    }

    const { date } = req.query;

    const parsedDate = parseISO(date);

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
      order: ['date'],
    });

    return res.json(appointments);
  }
}
export default new ScheduleProvider();
