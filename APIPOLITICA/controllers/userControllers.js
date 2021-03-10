const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt-nodejs");
const moment = require("moment");
const User = require("../models/Users");
const jwt = require("../services/jwt");

//Cuando se crea un usuario nuevo OJO desde usuario no legueado LO DEJO ESCRITO POR SI LO NECESITA ALGUN DIA
exports.signUp = (req, res) => {
  const user = new User(req.body);
  password = user.password;
  repeatPassword = req.body.repeatPassword;
  //comparamos si las contrsaseñas son iguales
  if (!password || !repeatPassword) {
    res.status(404).json({ message: "Las contraseñas son obligatorias" });
  } else {
    if (password !== repeatPassword) {
      res.status(404).json({ message: "Las contraseñas no son iguales" });
    } else {
      bcrypt.hash(password, null, null, function (err, hast) {
        if (err) {
          res.status(500).json({ message: "Error al encriptar la contraseña" });
        } else {
          user.password = hast;
          emails = user.email;
          user.email = emails.toLowerCase();
          user.active = false;
          fechaCreate = user.fechaCreate;
          user.fechaCreate = moment(fechaCreate);
          userUpdate = user.userUpdate;
          user.userUpdate = moment(userUpdate);
          user.save((err, userStored) => {
            if (err) {
              res.status(500).json({ message: "El usuario ya existe." });
            } else {
              if (!userStored) {
                res.status(404).json({ message: "Error al crear Usuario." });
              } else {
                res
                  .status(200)
                  .json({code: 200, message: "Usuario Creado Correctamente." });
              }
            }
          });
        }
      });
    }
  }
};

//Obtiene todos los usuarios
exports.getUsers = (req, res) => {
  User.find().then((users) => {
    if (!users) {
      res.status(404).json({ message: "No se encontrado ningun usuario" });
    } else {
      res.status(200).json({ users });
    }
  });
};

//Obtiene todos los usuarios activos
exports.getUsersActive = (req, res) => {
  const query = req.query;
  const { page = 1, limit = 1 } = req.query;

  const option = {
    page,
    limit: parseInt(limit),
    sort: { date: "desc" },
  };
  User.paginate({ active: query.active }, option, (err, postsStored) => {
    if (err) {
      res.status(500).send({ code: 500, message: "Error del servidor." });
    } else {
      if (!postsStored) {
        res
          .status(404)
          .send({ code: 404, message: "No se ha encontrado ningun extintor." });
      } else {
        res.status(200).send({ code: 200, users: postsStored });
      }
    }
  });
};

//Obtiene un usuario en especificio por su id para el inicio de sesion por medio de token
exports.signIn = (req, res) => {
  const params = req.body;
  const email = params.email.toLowerCase();
  const password = params.password;
  User.findOne({ email }, (err, userStored) => {
    if (err) {
      res.status(500).json({ message: "Error del Servidor." });
    } else {
      if (!userStored) {
        res.status(404).json({ message: "Usuario no encontrado." });
      } else {
        bcrypt.compare(password, userStored.password, (err, check) => {
          if (err) {
            res.status(500).json({ message: "Error del servidor." });
          } else if (!check) {
            res.status(404).json({ message: "La contraseña es incorrecta" });
          } else {
            if (!userStored.active) {
              res.status(200).json({
                code: 200,
                message: "El usuario no se ha esta activado.",
              });
            } else {
              res.status(200).json({
                code: 200,
                user: userStored._id,
                rol: userStored.rol,
                accessToken: jwt.createAccessToken(userStored),
                refreshToken: jwt.createRefreshToken(userStored),
              });
            }
          }
        });
      }
    }
  });
};

//Obtiene un usuario en especificio por su id para el inicio de sesion por medio de token
exports.user = (req, res) => {
  const { id } = req.params;

  User.findById(id, (err, userStored) => {
    if (err) {
      res.status(500).json({ message: "Error del Servidor." });
    } else {
      if (!userStored) {
        res.status(404).json({ message: "Usuario no encontrado." });
      } else {
        res.status(200).json({
          code: 200,
          user: userStored,
        });
      }
    }
  });
};

//funcion para subir el avatar o imagen al servidor
exports.uploadAvatar = (req, res) => {
  const params = req.params;

  User.findById({ _id: params.id }, (err, userData) => {
    if (err) {
      res.status(500).json({ message: "Error del servidor." });
    } else {
      if (!userData) {
        res.status(404).json({ message: "Nose ha encontrado ningun usuario." });
      } else {
        let user = userData;
        if (req.files) {
          let filePath = req.files.avatar.path;
          let fileSplit = filePath.split("/");
          let fileNames = fileSplit[2];
          let extSplit = fileNames.split(".");
          var fileExt = extSplit[1];
          if (fileExt !== "png" && fileExt !== "jpg" && fileExt !== "jpeg") {
            res.status(400).send({
              message:
                "La extension de la imagen no es valida. (Extensiones permitidas: .png y .jpg)",
            });
          } else {
            user.avatar = fileNames;
            User.findByIdAndUpdate(
              { _id: params.id },
              user,
              (err, userResult) => {
                if (err) {
                  res.status(500).send({ message: "Error del servidor." });
                } else {
                  if (!userResult) {
                    res
                      .status(404)
                      .send({ message: "No se ha encontrado ningun usuario." });
                  } else {
                    res.status(200).send({ avatarName: fileNames });
                  }
                }
              }
            );
          }
        }
      }
    }
  });
};

//funcion para subir el avatar o imagen al servidor
exports.uploadAvatarMovil = (req, res) => {
  const params = req.params;

  User.findById({ _id: params.id }, (err, userData) => {
    if (err) {
      res.status(500).json({ message: "Error del servidor." });
    } else {
      if (!userData) {
        res
          .status(404)
          .json({ code: 404, message: "No se ha encontrado ningun usuario." });
      } else {
        let user = userData;
        console.log(req.body.imgsource);
        if (req.files) {
          let fileNames = req.files.avatar.name;
          console.log(fileNames);
          let extSplit = fileNames.split(".");
          var fileExt = extSplit[1];
          if (fileExt !== "png" && fileExt !== "jpg" && fileExt !== "jpeg") {
            res.status(400).json({
              message:
                "La extension de la imagen no es valida. (Extensiones permitidas: .png y .jpg)",
            });
          } else {
            user.avatar = fileNames;
            User.findByIdAndUpdate(
              { _id: params.id },
              user,
              (err, userResult) => {
                if (err) {
                  res.status(500).json({ message: "Error del servidor." });
                } else {
                  if (!userResult) {
                    res
                      .status(404)
                      .send({ message: "No se ha encontrado ningun usuario." });
                  } else {
                    res.status(200).send({ code: 200, avatarName: fileNames });
                  }
                }
              }
            );
          }
        } else {
          res
            .status(400)
            .json({ code: 400, message: "No fue posible captar la imagen" });
        }
      }
    }
  });
};

//funcion para recuperar nuestro backend para el avatar y envia la foto al frontend envia imagen a usuario
exports.getAvatar = (req, res) => {
  const avatarName = req.params.avatarName;
  const filePath = "./uploads/avatar/" + avatarName;

  fs.exists(filePath, (exists) => {
    if (!exists) {
      res.status(404).send({ message: "El avatar que buscas no existe." });
    } else {
      res.sendFile(path.resolve(filePath));
    }
  });
};

//funcion para actualizar los datos del usuario
exports.updateUser = async (req, res) => {
  let userData = req.body;
  //elimineme las mayusculas del correo
  userData.email = req.body.email.toLowerCase();
  const params = req.params;

  if (userData.password) {
    await bcrypt.hash(userData.password, null, null, (err, hash) => {
      if (err) {
        res.status(500).json({ message: "Error al encriptar la contraseña." });
      } else {
        userData.password = hash;
      }
    });
  }

  //guarda la actualizacion
  User.findByIdAndUpdate({ _id: params.id }, userData, (err, userUpdate) => {
    if (err) {
      res.status(500).json({ message: "Error del servidor." });
    } else {
      if (!userUpdate) {
        res
          .status(404)
          .json({ message: "No se ha encontrado ningun usuario." });
      } else {
        res.status(200).json({ message: "Usuario actualizado correctamente." });
      }
    }
  });
};

//funcion para activar y desactivar usuarios
exports.activateUser = (req, res) => {
  const { id } = req.params;
  const { active } = req.body;

  User.findByIdAndUpdate(id, { active }, (err, userStored) => {
    if (err) {
      res.status(500).send({ message: "Error del servidor." });
    } else {
      if (!userStored) {
        res.status(404).send({ message: "No se ha encontrado el usuario." });
      } else {
        if (active === true) {
          res.status(200).send({ message: "Usuario activado correctamente." });
        } else {
          res
            .status(200)
            .send({ message: "Usuario desactivado correctamente." });
        }
      }
    }
  });
};

//Eliminar un usuario por su id desde administrador
exports.deleteUser = (req, res) => {
  const { id } = req.params;

  User.findByIdAndRemove(id, (err, userDeleted) => {
    if (err) {
      res.status(500).json({ message: "Error del servidor." });
    } else {
      if (!userDeleted) {
        res.status(404).json({ message: "Usuario no encontrado" });
      } else {
        res
          .status(200)
          .json({ message: "El usuario se ha eliminado correctamente." });
      }
    }
  });
};

//funcion para agregar usuario desde administrador tiene que hacer la comparacion de las contraseñas en el fron
exports.signUpAdmin = (req, res) => {
  const user = new User();
  const { fullname, cedula, tel, email, password, rol } = req.body;
  user.fullname = fullname;
  user.cedula = cedula;
  user.tel = tel;
  user.email = email.toLowerCase();
  user.rol = rol;
  user.active = true;
  var varfecha;
  user.fechaCreate = moment(varfecha);
  var uspdate;
  user.userUpdate = moment(uspdate);

  if (!password) {
    res.status(500).json({ message: "La contraseña es obligatoria" });
  } else {
    bcrypt.hash(password, null, null, (err, hash) => {
      if (err) {
        res.status(500).json({ message: "Error al encriptar la contraseña." });
      } else {
        user.password = hash;

        user.save((err, userStored) => {
          if (err) {
            res.status(500).json({ message: "El usuario ya existe." });
          } else {
            if (!userStored) {
              res.status(500).json({ message: "Error al crear el usuario." });
            } else {
              res
                .status(200)
                .json({ message: "Usuario creado correctamente." });
            }
          }
        });
      }
    });
  }
};
