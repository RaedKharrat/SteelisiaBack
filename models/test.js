import mongoose from "mongoose";

// Destructuring the Schema and model objects from the mongoose module
const { Schema, model } = mongoose;

// Creating a new Mongoose schema for the 'Test' model
const testSchema = new Schema({
    // Defining a field 'name' of type String, which is required
    name: {
        type: String,
        required: true
    },
    
    // Defining a field 'image' of type String, which is required
    image: {
        type: String,
        required: true
    }
},
// Additional configuration for the schema, enabling timestamps (createdAt and updatedAt)
{
    timestamps: true
});

// Creating and exporting the 'Test' model using the defined schema
export default model('Test', testSchema);
