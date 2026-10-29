
const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
 form.addEventListener("submit", (event) => {
 event.preventDefault();   
  console.log("u clicked the submit button")    // stop the page from reloading
const query = input.value;    // read what the user typed
 console.log("User searched:", query);
  search(query);   // call the search function
});

async function search(query) {
  const url =//
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
    "&gsrsearch=" + encodeURIComponent(query) +
    "&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=300&format=json&origin=*";
const status = document.getElementById("status");
  status.innerHTML = '<div class="spinner"></div> Searching…'; // loading ON
  //showSkeletons();                                            

  const response = await fetch(url);  
  console.log(response)      
    // 1. ask the API
   if (!response.ok) throw new Error(response.status); // 2. did it work?
  const data = await response.json();         // 3. read the JSON
 console.log("data", data.query.pages)  // 4. look at the data;
const items=Object.values(data.query.pages);


 status.textContent = "Showing " + items.length + " results.";
 if (items.length === 0) {
    status.textContent = "No results. Try another search.";  // EMPTY state
  } else {
render(items)}
}


function render(items) {
  const results = document.getElementById("results");
  results.innerHTML = "";                    // clear old results first

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";

    const img = document.createElement("img");
    img.src = item.imageinfo[0].thumburl;    // the picture   results-card-img+title
    img.alt = item.title;

    const caption = document.createElement("p");
    caption.textContent = item.title;        // the title

    card.appendChild(img);
    card.appendChild(caption);
    results.appendChild(card);               // add card to the grid
  });
}