const Records = require("../models/Records");
const User = require("../models/Users");
//slug para y shor id generar url
// const slug = require("slug");
// const shortid = require("shortid");
//avatar
const fs = require("fs");
const path = require("path");

exports.addRecords = async (req, res) => {
  try {
    const body = req.body;
    console.log(body);
    // Url = body.placa;
    // const url = slug(Url).toLowerCase();
    // body.url = `${url}-${shortid.generate()}`;
    active = body.active;
    active = true;
    body.active = active;
    const record = new Records(body);

    const user = await User.findById(req.params.id);

    record.user = user;
    await record.save((err, recordStored) => {
      if (err) {
        res.status(500).json({ message: "El registro ya existe." });
      } else {
        if (!recordStored) {
          res.status(404).json({ message: "Error al crear registro." });
        } else {
          user.Records.push(record._id);
          user.save((err, userStored) => {
            if (err) {
              res
                .status(500)
                .json({ message: "El usuario ya ha sido registrado." });
            } else {
              if (!userStored) {
                res
                  .status(404)
                  .json({ message: "Error al crear registro." });
              } else {
                res.status(200).json({
                  code: 200,
                  iduser: recordStored._id,
                  message: "Usuario registrado Correctamente.",
                });
              }
            }
          });
        }
      }
    });
  } catch (e) {
    res.status(500).json({
      message: "Error agregar registro",
    });
  }
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