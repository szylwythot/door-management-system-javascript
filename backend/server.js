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
const ipAddress = `http://127.0.0.1:${port}`

const publicAbsolutePath = `${__dirname}/../frontend/public`;
const indexHtmlAbsolutePath = `${__dirname}/../frontend/index.html`;
const doorsJsonAbsolutePath = `${__dirname}/data/doors.json`


app.use(`/pub`, express.static(publicAbsolutePath));

app.get('/', (request, response, next) => {
    response.sendFile(path.join(indexHtmlAbsolutePath));
});

app.get('/api/doors', (request, response, next) => {
    response.sendFile(doorsJsonAbsolutePath);
});


app.get(`/api/doors/:key`, (request, response, next) => { // TODO: try get status and try get  ID, if nt possible then send error

    const key = request.params.key;
    const parsedKey = parseInt(key); 

    let isValidId = true;
    if( !isNaN(parsedKey) ) {
        console.log("Id request recieved");

        fs.readFile(doorsJsonAbsolutePath, (error, data) =>
        {
            if(error){
                response.send("Error just happened during opening the file.");
            } else {
                const doorsData = JSON.parse(data);
                const requestedId = parseInt(request.params.key);
                const door = doorsData.doors.filter( door => door.id === requestedId)[0];
                if(door != undefined){
                    response.send(door);
                } else{
                    isValidId = false;
                }
            }
        });
    }

    // else {
    //     let status = studentStatuses.filter( status => status.statusName === key);

    //     if(status.length > 0){
    //         console.log("status request recieved");

    //         const statusValue =  status[0].statusValue;
    //         // console.log(statusValue);
    
    //         fs.readFile(doorsJsonAbsolutePath, (error, data) =>{
    //             if(error){
    //                 response.statusCode = 404;
    //                 response.send("Error just happened during opening the file.");
    //             } else {
    //                 const users = JSON.parse(data);
    //                 // console.log(users)
                    
    //                 const usersOfStatus = users.filter( user => {
    //                     return user.status === statusValue
    //                 });
    //                 console.log(usersOfStatus)
    //                 response.send(usersOfStatus);
    //             }
    //         });
    //     } else{
    //         isValidId = false;
    //     }
    // }

    if (!isValidId){
        response.statusCode = 404;
        response.send("Please add valid student ID");
        //or valid student status in url.");
    }

});

app.delete(`/api/doors/:key`, (request, response, next) => {
    const key = request.params.key;
    const parsedKey = parseInt(key); 

    let isValidId = true;
    if( !isNaN(parsedKey) ) {
        console.log("Id request recieved");

        fs.readFile(doorsJsonAbsolutePath, (error, data) =>
        {
            if(error){
                response.send("Error just happened during opening the file.");
            } else {
                const doorsData = JSON.parse(data);
                const requestedId = parseInt(request.params.key);
                const complementerDoors = doorsData.doors.filter( door => door.id !== requestedId);
                console.log(complementerDoors);
                
                let complementerDoorsStringified = JSON.stringify({doors: complementerDoors});
                console.log(complementerDoorsStringified);

                fs.writeFileSync(doorsJsonAbsolutePath, complementerDoorsStringified, err => {
                    if (err) console.log("Error writing file:", err);
                });
                response.send({"deleted": true});
            }
        });
    }

    if (!isValidId){
        response.statusCode = 404;
        response.send("Please add valid student ID");
        //or valid student status in url.");
    }
});

// getstudetsByStatus =  (key) => {
//     let response = {};
//     console.log(response)
//     let status = studentStatuses.filter( status => status.statusName === key);

//     if(status.length > 0){
//         if (status !== [] && status !== undefined){
//         console.log("status request recieved");
//         const statusValue = status.statusValue;

//         fs.readFile(doorsJsonAbsolutePath, (error, data) =>{
//             if(error){
//                 response = { statusCode : 404, body: "Error just happened during opening the file." };
//                 console.log(response)
//             } else {
//                 const users = JSON.parse(data);
//                 const usersOfStatus = users.filter( user => user.status === statusValue);
//                 response = { body: usersOfStatus };
//                 console.log(response)
//             }
//         });
//         } else {
//             response = { statusCode : 404, body: "Please add valid student ID or valid student status in url." };
//             console.log(response)
//         }
//     } else {
//         response = { statusCode : 404, body: "Please add valid student ID or valid student status in url." };
//         console.log(response)
//     }
    
//     console.log(response)

//     return response;
// };


app.listen(port, () => {
    console.log(ipAddress);
});