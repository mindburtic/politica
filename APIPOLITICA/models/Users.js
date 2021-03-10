const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const usersSchema = new Schema({
  fullname: String,
  cedula: {
    type: String,
    unique: true,
  },
  tipo: String,
  cargo: String,
  tel: Number,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  fechaCreate: Date,
  userUpdate: Date,
  rol: String,
  avatar: String,
  records: [
    {
      type: Schema.Types.ObjectId,
      ref: "record",
    },
  ],
  active: Boolean,
});
usersSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("user", usersSchema);
