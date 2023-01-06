
const express=require('express')
const router=express.Router();
const forgotController=require('../controller/forgot')

router.post('/forgotpassword',forgotController.forgotPassword);

router.get('/resetPassword/:id',forgotController.resetPassword);
router.get('/updatepassword/:id',forgotController.updatepassword)









module.exports=router