const express = require('express'),
      app     = express(),
      cors    = require('cors')

app.use( cors() )
app.use( express.static('public') )
app.listen( 3000 )