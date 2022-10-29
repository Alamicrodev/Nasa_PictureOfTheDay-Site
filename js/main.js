// setting up cleave for special input for date 
var cleave = new Cleave('#dateInput', {
    date: true,
    delimiter: '-',
    datePattern: ['Y', 'm', 'd']
});


// stores previously searched images
let prevImages;

// get prevImages if exist
if (localStorage.getItem("prevImages") != undefined) {
    prevImages = JSON.parse(localStorage.getItem("prevImages"))
}
else 
// otherwise create new var in localstoreage called prevImages
{
    localStorage.setItem("prevImages", "[]")
    prevImages = []
}


// elements to be used
let dateInput = document.getElementById("dateInput")
let submitDateBtn = document.getElementById("submitDate")
let prevImagesList = document.getElementById("prevImagesList")
let clearPrevImagesBtn = document.getElementById("clearPrevImages")

let imageElement = document.getElementById("imageOTD")
let imageDateShower = document.getElementById("imageOTDdate")
let imageTitleShower = document.getElementById("imageOTDTitle")
let imageSummaryShower = document.getElementById("imageOTDSummary")
let videoElement = document.getElementById("videoOTD")

// get image from api function
function getImage(date = dateInput.value) {

    // // user's input date
    // let date = dateInput.value

    console.log(date)

    let urlParams = new URLSearchParams({
        "date" : date,
        "api_key": "3DWK6M16nYk9psCed3UPbDgAIuoIFtDKRL1hQwPe"
    })

    // using fetch api to make api calls
    fetch("https://api.nasa.gov/planetary/apod?"+urlParams).then((res) => {
        if (res.ok) {
            return res.json()
        }
        else {
            // we show a toast using toastify library (imported from online)
            Toastify({
                text: "Please recheck your date, It may be wrong!",
                duration: 3000,
                style: {
                    background: "rgba( 250, 0, 0, 0.3 )",
                    boxShadow: "none"
                  },
                gravity: "bottom", // `top` or `bottom`
                position: "left"
                }).showToast();
        }
    }).then((data) => {
        // data recieved can be an image or a video 
        if (data.media_type == "image") {

            videoElement.style.visibility = "hidden";
            videoElement.style.display = "none";
            imageElement.style
            .visibility = "visible"
            imageElement.style.display = "block"
            imageElement.src = data.hdurl

            // checking if the searched image is already in prev stored images if so removes it   
            let inPrevImagesAlready = prevImages.findIndex((image) => {
                return image.date == data.date
            })

            if (inPrevImagesAlready >= 0){
               prevImages.splice(inPrevImagesAlready,1)
            }


            // adds it again to the begining 
            prevImages.unshift({
                "date": data.date,
                "media_type": "image",
               "title": data.title,
               "explanation": data.explanation,
               "url": data.url
            })
          
            // setting the image as a body background
            document.querySelector("body").style.background = `url(${data.hdurl}) center/cover no-repeat fixed`
        } 
       else 
       {
            imageElement.style.visibility = "hidden"
            imageElement.style.display = "none"
            videoElement.style.visibility = "visible"
            videoElement.style.display = "block"
            videoElement.src = data.url

            prevImages.unshift({
                "date": data.date,
                "media_type": "video",
               "title": data.title,
               "explanation": data.explanation,
               "url": data.url
            })
           
            // setting hardcoded image as a body background incase it is a video
            document.querySelector("body").style.background = `url("https://apod.nasa.gov/apod/image/2210/M31Clouds_Fryhover_3054.jpg") center/cover no-repeat fixed`
            
       }

       //pushin info about image to the dom. 
       imageTitleShower.innerText = data.title
       imageSummaryShower.innerText = data.explanation
       imageDateShower.innerText = data.date
      
       //setting prevImages in localStorage    
       localStorage.setItem("prevImages", JSON.stringify(prevImages))

       //refereshing prevImages    
       getprevImages()

    }).catch(
        (err) => {
            console.log("No internet Connection:",err)
        }
    )
}


// scrolls to image about on page
let scrollToImageInfo = () => {
    document.getElementById("imageContainer").scrollIntoView({behavior: "smooth", block:"center"});
}

// on enter pressed white typing date
dateInput.onkeyup = (event) => {
    if (event.keyCode == 13) {
        getImage()
        scrollToImageInfo()
    }
}
submitDateBtn.onclick = () => {
    getImage()
    scrollToImageInfo()
    
}



// loads and appends prev images to prevImagesListItem
function getprevImages() {
    // clearing the unordered list in dom
    prevImagesList.innerHTML = ""

    prevImages.forEach(element => {
         let listItem = document.createElement("li")

         //attributes of the item(image/video)  
         let itemTitle = document.createElement("h4")
         let itemDate = document.createElement("span")
         let itemImage = document.createElement("img")
         let itemVideo = document.createElement("iframe")
         
         //getting that image if its clicked  
         listItem.onclick = () => {
           getImage(element.date)
           scrollToImageInfo()
         }
         
         if (element.media_type == "image") {
            itemImage.src = element.url
            itemImage.alt = element.title
            listItem.appendChild(itemImage)
         }
         else {
            itemVideo.src = element.url
            listItem.appendChild(itemVideo)
         }
         
         //adding values to elements  
         itemTitle.innerText = element.title
         itemDate.innerText = element.date
         
         //appending elements to listitem 
         listItem.appendChild(itemTitle)
         listItem.appendChild(itemDate)

         //appending list items to prev images list   
         prevImagesList.appendChild(listItem)
    });

    // jugaad incase we have no images saved in local storage. 
    if (prevImages.length == 0) {
        prevImagesList.innerText = "Local Storage is empty."
    }

}


// to empty local storage and prev saved images 
clearPrevImagesBtn.onclick = () => {
    prevImages = []
    localStorage.setItem("prevImages", "[]")
    getprevImages()
}


// on site load we want to load today's image and prev images. 
getprevImages()
getImage() 