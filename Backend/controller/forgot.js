const User=require('../model/user')
const bcrypt=require('bcrypt')
const uuid=require('uuid')
const ForgotPassword=require('../model/forgot')
const { route, use } = require('../routes/user')

exports.forgotPassword=async (req,res)=>{
    const { useremail }=req.body;
    console.log(req.body);
    console.log(useremail);
    try {
        let result=await User.findOne({where:{useremail:useremail}})
        if(result){
            let id=uuid.v4();
            let userId=result.id;
            let active=true
            ForgotPassword.create({id,userId,active})
            .then((result) => {
                res.send(`<a href="http://localhost:4000/resetPassword/${id}">reset</a>`)
                
            }).catch((err) => {
                res.send({err,msg:fale})
                
            });
        }else{
            console.log(result);
        }
        
    } catch (error) {
        console.log(error);
    }

}
exports.resetPassword=async (req,res)=>{
    const id=req.params.id;
    console.log(id);
    ForgotPassword.findOne({where:{id:id}})
    .then(result=>{
        console.log(result)
        if(result){
            if(result.active==false){
                res.send(`<h1>link expired</h1>`)
            }
            result.update({active:false})
            res.send(`<html>
            <body>
            <form action="/updatepassword/${id}" method="get">
                <label for="newpassword">Enter New Password</label>
                <input name="password" type="password" required></input>
                <button type="submit">reset Password</button>
            </form>
            
            </body>
            </html>`)    
        }
        else{
            res.status(404).json({msg:'not found'})
        }
    })
    .catch(err=>console.log(err))


}

exports.updatepassword=async (req,res)=>{
    console.log(req.params.id);
    let id=req.params.id;
    console.log(req.query.password);
    let passwords=req.query.password;

    ForgotPassword.findOne({where:{id:id}})
    .then(result=>{
        User.findOne({where:{id:result.userId}})
        .then(async user=>{
            if(user){
                let password=await bcrypt.hash(passwords,10)
                user.update({password:password})
                .then(()=>{
                    res.send(`<h1>Password successfully changed</h1>`)
                })
                .catch(err=>console.log(err))
            }            
        })
    })
}
