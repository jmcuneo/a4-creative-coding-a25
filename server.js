const express = require('express');
const app = express();
const path = require('path');

app.get('/', (req, res) => {
    console.log(req.url);
    res.sendFile(path.join(__dirname+"/public/index.html"),(err)=> {
        // if the error = null, then we"ve loaded the file successfully
        if( err ) {
            console.log( err );
            // file not found, error code 404
            response.writeHeader( 404 )
            response.end( "404 Error: File Not Found" )
        }
    })
})



app.get('/public/:filename', (req, res) => {
    const filename = req.params['filename'];
    res.sendFile(path.join(__dirname+"/public/"+filename),{contentType:"text/html"},(err)=> {
        if( err ) {console.log(err)}
    })
})

app.get('/public/img/:filename', (req, res) => {
    const filename = req.params['filename'];
    res.sendFile(path.join(__dirname+"/public/img/"+filename),{contentType:"image/png"},(err)=> {
        if( err ) {console.log(err)}
    })
})

app.get('/public/js/:filename', (req, res) => {
    const filename = req.params['filename'];
    res.sendFile(path.join(__dirname+"/public/js/"+filename),{contentType:"application/javascript"},(err)=> {
        if( err ) {console.log(err)}
    })
})

app.get('/public/css/:filename', (req, res) => {
    const filename = req.params['filename'];
    res.sendFile(path.join(__dirname+"/public/css/"+filename),{contentType:"text/css"},(err)=> {
        if( err ) {console.log(err)}
    })
})


app.listen(3000||proces.env.PORT, (err)=>{
    if(err) console.log(err);
})


