const User=require('../model/user');
const Expense=require('../model/expense');
const sequelize = require('../util/database');
require('dotenv').config();

exports.premiumLeaderBoard=async (req,res)=>{
        const expenses=await Expense.findAll()
    const userLeaerBoardDetails=await User.findAll({
        attributes:['id','username',[sequelize.fn('sum',sequelize.col('expenses.amount')), 'total_cost']],
        include:[
            {
                model:Expense,
                attributes:[]
            }

        ],
        group:['user.id'],
        order:[['total_cost','DESC']]
    });
    res.status(200).json(userLeaerBoardDetails)

}