



document.querySelector('button').addEventListener("click", async () => {
  console.log("converting")
  const file = document.querySelector('input').files[0]
  

  const buffer = await getAudioBufferFromFile(file)

  const blob = await convertBufferToOgg(buffer)

  const url = URL.createObjectURL(blob)
  document.querySelector("div").innerHTML += "<audio controls src='" + url + "'></audio>"

  
}, false)