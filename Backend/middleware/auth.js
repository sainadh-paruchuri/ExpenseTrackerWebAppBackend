const jwt=require('jsonwebtoken');
const User=require('../model/user');
require('dotenv').config();

exports.authenticate=(req,res,next)=>{
    try {
        const tocken=req.header('Authorization')
        console.log(tocken);
        const user=jwt.verify(tocken,process.env.GENERATE_ACCESS_TOKEN)
        console.log(user);
        User.findByPk(user.userId).then((result) => {
            console.log(JSON.stringify(result));
            req.result=result
            next();
            
        })
    } catch (error) {
        console.log(error);
    }
}
