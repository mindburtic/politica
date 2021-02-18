const jwt = require("jwt-simple");
const moment = require("moment");

const SECRET_KEY = "dfsk8g5bf58ssdHBAjbJGF86YLJ8Bx4JKBj44vasy6592652";

exports.createAccessToken = (user) => {
  const payload = {
    id: user._id,
    fullname: user.fullname,
    cedula: user.cedula,
    tel: user.tel,
    email: user.email,
    rol: user.rol,
    avatar: user.avatar,
    createToken: moment().unix(),
    exp: moment().add(24, "hours").unix(),
  };
  return jwt.encode(payload, SECRET_KEY);
};

exports.createRefreshToken = (user) => {
  const payload = {
    id: user.id,
    exp: moment().add(36, "hours").unix(),
  };
  return jwt.encode(payload, SECRET_KEY);
};

exports.decodedToken = (token) => {
  return jwt.decode(token, SECRET_KEY, true);
};
