import {get_id, create_el, string, cl, headers} from "https://rawgit.com/stevedoesitall/ditkojs/master/ditko.js";

//Force the site to load in HTTPS
function secure() {
    if (window.location.href.substr(0,5) != "https" && window.location.href.indexOf("http://localhost:") == -1) {
        window.location.href = "https://list-add.herokuapp.com/";
    }
};

window.onload = secure();

const submit_button = get_id("submit_button");
let total_submissions = 0;

let email;
document.addEventListener("click", function clean_email() {
    email = get_id("email").value;
    if (email) {
        const at_pos = email.indexOf("@");
        if (at_pos > 0) {
            get_id("email").value = email.substring(0,at_pos);
            email = email.substring(0,at_pos);
        }
        get_id("email").value = email.toLowerCase();
        email = email.toLowerCase();
    }
});

submit_button.addEventListener("click", function submit_email() {
    if (!email) {
        alert("Please enter an email address.");
        return false;
    }

    total_submissions = total_submissions + 1;
    cl(email);
    submit_button.innerHTML = "Another";

    fetch("/server", {
        method: "post",
        headers: headers,
        body: string({id: email})
    })
    .then(
        function(response) {
            if (response.status != 200) {
                cl("Error: " + response.status);
                alert("Something went wrong. Please try again.")
                return;
            }
        response.json().then(
            function(resp_data) {
            const response = resp_data.response;
            cl(response);
            let i = 1;
            
            if (total_submissions > 1) {
                get_id("response").innerHTML = "";
            }

            response.forEach(user => {
                const p = create_el("p");
                const ul = create_el("ul");
                const div = create_el("div");

                const user_lists = Object.keys(user.lists);
                p.innerHTML = `${i}. ${user.id}'s source is ${user.vars.source} has been added to:`
                user_lists.forEach(list => {
                    const li = create_el("li");
                    li.innerHTML = list;
                    ul.appendChild(li);
                });
                div.appendChild(p).appendChild(ul);
                get_id("response").appendChild(div);

                i = i + 1;
            });
        })
    })
});