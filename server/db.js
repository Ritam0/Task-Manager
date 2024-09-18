const mongoose = require('mongoose');
require('dotenv').config(); // Ensure .env variables are loaded

const connect_db = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        if (connection) {
            console.log('Connection successful');
        }
    } catch (e) {
        console.error('Error connecting to the database:', e);
    }
};

module.exports = connect_db;
