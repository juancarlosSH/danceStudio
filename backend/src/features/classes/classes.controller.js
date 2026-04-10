const classesService = require("./classes.service");

const registerClass = async (req, res) => {
  try {
    const { type, class_date, user_id } = req.body;
    if (!type || !class_date || !user_id) {
      return res
        .status(400)
        .json({ message: "type, class_date and user_id are required" });
    }
    const result = await classesService.registerClass({
      type,
      class_date,
      user_id,
    });
    return res.status(201).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
};

const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await classesService.deleteClass(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
};

const getClassesByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await classesService.getClassesByUser(user_id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
};

module.exports = { registerClass, deleteClass, getClassesByUser };
