const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Re:Plate</title></head><body style="margin:0"><iframe src="https://replate-peach.vercel.app" style="width:100vw;height:100vh;border:none"></iframe></body></html>`)
})

app.listen(port, () => console.log('Re:Plate running on port ' + port))