const mongoose = require('mongoose')
const Usuario = new mongoose.Schema ({
    user: String,
    type: String,
    password: String
})
module.exports = mongoose.model('Usuarios', Usuario)