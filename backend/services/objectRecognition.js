// Takes a base64 jpeg image, makes a call to the Edamam API, and
// returns the name and quantity of the food item


// Makes a call to the Edamam API
async function postData(url, reqBody) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reqBody),
  });

  if(response.status == 555) {
    console.error(`HTTP error; status: ${response.status}`);
    return [{"error": "Food item could not be identified"}]
  } else if (!response.ok) {
      console.error(`HTTP error; status: ${response.status}`);
      return [{"error": "Edamam API error"}]
  }

  return response.json();
}


// Sets up the API call and returns the relevant data from the response
async function getProductFromObj(imageData) {
  const app_id = process.env.APP_ID;
  const app_key = process.env.APP_KEY;
  const url = `https://api.edamam.com/api/food-database/nutrients-from-image?app_id=${app_id}&app_key=${app_key}&beta=true`;
  const reqBody = {"image": imageData};
  const result = await postData(url, reqBody);

  if(Object.keys(result)[0] !== "error") {
    const foodContents = result.parsed.food.foodContentsLabel;
    const foodCounts = parseFoodContents(foodContents);
    return foodCounts;
  } else {
      return result;
  }

}


// Parses the food contents into [{ itemName: str, quantity: int}]
function parseFoodContents(foodContents) {
  const foodContentsList = foodContents.split(",").map(item => item.trim());
  const foodCounts = foodContentsList.reduce((accumulator, currentValue) => {
    accumulator[currentValue] = (accumulator[currentValue] || 0) + 1;
    return accumulator;
  }, {});

  // Put the result in an array
  const foodList = Object.entries(foodCounts).map(([itemName, quantity]) => ({
    itemName,
    quantity
  }));


  return foodList;
}


module.exports = { getProductFromObj };

