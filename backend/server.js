const exp = require("constants");
const { application, response } = require("express");
const express = require(`express`);
const fs = require(`fs`);
const { request } = require("http");
const { type } = require("os");
const { parse } = require("path");
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

    if(isNaN(parsedKey)){
        response.send("Please add valid door ID"); // If I work with isValid variable, sometimes fs readfile does not stop
    } else {
        console.log("Id request recieved");

        fs.readFile(doorsJsonAbsolutePath, (error, data) =>
        {
            if(error){
                response.send("Error just happened during opening the file.");
            } else {
                const doorsData = JSON.parse(data);
                const requestedId = parsedKey;
                const door = doorsData.doors.filter( door => door.id === requestedId)[0];
                if(door != undefined){
                    response.send(door);
                } else{
                    response.send("Please add valid door ID");
                }
            }
        });
    }
});

app.delete(`/api/doors/:key`, (request, response, next) => {
    const key = request.params.key;
    const parsedKey = parseInt(key); 

    if(isNaN(parsedKey)){
        response.send("Please add valid door ID1"); // If I work with isValid variable, sometimes fs readfile does not stop
    } else {
        console.log("Id request recieved");

        fs.readFile(doorsJsonAbsolutePath, (error, data) =>
        {
            if(error){
                response.send("Error just happened during opening the file.");
            } else {
                const doorsData = JSON.parse(data);
                let doorsCount = doorsData.doors.length;
                console.log(doorsCount);

                const requestedId = parsedKey;
                const complementerDoors = doorsData.doors.filter( door => door.id !== requestedId);
                console.log(complementerDoors.length);

                if(doorsCount === complementerDoors.length){
                    response.send("Please add valid door ID2");
                } else {
                    let complementerDoorsStringified = JSON.stringify({doors: complementerDoors});
                    console.log(complementerDoorsStringified);
    
                    fs.writeFileSync(doorsJsonAbsolutePath, complementerDoorsStringified, err => {
                        if (err) console.log("Error writing file:", err);
                    });

                    response.send({"deleted": true});
                }

            }
        });
    }
});

app.post(`/api/doors/configure`, (request, response, next) => {
    console.log("got post request");
    let doorDataToPost = JSON.stringify(request.body);
    console.log(doorDataToPost);

    for(let data of Object.keys(doorDataToPost)){
        if(data === undefined){
            response.statusCode = 404;
            response.send("Please add valid doors data");
        }
    }

    fs.readFile(doorsJsonAbsolutePath, (error, data) =>
    {
        if(error){
            response.send("Error just happened during opening the file.");
        } else {
            const doorsData = JSON.parse(data).doors;
            const newId = doorDataToPost[doorDataToPost.length - 1].id + 1;
            doorDataToPost.id = newId;
            doorsData.push(doorDataToPost);

            console.log(doorsData);
            
            fs.writeFileSync(doorsJsonAbsolutePath, doorsData, err => {
                if (err) console.log("Error writing file:", err);
            });
            response.send({"posted": true});
        }
    });
});

function Door(label, closed, locked, id){
    this.id = id;
    this.label = label;
    this.closed = closed;
    this.locked = locked;

    this.tryOpen = function () {
        if(closed){
            this.closed = false;
            return true;
        } else{
            return false;
        }
    }
}

app.patch(`/api/doors/control/:key`, (request, response, next) => {
    const key = request.params.key;
    const parsedKey = parseInt(key); 

    let isValidId = true;
    if( !isNaN(parsedKey) ) {
        console.log("Id request recieved");

        let doorActivity = request.body.activity;



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
        response.send("Please add valid door ID");
        //or valid door status in url.");
    }
});

app.listen(port, () => {
    console.log(ipAddress);
});


// getstudetsByStatus =  (key) => {
//     let response = {};
//     console.log(response)
//     let status = doorStatuses.filter( status => status.statusName === key);

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
//             response = { statusCode : 404, body: "Please add valid door ID or valid door status in url." };
//             console.log(response)
//         }
//     } else {
//         response = { statusCode : 404, body: "Please add valid door ID or valid door status in url." };
//         console.log(response)
//     }
    
//     console.log(response)

//     return response;
// };



    // else {
    //     let status = doorStatuses.filter( status => status.statusName === key);

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