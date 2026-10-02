// =====================================================
// DAILY ACTIVITY TRACKER
// Frontend + Node.js + Express + MongoDB
// =====================================================

const API_URL = "http://localhost:5000/api/activities";
const AUTH_API_URL = "http://localhost:5000/api";

let editingId = null;


// =====================================================
// AUTH SERVICE
// MongoDB based Authentication
// =====================================================

const AuthService = {

    async register(user) {

        const response = await fetch(`${AUTH_API_URL}/register`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(user)

        });

        const data = await response.json();

        if (!response.ok) {

            return {
                success: false,
                message: data.message || "Registration failed."
            };

        }

        return {
            success: true,
            message: data.message,
            user: data.user
        };
    },


    async login(username, password) {

        const response = await fetch(`${AUTH_API_URL}/login`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username: username,
                password: password
            })

        });

        const data = await response.json();

        if (!response.ok) {

            return {
                success: false,
                message: data.message || "Invalid username or password."
            };

        }

        // Store only logged-in user information
        // Password is NOT stored in localStorage
        localStorage.setItem(
            "currentUser",
            JSON.stringify(data.user)
        );

        return {
            success: true,
            user: data.user
        };
    },


    logout() {

        localStorage.removeItem("currentUser");

    },


    getCurrentUser() {

        return JSON.parse(
            localStorage.getItem("currentUser")
        );

    },


    isLoggedIn() {

        return !!this.getCurrentUser();

    }

};


// =====================================================
// ACTIVITY SERVICE
// =====================================================

const ActivityService = {

    // GET - Read activities
    async getAll() {

        const response = await fetch(API_URL);

        if (!response.ok) {

            throw new Error(
                "Failed to load activities"
            );

        }

        return await response.json();

    },


    // POST - Add activity
    async add(activity) {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(activity)

        });

        if (!response.ok) {

            throw new Error(
                "Failed to add activity"
            );

        }

        return await response.json();

    },


    // PUT - Update activity
    async update(id, data) {

        const response = await fetch(
            `${API_URL}/${id}`,
            {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)

            }
        );

        if (!response.ok) {

            throw new Error(
                "Failed to update activity"
            );

        }

        return await response.json();

    },


    // DELETE - Delete activity
    async delete(id) {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {

            throw new Error(
                "Failed to delete activity"
            );

        }

        return await response.json();

    }

};


// =====================================================
// TOAST
// =====================================================

function toast(message) {

    const container =
        document.getElementById("toasts");

    if (!container) {

        alert(message);

        return;

    }


    const toastElement =
        document.createElement("div");

    toastElement.className = "toast";

    toastElement.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;

    container.appendChild(toastElement);


    setTimeout(() => {

        toastElement.remove();

    }, 2500);

}


// =====================================================
// ROUTING
// =====================================================

function showPage(page) {

    document.querySelectorAll(".page")
        .forEach(section => {

            section.classList.remove("active");

        });


    const selectedPage =
        document.getElementById(page);


    if (selectedPage) {

        selectedPage.classList.add("active");

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (page === "dashboard") {

        renderDashboard();

    }


    if (page === "tracker") {

        renderTracker();

    }


    if (page === "progress") {

        renderProgress();

    }


    if (page === "profile") {

        renderProfile();

    }

}


function navigate(page) {

    window.location.hash = page;

    showPage(page);

}


function loadPageFromHash() {

    let page =
        window.location.hash.substring(1);


    if (!page) {

        page = "home";

    }


    showPage(page);

}


// =====================================================
// DASHBOARD
// =====================================================

async function renderDashboard() {

    try {

        const activities =
            await ActivityService.getAll();


        const total =
            activities.length;


        const completed =
            activities.filter(
                activity => activity.done
            ).length;


        const pending =
            total - completed;


        const percentage =
            total === 0
                ? 0
                : Math.round(
                    (completed / total) * 100
                );


        const dTotal =
            document.getElementById("dTotal");

        const dDone =
            document.getElementById("dDone");

        const dPend =
            document.getElementById("dPend");

        const dPct =
            document.getElementById("dPct");

        const dDonutPct =
            document.getElementById("dDonutPct");


        if (dTotal) {

            dTotal.textContent = total;

        }


        if (dDone) {

            dDone.textContent = completed;

        }


        if (dPend) {

            dPend.textContent = pending;

        }


        if (dPct) {

            dPct.textContent =
                percentage + "%";

        }


        if (dDonutPct) {

            dDonutPct.textContent =
                percentage + "%";

        }


        const heroTotal =
            document.getElementById("heroTotal");

        const heroDone =
            document.getElementById("heroDone");

        const heroPend =
            document.getElementById("heroPend");

        const heroPct =
            document.getElementById("heroPct");


        if (heroTotal) {

            heroTotal.textContent = total;

        }


        if (heroDone) {

            heroDone.textContent = completed;

        }


        if (heroPend) {

            heroPend.textContent = pending;

        }


        if (heroPct) {

            heroPct.textContent =
                percentage + "%";

        }


        renderRecentActivities(activities);


    } catch (error) {

        console.error(error);

        toast(
            "Cannot connect to backend."
        );

    }

}


// =====================================================
// RECENT ACTIVITIES
// =====================================================

function renderRecentActivities(activities) {

    const container =
        document.getElementById("dRecent");


    if (!container) {

        return;

    }


    if (activities.length === 0) {

        container.innerHTML = `
            <div class="empty-state">

                <i class="fas fa-calendar-check"></i>

                <p>No activities yet.</p>

            </div>
        `;

        return;

    }


    const recent =
        activities.slice(-5).reverse();


    container.innerHTML =
        recent.map(activity => `

        <div class="activity-item">

            <div class="activity-info">

                <h4>${activity.text}</h4>

                <p>

                    <i class="far fa-calendar"></i>

                    ${activity.when || "Today"}

                </p>

            </div>


            <span class="status ${
                activity.done
                    ? "completed"
                    : "pending"
            }">

                ${
                    activity.done
                        ? "Completed"
                        : "Pending"
                }

            </span>

        </div>

    `).join("");

}


// =====================================================
// TRACKER
// =====================================================

async function renderTracker() {

    try {

        const activities =
            await ActivityService.getAll();


        const container =
            document.getElementById("actList");


        if (!container) {

            return;

        }


        if (activities.length === 0) {

            container.innerHTML = `
                <div class="empty-state">

                    <i class="fas fa-tasks"></i>

                    <h3>No activities found</h3>

                    <p>
                        Add your first daily activity.
                    </p>

                </div>
            `;

            return;

        }


        container.innerHTML =
            activities.map(activity => `

            <div
                class="activity-item"
                data-id="${activity._id}"
            >

                <div class="activity-info">

                    <h4 class="${
                        activity.done
                            ? "completed-text"
                            : ""
                    }">

                        ${activity.text}

                    </h4>


                    <p>

                        <i class="far fa-calendar"></i>

                        ${activity.when || "Today"}

                    </p>

                </div>


                <div class="activity-actions">

                    <button
                        class="complete-btn"
                        data-action="toggle"
                        data-id="${activity._id}"
                        title="Complete / Pending"
                    >

                        <i class="fas ${
                            activity.done
                                ? "fa-undo"
                                : "fa-check"
                        }"></i>

                    </button>


                    <button
                        class="edit-btn"
                        data-action="edit"
                        data-id="${activity._id}"
                        title="Edit"
                    >

                        <i class="fas fa-edit"></i>

                    </button>


                    <button
                        class="delete-btn"
                        data-action="delete"
                        data-id="${activity._id}"
                        title="Delete"
                    >

                        <i class="fas fa-trash"></i>

                    </button>

                </div>


                <span class="status ${
                    activity.done
                        ? "completed"
                        : "pending"
                }">

                    ${
                        activity.done
                            ? "Completed"
                            : "Pending"
                    }

                </span>

            </div>

        `).join("");


    } catch (error) {

        console.error(error);

        toast(
            "Cannot load activities."
        );

    }

}


// =====================================================
// ADD / EDIT ACTIVITY
// =====================================================

async function saveActivity() {

    const textInput =
        document.getElementById("actText");


    const dateInput =
        document.getElementById("actDate");


    if (!textInput) {

        return;

    }


    const text =
        textInput.value.trim();


    const when =
        dateInput && dateInput.value
            ? dateInput.value
            : "Today";


    if (!text) {

        toast(
            "Please enter an activity."
        );

        return;

    }


    try {

        if (editingId !== null) {

            await ActivityService.update(

                editingId,

                {
                    text: text,
                    when: when
                }

            );


            toast(
                "Activity updated successfully!"
            );


            editingId = null;


        } else {

            await ActivityService.add({

                text: text,

                when: when,

                done: false

            });


            toast(
                "Activity added successfully!"
            );

        }


        textInput.value = "";


        if (dateInput) {

            dateInput.value = "";

        }


        const button =
            document.getElementById("actSave");


        if (button) {

            button.innerHTML = `
                <i class="fa-solid fa-plus"></i>
                <span>Add Activity</span>
            `;

        }


        await renderTracker();

        await renderDashboard();

        await renderProgress();


    } catch (error) {

        console.error(error);

        toast(
            "Something went wrong."
        );

    }

}


// =====================================================
// EDIT ACTIVITY
// =====================================================

async function editActivity(id) {

    try {

        const activities =
            await ActivityService.getAll();


        const activity =
            activities.find(
                item => item._id === id
            );


        if (!activity) {

            return;

        }


        const textInput =
            document.getElementById("actText");


        const dateInput =
            document.getElementById("actDate");


        if (textInput) {

            textInput.value =
                activity.text;

        }


        if (dateInput) {

            dateInput.value =
                activity.when === "Today"
                    ? ""
                    : activity.when;

        }


        editingId = id;


        const button =
            document.getElementById("actSave");


        if (button) {

            button.innerHTML = `
                <i class="fas fa-save"></i>
                <span>Update Activity</span>
            `;

        }


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });


    } catch (error) {

        console.error(error);

        toast(
            "Cannot edit activity."
        );

    }

}


// =====================================================
// TOGGLE COMPLETE / PENDING
// =====================================================

async function toggleActivity(id) {

    try {

        const activities =
            await ActivityService.getAll();


        const activity =
            activities.find(
                item => item._id === id
            );


        if (!activity) {

            return;

        }


        await ActivityService.update(

            id,

            {
                done: !activity.done
            }

        );


        toast(

            activity.done
                ? "Activity marked as pending."
                : "Activity completed!"

        );


        await renderTracker();

        await renderDashboard();

        await renderProgress();


    } catch (error) {

        console.error(error);

        toast(
            "Cannot update activity."
        );

    }

}


// =====================================================
// DELETE ACTIVITY
// =====================================================

async function deleteActivity(id) {

    if (!confirm(
        "Are you sure you want to delete this activity?"
    )) {

        return;

    }


    try {

        await ActivityService.delete(id);


        toast(
            "Activity deleted successfully!"
        );


        await renderTracker();

        await renderDashboard();

        await renderProgress();


    } catch (error) {

        console.error(error);

        toast(
            "Cannot delete activity."
        );

    }

}


// =====================================================
// ACTIVITY BUTTON HANDLER
// =====================================================

document.addEventListener(
    "click",
    async function(event) {

        const button =
            event.target.closest("[data-action]");


        if (!button) {

            return;

        }


        const action =
            button.dataset.action;


        const id =
            button.dataset.id;


        if (action === "toggle") {

            await toggleActivity(id);

        }


        else if (action === "edit") {

            await editActivity(id);

        }


        else if (action === "delete") {

            await deleteActivity(id);

        }

    }
);


// =====================================================
// PROGRESS
// =====================================================

async function renderProgress() {

    try {

        const activities =
            await ActivityService.getAll();


        const total =
            activities.length;


        const completed =
            activities.filter(
                activity => activity.done
            ).length;


        const percentage =
            total === 0
                ? 0
                : Math.round(
                    (completed / total) * 100
                );


        const dayText =
            document.getElementById("pDayT");


        const dayBar =
            document.getElementById("pDay");


        if (dayText) {

            dayText.textContent =
                percentage + "%";

        }


        if (dayBar) {

            dayBar.style.width =
                percentage + "%";

        }


    } catch (error) {

        console.error(error);

        toast(
            "Cannot load progress."
        );

    }

}


// =====================================================
// REGISTER - MongoDB
// =====================================================

async function registerUser() {

    const name =
        document.getElementById("rName")?.value.trim();


    const email =
        document.getElementById("rEmail")?.value.trim();


    const mobile =
        document.getElementById("rMobile")?.value.trim();


    const username =
        document.getElementById("rUser")?.value.trim();


    const password =
        document.getElementById("rPass")?.value;


    const confirmPassword =
        document.getElementById("rPass2")?.value;


    // Check fields

    if (
        !name ||
        !email ||
        !mobile ||
        !username ||
        !password ||
        !confirmPassword
    ) {

        toast(
            "Please fill all fields."
        );

        return;

    }


    // Check password

    if (password !== confirmPassword) {

        toast(
            "Passwords do not match."
        );

        return;

    }


    try {

        const result =
            await AuthService.register({

                name: name,

                email: email,

                mobile: mobile,

                username: username,

                password: password

            });


        if (!result.success) {

            toast(
                result.message
            );

            return;

        }


        toast(
            "Registration successful!"
        );


        // Clear fields

        document.getElementById("rName").value = "";

        document.getElementById("rEmail").value = "";

        document.getElementById("rMobile").value = "";

        document.getElementById("rUser").value = "";

        document.getElementById("rPass").value = "";

        document.getElementById("rPass2").value = "";


        // Go to login

        navigate("login");


    } catch (error) {

        console.error(error);

        toast(
            "Cannot connect to backend."
        );

    }

}


// =====================================================
// LOGIN - MongoDB
// =====================================================

async function loginUser() {

    const username =
        document.getElementById("lUser")?.value.trim();


    const password =
        document.getElementById("lPass")?.value;


    if (!username || !password) {

        toast(
            "Please enter username and password."
        );

        return;

    }


    try {

        const result =
            await AuthService.login(

                username,

                password

            );


        if (!result.success) {

            toast(
                result.message
            );

            return;

        }


        toast(
            "Login successful!"
        );


        // Clear login fields

        document.getElementById("lUser").value = "";

        document.getElementById("lPass").value = "";


        // Go to dashboard

        navigate("dashboard");


    } catch (error) {

        console.error(error);

        toast(
            "Cannot connect to backend."
        );

    }

}


// =====================================================
// LOGOUT
// =====================================================

function logoutUser() {

    AuthService.logout();

    toast(
        "Logged out successfully!"
    );

    navigate("home");

}


// =====================================================
// PROFILE
// =====================================================

function renderProfile() {

    const user =
        AuthService.getCurrentUser();


    if (!user) {

        return;

    }


    const nameElement =
        document.getElementById("pName");


    const emailElement =
        document.getElementById("pEmail");


    const mobileElement =
        document.getElementById("pMobile");


    const usernameElement =
        document.getElementById("pUser");


    const avatarElement =
        document.getElementById("pAvatar");


    if (nameElement) {

        nameElement.textContent =
            user.name || "";

    }


    if (emailElement) {

        emailElement.textContent =
            user.email || "";

    }


    if (mobileElement) {

        mobileElement.textContent =
            user.mobile || "";

    }


    if (usernameElement) {

        usernameElement.textContent =
            user.username || "";

    }


    if (avatarElement) {

        avatarElement.textContent =
            (user.name || "U")
                .charAt(0)
                .toUpperCase();

    }

}


// =====================================================
// INITIALIZE
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {


        // Activity button

        const saveButton =
            document.getElementById("actSave");


        if (saveButton) {

            saveButton.addEventListener(
                "click",
                saveActivity
            );

        }


        // Register button

        const registerButton =
            document.getElementById("rBtn");


        if (registerButton) {

            registerButton.addEventListener(
                "click",
                registerUser
            );

        }


        // Login button

        const loginButton =
            document.getElementById("lBtn");


        if (loginButton) {

            loginButton.addEventListener(
                "click",
                loginUser
            );

        }


        // Logout button

        const logoutButton =
            document.getElementById("logout");


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                logoutUser
            );

        }


        // Page navigation

        window.addEventListener(
            "hashchange",
            loadPageFromHash
        );


        // Load current page

        loadPageFromHash();

    }
);