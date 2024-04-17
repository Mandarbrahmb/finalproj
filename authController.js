const User = require('../models/user');
const { hashPassword, comparePassword } = require('../helpers/auth')
const jwt = require('jsonwebtoken');

const test = (req, res) => {
    res.json('test is workinggggg');
}
//register endpoints
const registerUser = async (req, res) => {  // Added 'async' here
    try {
        const {name, email, password} = req.body;

        // Check if name was entered
        if (!name) {
            return res.json({
                error: 'Name is required'
            });
        };

        // Check if password is provided
        if (!password) {
            return res.json({
                error: 'Need a password'
            });
        };

        // Check email
        const exist = await User.findOne({email});  // 'await' is valid now
        if (exist) {
            return res.json({
                error: 'Email taken'
            });
        }
        const hashedPassword = await hashPassword(password)
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        return res.json(user);
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Server error' });  // Improved error handling
    }
}

//Login endpoint
const loginUser =  async (req, res) => {
try {
    const {email, password} = req.body;

    //Check if user exist
    const user = await User.findOne({email});
    if(!user){
        return res.json({
            error: 'No user found'
        })
    }
    //Check if password matches email
    const match = await comparePassword(password, user.password)
    if(match){
        
        jwt.sign({email: user.email, id: user._id, name: user.name}, process.env.JWT_SECRET, {}, (err, token) => {
            if(err) throw err;
            res.cookie('token', token).json(user)
        })
    }
    if(!match){
        res.json({
            error: 'Passwords do not match'
        })
    }
} catch (error) {
    console.log(error)
}
} 

const getProfile = (req, res) => {
    const {token} = req.cookies
    if(token){
        jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
            if(err) throw err;
            res.json(user)
        })
    } else {
        res.json(null)
    }

}

module.exports = {
    test,
    registerUser,
    loginUser,
    getProfile
}
