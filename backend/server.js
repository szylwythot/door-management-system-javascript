const exp = require("constants");
const { application, response } = require("express");
const express = require(`express`);
const fs = require(`fs`);
const { request } = require("http");
const { type } = require("os");
const path = require(`path`);
const { resourceLimits } = require("worker_threads");

const app = express();
const port = `9000`;
const ipAddress = `http://127.0.0.2:${port}`

const publicAbsolutePath = `${__dirname}/../frontend/public`;
const indexHtmlAbsolutePath = `${__dirname}/../frontend/index.html`;
const studentJsonAbsolutePath = `${__dirname}/data/students.json`

const studentStatuses = [
    {
        statusName : "active",
        statusValue : true
    },
    {
        statusName : "finished",
        statusValue : false
    }
];


app.use(`/pub`, express.static(publicAbsolutePath));

app.get('/', (request, response, next) => { // ez a sima 
    response.sendFile(path.join(indexHtmlAbsolutePath));
});

app.get('/api/students', (request, response, next) => { // ez a sima 
    response.sendFile(studentJsonAbsolutePath);
});


app.get(`/api/students/:key`, (request, response, next) => { // TODO: try get status and try get  ID, if nt possible then send error

    const key = request.params.key;
    const parsedKey = parseInt(key); // can be better, TODO: implement keys of '10lknkén' pattern
    let isValidId = true;
    if( !isNaN(parsedKey) ) {
        console.log("Id request recieved");

        fs.readFile(studentJsonAbsolutePath, (error, data) =>
        {
            if(error){
                response.send("Error just happened during opening the file.");
            } else {
                const students = JSON.parse(data);
                const requestedId = parseInt(request.params.key);
                const student = students.filter( student => student.id === requestedId)[0];
                if(student != undefined){
                    response.send(student);
                } else{
                    isValidId = false;
                }
            }
        });
    } else {
        let status = studentStatuses.filter( status => status.statusName === key);

        if(status.length > 0){
            console.log("status request recieved");

            const statusValue =  status[0].statusValue;
            // console.log(statusValue);
    
            fs.readFile(studentJsonAbsolutePath, (error, data) =>{
                if(error){
                    response.statusCode = 404;
                    response.send("Error just happened during opening the file.");
                } else {
                    const users = JSON.parse(data);
                    // console.log(users)
                    
                    const usersOfStatus = users.filter( user => {
                        return user.status === statusValue
                    });
                    console.log(usersOfStatus)
                    response.send(usersOfStatus);
                }
            });
        } else{
            isValidId = false;
        }
    }

    if (!isValidId){
        response.statusCode = 404;
        response.send("Please add valid student ID or valid student status in url.");
    }

});

getstudetsByStatus =  (key) => {
    let response = {};
    console.log(response)
    let status = studentStatuses.filter( status => status.statusName === key);

    if(status.length > 0){
        if (status !== [] && status !== undefined){
        console.log("status request recieved");
        const statusValue = status.statusValue;

        fs.readFile(studentJsonAbsolutePath, (error, data) =>{
            if(error){
                response = { statusCode : 404, body: "Error just happened during opening the file." };
                console.log(response)
            } else {
                const users = JSON.parse(data);
                const usersOfStatus = users.filter( user => user.status === statusValue);
                response = { body: usersOfStatus };
                console.log(response)
            }
        });
        } else {
            response = { statusCode : 404, body: "Please add valid student ID or valid student status in url." };
            console.log(response)
        }
    } else {
        response = { statusCode : 404, body: "Please add valid student ID or valid student status in url." };
        console.log(response)
    }
    
    console.log(response)

    return response;
};


app.listen(port, () => {
    console.log(ipAddress);
});