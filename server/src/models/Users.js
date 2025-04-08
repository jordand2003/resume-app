const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    user_id: {
        type: String,
        required: true,
        unique: true,
    },
    name:{
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: false,
    }
}, { collection: 'Users' }); // Specify the collection name as 'Users'

const Users = mongoose.model('Users', userSchema); 
module.exports = Users;