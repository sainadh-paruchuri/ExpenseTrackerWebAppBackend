const express=require('express')
const router=express.Router()
const premiumController=require('../controller/premium')

router.get('/premiumleaderboard',premiumController.premiumLeaderBoard)
















module.exports=router
