/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
let MongoClient = require('mongodb');
var mongoose = require('mongoose');
let XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest



module.exports = function (app) {

  let uri = 'mongodb+srv://Luna:'+process.env.PW+'@mongodbandmongoosechall.foypt.mongodb.net/stock-prices?retryWrites=true&w=majority'

  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

	


  let stockScehma = new mongoose.Schema({
    name:{type:String,required:true},
    likes:{type: Number, default: 0},
    ips:[String]
  })

  let Stock = mongoose.model('Stock',stockScehma)


  app.route('/api/stock-prices')
    .get(function (req, res){
    let responseObject ={}
    responseObject['stockData'] = {}

    //is it 2 stocks?

  let twoStocks = false

  //output
  let outputResponse = () => {
    return res.json(responseObject)
  }


  //find/update stock info
  /* Find/Update Stock Document */
let findOrUpdateStock = (stockName, documentUpdate, nextStep) => {
  Stock.findOneAndUpdate(
      {name: stockName},
      documentUpdate,
      {new: true, upsert: true},
      (error, stockDocument) => {
          if(error){
          console.log(error)
          }else if(!error && stockDocument){
              if(twoStocks === false){
                return nextStep(stockDocument, processOneStock)
              }
          }
      }
  )
}

  //Like stock?
  let likeStock = (stockName,nextStep) => {
    Stock.findOne({name:stockName}, (error, stockDocument) => {
      if(!error && stockDocument && stockDocument['ips']&& stockDocument['ips'].includes(req.ip)){
        return res.send('Error: Only 1 Like per IP Adress Allowed!')
      }else{
        let documentUpdate = {$inc:{likes:1}, $push:{ips:req.ip}}
        nextStep(stockName,documentUpdate, getPrice)
      }
    })

  }

  /* Get Price */
  let getPrice = (stockDocument, nextStep) => {
    let xhr = new XMLHttpRequest()
    let requestUrl = 'https://stock-price-checker-proxy--freecodecamp.repl.co/v1/stock/' + stockDocument['name'] + '/quote'
    xhr.open('GET', requestUrl, true)
    xhr.onload = () => {
        let apiResponse = JSON.parse(xhr.responseText)
        stockDocument['price'] = apiResponse['latestPrice'].toFixed(2)
        nextStep(stockDocument, outputResponse)
    }
    xhr.send()
  }

  //build response for 1 stock
  let processOneStock = (stockDocument, nextStep) => {
    responseObject['stockData']['stock'] = stockDocument['name']
    responseObject['stockData']['price'] = stockDocument['price']
    responseObject['stockData']['likes'] = stockDocument['likes']

    nextStep()          
  }

  let stocks=[]
  //build response for 2 stocks
  let processTwoStocks = (stockDocument, nextStep) => {

  }

  //proccess Input
  if(typeof (req.query.stock) === 'string'){
    /* One Stock */
    let stockName = req.query.stock
    
    let documentUpdate = {}
    if(req.query.like && req.query.like ==='true'){
      likeStock(stockName, findOrUpdateStock)
    }else{
      findOrUpdateStock(stockName, documentUpdate, getPrice)
    }
   
    
  } else if(Array.isArray(req.query.stock)){
    twoStocks = true
    //stock 1 

     
    //stock 2
  }
    });
    
};
