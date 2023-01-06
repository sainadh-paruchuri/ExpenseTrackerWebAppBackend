const path=require('path')
const User=require('../model/user')
const bcrypt=require('bcrypt');
const Expense=require('../model/expense')
const jwt=require('jsonwebtoken'); 
const AWS=require('aws-sdk');
const { resolve } = require('path');
const { json } = require('body-parser');
require('dotenv').config();



let Items_Per_Page;
exports.pages=(req,res)=>{
    console.log(req.body);
    Items_Per_Page=Number(req.body.pages);
}

exports.signup=(req,res,next)=>{
    res.sendFile(path.join(__dirname,'..','views','signUp1.html'))

}
exports.addUser=(req,res,next)=>{
    console.log(req.body);
    const username=req.body.username;
    const useremail=req.body.useremail;
    const password=req.body.password;   

    const saltround=10;
    bcrypt.hash(password,saltround,async(err,hash)=>{
        console.log(err);
        await  User.create({
        username:username,
        useremail:useremail,
        password:hash
    })
    .then(result=>{
         res.status(201).json({msg:'suessfully user created'})
        console.log(result);
    })
    .catch(err=>console.log(err))
    })
   
}

exports.users=(req,res,next)=>{
    User.findAll()
    .then(result=>{
        res.status(200).json(result);
        // console.log(result);
        })
    .catch(err=>console.log(err))
}

const generateAccesToken=(id,premium)=>{
    return jwt.sign({userId:id,ispremium:premium },process.env.GENERATE_ACCESS_TOKEN)
}
exports.generateAccesToken1=(id,premium)=>{
    return jwt.sign({userId:id,ispremium:premium },process.env.GENERATE_ACCESS_TOKEN)
}
exports.login=(req,res,next)=>{
    console.log(req.body);
    let email=req.body.useremail;
    let password=req.body.password;
    let msg;
    if(email.length<=0||email===''||password.length<=0||password===''){
        return res.status(403).json({msg:'email or password are wrong'})
    }
    else{
        User.findAll({where:{useremail:email}})
        .then(result=>{
            console.log(result==0)
            if(result==0){
                return res.status(404).json({msg:'User not found'})
            }
            if(result[0].useremail==email){
            console.log(result[0].password);
            bcrypt.compare(password,result[0].password,(err,results)=>{
                 if(results==true){
                res.status(200).json({msg:'User login sucessfully',token:generateAccesToken(result[0].id,result[0].ispremiumuser)})
            }
            else{
                res.status(401).json({msg:'User not authorized'})
            }

            })
           
             }
        })
    }
}
function uploadeToS3(data,filename){
    const BUCKET_NAME=process.env.BUCKET_NAME
    console.log(BUCKET_NAME);
    const IAM_USER_KEY=process.env.IAM_USER_KEY;
    const IAM_USER_SECRETE=process.env.IAM_USER_SECRETE;

    let s3bucket=new AWS.S3({
        accessKeyId:IAM_USER_KEY,
        secretAccessKey:IAM_USER_SECRETE,
    })
        var params={
            Body:data,
            Bucket:BUCKET_NAME,
            Key:filename,
            ACL:'public-read'
            
        }
        return new Promise((resolve,reject)=>{
             s3bucket.upload(params,(err,s3response)=>{
            if(err){
                reject(err)
            }
            else{
                console.log('success',s3response.Location);
                resolve(s3response.Location);
            }
            })
        })

}

exports.expensedownload=async (req,res)=>{
     try{
    const expense=await Expense.findAll({where:{userId:req.result.id}})
    console.log(expense)
    const stringifiedExpense=JSON.stringify(expense)
    const userId=req.result.id;
    const filename=`Expense${userId}/${new Date()}.txt`
   
    const fileURL=await uploadeToS3(stringifiedExpense,filename);
    console.log(fileURL);
     res.status(200).json({ fileURL , success:true,ispremium:req.result.ispremiumuser})
    }
    catch(err){
        console.log(err);
        res.status(500).json({fileURL:'',success:false})
    }
   
   
    
}

exports.addExpense=(req,res)=>{
    console.log(req.body)
    
    const {amount,description,category}=req.body
    const userId=req.result.id
    console.log(userId);
    console.log(amount);
    Expense.create({
        amount,
        description,
        category,
        userId
    })
    .then(result=>{
        console.log(result);
        res.status(200).json({msg:'succesfully added'})
    })
    .catch(err=>console.log(err))

}

exports.getExpense=async (req,res)=>{
    const page=+req.query.page||1
   
    const total=await Expense.count({where :{userId:req.result.id}});
    Expense.findAll({
        where :{userId:req.result.id},
        offset:(page-1)*Items_Per_Page,
        limit:Items_Per_Page
    })
    .then(results=>{
        res.status(200).json({
            ispremium:req.result.ispremiumuser,results:results,
            currentPage:page,
            hasNextPage:Items_Per_Page*page<total,
            nextPage:page+1,
            hasPreviousPage:page>1,
            previousPage:page-1,
            lastPage:Math.ceil(total/Items_Per_Page),
        });
        console.log(results);
        })
    .catch(err=>console.log(err))
}

exports.delete=async(req,res)=>{
    try{
    console.log(req.body);
    const id=Number(req.body.id)
    console.log(id)
     if(!id){
           return res.status(404).json({error:'id is missing'})
        }
        await Expense.destroy({where:{id:id}})
        res.status(200).json({msg:'successfully deleted'});
    }
    catch(err){
        res.status(500).json(err)
    }
}


