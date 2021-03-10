const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const recordSchema = new Schema({
  //primer npmbre segundo nombre
  //primer apellido segundo apellido
  //edad

  firstName: String,
  secondName: String,
  surname: String,
  secondSurname: String,
  sex: String,
  age: Number,
  dateOfBirth: Date,
  placeWhereWasBorn: String,
  departmentLives: String,
  municipalityLives: String,
  residenceAddress: String,
  isItDadOrMom: String,
  profession: String,
  whatDoesHeWorkOn: String,
  whatDoIRelateThisRecordTo: String,
  cedula: {
    type: String,
    unique: true,
  },
  tipo: String,
  cargo: String,
  phone: Number,
  email: {
    type: String,
    unique: true,
  },
  nameWithWhomRelate: String,
  fechaCreate: Date,
  userUpdate: Date,
  rol: String,
  avatar: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  active: Boolean,
});
// usersSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("record", recordSchema);
