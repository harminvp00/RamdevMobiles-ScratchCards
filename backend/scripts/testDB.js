

const connectDB = require('../config/db.js');
const Card = require('../models/Card.js')

connectDB();





async function getCards(){


    const res = await Card.countDocuments({reward: "₹50"})

    // const res = await Card.aggregate([
    //   { $count: "reward" }
    // ]);

    // const res = await Card.findOne({});

    return res;
}

getCards().then(res => console.log(res))




/*
{
  _id: new ObjectId('6a65aaf2e44f6d14837db697'),
  cardNumber: '0001',
  reward: '6D Glass',
  token: '50298c4b-d206-4b10-98d6-31b3afd70bf9',
  assigned: false,
  assignedUser: null,
  redeemed: false,
  redeemedDate: null,
  createdDate: 2026-07-26T06:36:34.090Z,
  __v: 0
}
*/