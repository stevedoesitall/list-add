//Create app using express.js
const port = process.env.PORT || 3000;
const express = require("express");
const body_parser = require("body-parser");
const path = require("path");
const http = require("http");
const app = express();
const server = http.createServer(app);
const dir = path.join(__dirname, "../");

const api_key = process.env.api_key;
const api_secret = process.env.api_secret;

const sailthru = require('sailthru-client').createSailthruClient(api_key, api_secret);

app.use(express.static(dir));
app.use(body_parser.urlencoded({ extended: false }));
app.use(body_parser.json());
app.listen(port, () => console.log("CSM Test App started on port " + port));

app.post("/server", function(req, res) {
    const response_array = [];

    // const id = JSON.parse(req.body.id);
    const id = req.body.id;
    const domain = "@sailthru.com";
    const sources = ["overlay", "facebook", "in_store_signup", "twitter", "sailthru_signup_page", "footer", "forward", "online_checkout", "app", "side_widget"];

    const master_list = "Master List";

    const lists = ["Daily Newsletter", "Daily Deals", "Best of Week", "Sponsored Content", "Tech List", "Entertainment List", "Politics List", "Mens Clothing", "Womens Clothing", "Kids Clothing"];

    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1; //Tick up 1 since January is 0
    const year = date.getFullYear();

    //Add "0" if less than 10 to force a two-digit string

    if (day < 10) {
        day = "0" + day;
    }

    if (month < 10) {
        month = "0" + month;
    }

    const today = `${year}${month}${day}`;

    function shuffle(array) {
        let current_index = array.length, temp_value, random_index;
        while (0 !== current_index) {
        random_index = Math.floor(Math.random() * current_index);
        current_index -= 1;
    
        temp_value = array[current_index];
        array[current_index] = array[random_index];
        array[random_index] = temp_value;
        }
        return array;
    }

    const source_max = sources.length;
    const list_max = lists.length;
    const total_users = 10;

    let x = 1;

    while (x < total_users + 1) {
        const email = `${id}+${today}${x.toString()}${domain}`;
        const random_source = Math.floor(Math.random() * source_max);
        const random_list = Math.floor(Math.random() * list_max + 1);
        
        const shuffled_lists = shuffle(lists);
        const user_lists = shuffled_lists.slice(0, random_list);
        user_lists.push(master_list);
        
        const user_obj = {};
        user_obj.id = email;
        
        user_obj.vars = {};
        user_obj.vars.source = sources[random_source];    

        user_obj.lists = {};
        user_lists.forEach(list => {
            user_obj.lists[list] = 1;
        });

        sailthru.apiPost("user", user_obj,
        function(err, response) {
            if (err) {
                console.log(err);
            }
            else {
                // console.log(user_obj);
                response_array.push(user_obj);
                if (response_array.length == total_users) {
                    res.send({"response": response_array});
                }
            }
        });

        x++;
    };
});