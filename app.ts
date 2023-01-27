import bodyParser from 'body-parser'
import express,{Express, Request,Response} from 'express'
import { Schema } from 'mongoose';
const https = require('https')
// import path from 'path';
const mongoose = require('mongoose');
const date = require(__dirname + '/date.js')
const dotenv = require('dotenv')
dotenv.config()

const app = express()
const port = process.env.PORT
const password = process.env.MONGODB_PASSWORD
const dbname = process.env.MONGODB_DB
const mongodb_url = `mongodb+srv://admin:${password}@cluster0.xrj39zv.mongodb.net/${dbname}?retryWrites=true&w=majority`
mongoose.set('strictQuery',true)
mongoose.connect(mongodb_url);
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))

app.set('view engine','ejs')

interface ITodo extends Document{
    task: String,
    isDone: Boolean,
    taskTitle:String,
    date: Date
}
const todoSchema = new Schema({
    task: String,
    isDone: Boolean,
    taskTitle:String,
    date:{type:Date,default:Date.now}
})

const Todo = mongoose.model('Todo',todoSchema)



const toDay = date.getDateToday();
//const todoHome = new Set()
const todoSchool = new Set() 
app.get('/',(request: Request,response:Response)=>{
    Todo.find({taskTitle:'Home'},(err:string,todoHome:ITodo[])=>{
        if(err)
            response.send(err)
        else
            response.render('index',{today:toDay, tasks: todoHome,taskTitle:'Home'})
    })
    
})

app.get('/school',(request: Request,response:Response)=>{
    Todo.find({taskTitle:'School'},(err:string,todoSchool:ITodo[])=>{
        if(err)
            response.send(err)
        else
            response.render('index',{today:toDay, tasks: todoSchool,taskTitle:'School'})
    })
    
})

app.post('/',(request: Request,response:Response)=>{
    let path = '/'
    const newTask = request.body.newTask
    const taskType = request.body.type
    if(request.body.type === 'School'){
        path = 'school'
    }
    if(request.body.isDone !== '' && newTask === '' && request.body.delete === undefined){
        const update_id = request.body.isDone
        console.log('update_id = ' + update_id)
        Todo.findOneAndUpdate( {_id:update_id},[{ $set: { isDone: { $not: "$isDone" } } }],(err:string,doc:ITodo)=>{
            if(err)
                response.send(err)
            else
            response.redirect(path)
        })
    }
    else if(newTask !== ''){
        const task = new Todo({
            task:newTask,
            isDone:false,
            taskTitle:taskType
        })
        task.save()
        response.redirect(path)
    }
    else if(request.body.delete !== undefined){
        const delete_id = request.body.delete
        Todo.findByIdAndDelete(delete_id,(err:string)=>{
            if(err)
                response.send(err)
            else{
                response.redirect(path)
        }
        })
    }
 
     
})

app.listen(port,()=>{
    console.log(` ✅ [SERVER]: Server is running at https://localhost:${port}`)
})