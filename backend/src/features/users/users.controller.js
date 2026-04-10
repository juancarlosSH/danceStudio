const usersService = require("./users.service");

const registerUser = async (req, res) => {
  try {
    const { name, password, paid_at, classes_paid } = req.body;
    if (!name || !password || !paid_at || classes_paid === undefined) {
      return res
        .status(400)
        .json({
          message: "name, password, paid_at and classes_paid are required",
        });
    }
    const user = await usersService.registerUser({
      name,
      password,
      paid_at,
      classes_paid,
    });
    return res.status(201).json(user);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    if (!password)
      return res.status(400).json({ message: "password is required" });
    const result = await usersService.updatePassword(id, password);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
};

const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paid_at, classes_paid } = req.body;
    if (!paid_at || classes_paid === undefined) {
      return res
        .status(400)
        .json({ message: "paid_at and classes_paid are required" });
    }
    const result = await usersService.updatePayment(id, {
      paid_at,
      classes_paid,
    });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
};

const getClassesTaken = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await usersService.getClassesTaken(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
};

const getRemainingClasses = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await usersService.getRemainingClasses(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
};

const getRemainingDays = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await usersService.getRemainingDays(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  updatePassword,
  updatePayment,
  getClassesTaken,
  getRemainingClasses,
  getRemainingDays,
};
