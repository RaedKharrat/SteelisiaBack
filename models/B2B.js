// models/b2bModel.js
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const b2bSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: { type: Number, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  cin: { type: String, required: true },
  patenteFile: { type: String, required: true },
  registreFile: { type: String, required: true },
  cinFile: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'processed'], default: 'pending' }
}, { timestamps: true });

export default model('B2B', b2bSchema);