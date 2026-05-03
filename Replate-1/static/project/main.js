const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Re:Plate</title>
  <style>html,body{margin:0;height:100%;}iframe{width:100%;height:100%;border:none;}</style>
</head>
<body>
  <iframe src="https://replate-peach.vercel.app?pod=true" title="Re:Plate"></iframe>
</body>
</html>`)
})

app.listen(port, () => console.log('Re:Plate running on port ' + port))