const express = require('express');
const app = express();
const path = require('path');
const mime= require('mime-types');
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
    const type = mime.lookup(filename);
    console.log(filename,type);
    res.sendFile(path.join(__dirname+"/public/"+filename),{contentType:type},(err)=> {
        if( err ) {console.log(err)}
    })
    // const filename = url.substring(url.lastIndexOf('/')+1>url.length?0:url.lastIndexOf('/')+1);
    // const type = mime.contentType(filename)
    // console.log(filename, type, path.join(__dirname+"/public/"+filename))
    // response.sendFile(path.join(__dirname+"/public/"+filename), {contentType:type}, (err)=> {
    //     // if the error = null, then we"ve loaded the file successfully
    //     if( err ) {
    //
    //         console.log( err );
    //         // file not found, error code 404
    //         response.writeHeader( 404 )
    //         response.end( "404 Error: File Not Found" )
    //
    //
    //     }
    // })
})

app.listen(3000||proces.env.PORT, (err)=>{
    if(err) console.log(err);
})


