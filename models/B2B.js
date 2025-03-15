import mongoose from "mongoose";

const { Schema, model } = mongoose;

const b2bSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    
 
},

{
    timestamps: true
});

export default model('B2B', b2bSchema);
