const Records = require("../models/Records");
const User = require("../models/Users");
const moment = require("moment");
//slug para y shor id generar url
const slug = require("slug");
const shortid = require("shortid");
//avatar
const fs = require("fs");
const path = require("path");

exports.addExtintor = async (req, res) => {
  try {
    const body = req.body;
    Url = body.placa;
    const url = slug(Url).toLowerCase();
    body.url = `${url}-${shortid.generate()}`;
    active = body.active;
    active = true;
    body.active = active;
    fechaCreate = moment();
    body.fechaCreate = fechaCreate;
    const extintors = new Records(body);

    const user = await User.findById(req.params.id);

    extintors.user = user;
    await extintors.save((err, extintorStored) => {
      if (err) {
        res.status(500).json({ message: "El Extintor ya existe." });
      } else {
        if (!extintorStored) {
          res.status(404).json({ message: "Error al crear Extintor." });
        } else {
          user.Records.push(extintors._id);
          user.save((err, userStored) => {
            if (err) {
              res
                .status(500)
                .json({ message: "El Extintor ya registrado con un usuario" });
            } else {
              if (!userStored) {
                res
                  .status(404)
                  .json({ message: "Error al crear elemento y usuario." });
              } else {
                res.status(200).json({
                  code: 200,
                  iduser: extintorStored._id,
                  message: "Elemento Creado Correctamente.",
                });
              }
            }
          });
        }
      }
    });
  } catch (e) {
    res.status(500).json({
      message: "Error agregar",
    });
  }
};

//funcion para subir el avatar o imagen al servidor
exports.uploadFoto = (req, res) => {
  const params = req.params;

  Records.findById({ _id: params.id }, (err, userData) => {
    if (err) {
      res.status(500).json({ code: 500, message: "Error del servidor." });
    } else {
      if (!userData) {
        res
          .status(404)
          .json({ code: 404, message: "No se ha encontrado ningun extintor." });
      } else {
        let extin = userData;
        if (req.files) {
          let filePath = req.files.avatar.path;
          let fileSplit = filePath.split("/");
          let fileNames = fileSplit[2];
          let extSplit = fileNames.split(".");
          var fileExt = extSplit[1];
          if (fileExt !== "png" && fileExt !== "jpg" && fileExt !== "jpeg") {
            res.status(400).json({
              code: 400,
              message:
                "La extension de la imagen no es valida. (Extensiones permitidas: .png y .jpg)",
            });
          } else {
            extin.foto = fileNames;
            Records.findByIdAndUpdate(
              { _id: params.id },
              extin,
              (err, userResult) => {
                if (err) {
                  res
                    .status(500)
                    .json({ code: 500, message: "Error del servidor." });
                } else {
                  if (!userResult) {
                    res.status(404).json({
                      code: 404,
                      message: "No se ha encontrado ningun extinto.",
                    });
                  } else {
                    res.status(200).json({ code: 200, avatarName: "Correcto" });
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
//funcion para recuperar nuestro backend para el avatar y envia la foto al frontend envia imagen a usuario
exports.getFoto = (req, res) => {
  const fotoName = req.params.fotoName;
  const filePath = "./uploads/extintores/" + fotoName;

  fs.exists(filePath, (exists) => {
    if (!exists) {
      res
        .status(404)
        .json({ code: 404, message: "El avatar que buscas no existe." });
    } else {
      res.sendFile(path.resolve(filePath));
    }
  });
};
//foto url
exports.getFotoo = (req, res) => {
  const { fotoName } = req.params.fotoName;
  const filePath = "./uploads/extintores/" + fotoName;

  fs.exists(filePath, (exists) => {
    if (!exists) {
      res
        .status(404)
        .json({ code: 404, message: "El avatar que buscas no existe." });
    } else {
      res.sendFile(path.resolve(filePath));
    }
  });
};

//aqui en listamos para visualizar extintor
exports.getExtintores = (req, res) => {
  const { page = 1, limit = 1 } = req.query;
  const options = {
    page,
    limit: parseInt(limit),
    sort: { date: "desc" },
  };
  Records.paginate({}, options, (err, postsStored) => {
    if (err) {
      res.status(500).send({ code: 500, message: "Error del servidor." });
    } else {
      if (!postsStored) {
        res
          .status(404)
          .send({ code: 404, message: "No se ha encontrado ningun extintor." });
      } else {
        res.status(200).send({ code: 200, extintores: postsStored });
      }
    }
  });
};

//Actualizacion del Extintor
exports.updateExtintor = (req, res) => {
  const extintorData = req.body;
  const { id } = req.params;
  Records.findByIdAndUpdate(id, extintorData, (err, extintorUpdate) => {
    if (err) {
      res.status(500).json({ code: 500, message: "Error del servidor." });
    } else {
      if (!extintorUpdate) {
        res
          .status(404)
          .json({ code: 400, message: "No se ha encontrado ningun extintor." });
      } else {
        res
          .status(200)
          .json({ code: 200, message: "Extintor actualizado correctamente." });
      }
    }
  });
};

exports.deleteExtintor = (req, res) => {
  const { id } = req.params;
  Records.findOne({ _id: id }, (err, postStored) => {
    if (err) {
      res.status(500).send({ code: 500, message: "Error del servidor." });
    } else {
      if (!postStored) {
        res
          .status(404)
          .send({ code: 404, message: "No se ha encontrado ningun extintor." });
      } else {
        User.findByIdAndUpdate(
          postStored.user,
          {
            $pull: { Records: id },
          },
          (err, extintorUpdate) => {
            if (err) {
              res
                .status(500)
                .json({ code: 500, message: "Error del servidor." });
            } else {
              if (!extintorUpdate) {
                res.status(404).json({
                  code: 400,
                  message: "No se ha encontrado ningun extintor.",
                });
              } else {
                Records.findByIdAndRemove(id, (err, extintorDeleted) => {
                  if (err) {
                    res.status(500).json({ message: "Error del servidor." });
                  } else {
                    if (!extintorDeleted) {
                      res
                        .status(404)
                        .json({ message: "Extintor no encontrado" });
                    } else {
                      res.status(200).json({
                        message: "El Extintor se ha eliminado correctamente.",
                      });
                    }
                  }
                });
              }
            }
          }
        );
      }
    }
  });
};
//extraemos los datos d un solo extintor por url
exports.getExtintor = (req, res) => {
  const { url } = req.params;

  Records.findOne({ url }, (err, extintorStored) => {
    if (err) {
      res.status(500).send({ code: 500, message: "Error del servidor." });
    } else {
      if (!extintorStored) {
        res
          .status(404)
          .send({ code: 404, message: "No se ha encontrado ningun extintor." });
      } else {
        res.status(200).send({
          code: 200,
          extintor: extintorStored,
          foto: extintorStored.foto,
        });
      }
    }
  });
};

//extraemos los datos d un solo extintor por id
exports.getExtintorId = (req, res) => {
  const { id } = req.params;

  Records.findById(id, (err, extintorStored) => {
    if (err) {
      res.status(500).send({ code: 500, message: "Error del servidor." });
    } else {
      if (!extintorStored) {
        res
          .status(404)
          .send({ code: 404, message: "No se ha encontrado ningun extintor." });
      } else {
        res.status(200).send({
          code: 200,
          extintor: extintorStored,
          foto: extintorStored.foto,
        });
      }
    }
  });
};

//traer por sede
exports.consulSede = (req, res) => {
  const { sede } = req.params;
  const { page = 1, limit = 1 } = req.query;
  const options = {
    page,
    limit: parseInt(limit),
    sort: { date: "desc" },
  };
  Records.paginate({ sede: sede }, options, (err, extintores) => {
    if (err) {
      res.status(500).send({ code: 500, message: "Error del servidor." });
    } else {
      if (!extintores) {
        res
          .status(404)
          .json({ code: 404, message: "No se a encontrado ninguna sede." });
      } else {
        res.status(200).json({ code: 200, sedes: extintores });
      }
    }
  });
};

//treaer por bloque
exports.consulBloque = (req, res) => {
  const { sede, bloque } = req.params;
  const { page = 1, limit = 1 } = req.query;
  const options = {
    page,
    limit: parseInt(limit),
    sort: { date: "desc" },
  };
  Records.paginate(
    { sede: sede, ubicacionBloque: bloque },
    options,
    (err, bloques) => {
      if (err) {
        res.status(500).send({ code: 500, message: "Error del servidor." });
      } else {
        if (!bloques) {
          res
            .status(404)
            .json({ code: 404, message: "No se a encontrado ningun bloque." });
        } else {
          res.status(200).json({ code: 200, bloques: bloques });
        }
      }
    }
  );
};

//treaer por piso
exports.consulPiso = (req, res) => {
  const { sede, bloque, piso } = req.params;
  const { page = 1, limit = 1 } = req.query;
  const options = {
    page,
    limit: parseInt(limit),
    sort: { date: "desc" },
  };
  Records.paginate(
    {
      sede: sede,
      ubicacionBloque: bloque,
      ubicacionPiso: piso,
    },
    options,
    (err, pisos) => {
      if (err) {
        res.status(500).send({ code: 500, message: "Error del servidor." });
      } else {
        if (!pisos) {
          res
            .status(404)
            .json({ code: 404, message: "No se a encontrado ningun piso." });
        } else {
          res.status(200).json({ code: 200, pisos: pisos });
        }
      }
    }
  );
};

//aqui en listamos para exportar a excel
exports.exportarExtintores = (req, res) => {
  Records.find({}, (err, extintores) => {
    if (err) {
      res.status(500).send({ code: 500, message: "Error del servidor." });
    } else {
      if (!extintores) {
        res
          .status(404)
          .json({ code: 404, message: "No se a encontrado ningun extintor." });
      } else {
        res.status(200).json({ code: 200, totalExtint: extintores });
      }
    }
  });
};

//funcion para traer todos los datos registrados por el usuario un usuario
exports.elementsRegistradoUser = async (req, res) => {
  const { _id } = req.params;
  await User.findById(_id)
    .populate("Records")
    .exec((err, elems) => {
      if (err) {
        res.status(500).json({ code: 500, message: "Error del servidor." });
      } else {
        if (!elems) {
          res.status(404).json({ code: 404, message: "No se encontro nada." });
        } else {
          res.status(200).json({ code: 200, elemUsers: elems });
        }
      }
    });
};

//funcion para traer elemento con los datos del usuario que lo registro
exports.RegistradoUser = async (req, res) => {
  const { _id } = req.params;
  await Records.findById(_id)
    .populate("users")
    .exec((err, elems) => {
      if (err) {
        res.status(500).json({ code: 500, message: "Error del servidor." });
      } else {
        if (!elems) {
          res.status(404).json({ code: 404, message: "No se encontro nada." });
        } else {
          console.log(elems);
        }
      }
    });
};

//funcion para recuperar nuestro backend para el avatar y envia la foto al frontend envia imagen a usuario
exports.getAvatarElemento = (req, res) => {
  const avatarName = req.params.avatarName;

  const filePath = "./uploads/extintores/" + avatarName;

  fs.exists(filePath, (exists) => {
    if (!exists) {
      res.status(404).send({ message: "El avatar que buscas no existe." });
    } else {
      res.sendFile(path.resolve(filePath));
    }
  });
};
