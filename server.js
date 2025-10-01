const express = require( 'express' ),
      app = express()

app.use( express.static( 'public' ))
app.use( express.json())
app.use( express.urlencoded({ extended:true }) )

const appdata = []

app.post( '/go', async (req, res) => {
    for(let i = 0; i < 100; i++){
      appdata[i] = []
      for(let j = 0; j < 100; j++){
        let count = 0
        if(req.body.Board[i][j]){
          for(let ii = i-1; ii <= i+1; ii++){
            for(let jj = j-1; jj <= j+1; jj++){
              if(((ii !== i || jj !== j) && (ii >= 0 && ii < 100 && jj >= 0 && jj < 100))){
                if(req.body.Board[ii][jj]){
                  count++
                }
              }
            }
          }
          if (count < 2 || count > 3){
            appdata[i][j] = false
          }
          else{
            appdata[i][j] = true
          }
        }
        else{
          for(let ii = i-1; ii <= i+1; ii++){
            for(let jj = j-1; jj <= j+1; jj++){
              if(((ii != i || jj != j) && (ii >= 0 && ii < 100 && jj >= 0 && jj < 100))){
                if(req.body.Board[ii][jj]){
                  count++
                }
              }
            }
          }
          if (count == 3){
            appdata[i][j] = true
          }
          else{
            appdata[i][j] = false
          }

        }
      }
    }
    res.json(appdata)
})

app.get( '/', (req,res) => {
  res.render( 'index' )
})

app.listen( process.env.PORT || 3000)	