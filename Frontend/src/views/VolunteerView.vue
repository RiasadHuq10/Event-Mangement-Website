<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from "vue-router";
import { jwtDecode } from "jwt-decode";

const events = ref([])
const router = useRouter();
const route = useRoute();
const page = ref(1);
const perPage = ref(6);
const loading = ref(false);
const total = ref(0);
const token = localStorage.getItem('token');
const userType = ref('');
const userID = ref('');
const totalPages = ref(0);

const loadUser = async () => {
    try {
        // Get the token from local storage    
        // decode jwt token
        const decoded = jwtDecode(token);
        console.log(decoded);
        userType.value = `${decoded.type}`;
        userID.value = `${decoded._id}`

        // Send a request to the endpoint with the token in the Authorization header



        // convert the response to json
        // const json = await response.json();
        // // log the json
        // console.log(json);
        // // set the data
        // users.value = json;
    } catch (error) {
        console.log(error);
    }
};
const volunteer = ref({

    email: '',
    password: '',
    name: '',
    age: '',
    contact: 1,
    about: '',
    terms: false,
})
const getEvents = () => {

    let params = [`page=${page.value}`, `volunteerID=${route.params.id}`]

    params = params.join('&')
    loading.value = true
    fetch(`/api/volEvent?${params}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
        .then((response) => {
            if (!response.ok) {
                alert(JSON.stringify("Unauthorised you are not an admin"));
            } return response.json()
        })
        .then((result) => {

            events.value = result.events
            total.value = result.total
            loading.value = false
            perPage.value = result.perPage

        })
        .catch((error) => {

            totalPages.value = 0
            events.value = []
            loading.value = false
            throw error
        })
}

const submitVolunteer = async function () {
    var url = '/api/volunteers';
    var method = 'POST';
    var response;
    if (route.name == 'edit-volunteer') {
        url = url + '/' + volunteer.value._id;
        method = 'PUT';
        // submit the volunteer to the backend
        response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,

            },
            body: JSON.stringify(volunteer.value)
        });
        if (!response.ok) {
            alert(JSON.stringify("Unauthorised you are not an admin"));
        }
    }
    else {
        response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(volunteer.value)
        });
        if (!response.ok) {
            alert(JSON.stringify("Unauthorised you are not an admin"));
        }
    }


    // convert the response to json
    const json = await response.json();
    // log the json
    console.log(json);
    // alert the user
    alert(JSON.stringify(json));
}
// a function to get the volunteer from the backend
const getVolunteer = async function () {
    // get the volunteer from the backend
    const response = await fetch('/api/volunteers/' + route.params.id, {
        headers: {
            Authorization: `Bearer ${token}`,

        }
    });
    if (!response.ok) {
        alert(JSON.stringify("Unauthorised you are not an admin"));
    }
    // convert the response to json
    const json = await response.json();
    // log the json
    console.log(json);
    // set the volunteer, copy by value instead of reference
    volunteer.value = { ...json };
    // Wait for the change to get flushed to the DOM
    await nextTick();

}

onMounted(async () => {
    // if there is an id in the route
    loadUser();
    if (route.params.id) {
        getVolunteer();
        getEvents();
    }
});
const deleteVolunteer = async function () {

    // post the Volunteer to the backend
    const response = await fetch('/api/volunteers/' + volunteer.value._id, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        alert(JSON.stringify("Unauthorised you are not an admin"));
    }
    // convert the response to json
    const json = await response.json();
    // log the json
    console.log(json);
    // alert the user
    alert(JSON.stringify(json));
    // redirect to the home page
    router.push('/');
}
const exitEvent = async function (eventID) {
    // post the Volunteer to the backend
    let params = [`eventID=${eventID}`, `volunteerID=${volunteer.value._id}`]
    params = params.join('&')
    

    const response = await fetch(`/api/volEvent?${params}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },

    });
    // convert the response to json
    const json = await response.json();
    // log the json
    console.log(json);
    // alert the user
    alert(JSON.stringify(json));
    // redirect to the home page
    router.push('/');
}
const onPageChange = (p) => {
    page.value = p;
    getEvents();
};

</script>


<template>
    <main>

        <div class="row my-4" style="margin: 20px;">

            <div class="col-6">

                <nav aria-label="breadcrumb ">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item">
                            <RouterLink to="/">Home</RouterLink>
                        </li>
                        <li class="breadcrumb-item">
                            <RouterLink to="/volunteers">Volunteers</RouterLink>
                        </li>
                        <li class="breadcrumb-item active" aria-current="page" v-if="route.name == 'become-volunteer'">
                            Become Volunteer
                        </li>
                        <li class="breadcrumb-item active" aria-current="page" v-if="route.name == 'create-volunteer'">
                            Edit
                        </li>
                        <li class="breadcrumb-item active" aria-current="page" v-if="route.name == 'edit-volunteer'">Edit
                        </li>

                    </ol>
                </nav>
            </div>

            <form class="col-6 text-end" @submit.prevent="submitVolunteer" v-if="route.name == 'edit-volunteer'">

                <button type="button" class="btn btn-danger" style="background-color: red;margin-top: 5px; "
                    v-on:click="deleteVolunteer">
                    Delete
                </button>
            </form>


        </div>

        <div class="row .container" style="margin: 30px;">
            <div class="col-lg-6 col-md-12">

                <form class="row" @submit.prevent="submitVolunteer">

                    <div class="mb-3">
                        <label for="exampleInputEmail1" class="form-label">Email address</label>
                        <input type="email" class="form-control" id="email" aria-describedby="emailHelp" name="email"
                            v-model="volunteer.email" required>
                    </div>
                    <div class="mb-3">
                        <label for="exampleInputPassword1" class="form-label">Password</label>
                        <input type="password" class="form-control" id="password" name="password"
                            v-model="volunteer.password" required>
                    </div>
                    <div class="mb-3">
                        <label for="exampleInputName1" class="form-label">Name</label>
                        <input type="text" class="form-control" id="name" name="name" v-model="volunteer.name" required>
                    </div>
                    <div class="mb-3">
                        <label for="exampleInputContace1" class="form-label">Contact</label>
                        <input type="number" class="form-control" id="contact" name="contact" min="10000000" max="99999999"
                            v-model="volunteer.contact" required>
                    </div>


                    <div class="row mb-3">
                        <label class="col-sm-2 col-form-label">Age Group</label>
                        <select class="form-select" aria-label="Default select example" name="age" required
                            v-model="volunteer.age" style="width: 800px;">
                            <option selected>Select Age</option>
                            <option value="18-30">18-30</option>
                            <option value="30-50">30-50</option>
                            <option value="50+">50+</option>
                        </select>
                    </div>


                    <div class="mb-3">
                        <label for="exampleFormControlTextarea1" class="form-label">About me and remark</label>
                        <textarea class="form-control" id="about" name="about" rows="3"
                            v-model="volunteer.about"></textarea>
                    </div>

                    <div class="mb-3 form-check">
                        <input type="checkbox" class="form-check-input" id="exampleCheck1" name="terms"
                            v-model="volunteer.terms" required>
                        <label class="form-check-label" for="exampleCheck1">Agree to terms and conditions</label>
                    </div>
                    <div class="text-end" v-if="route.name == 'become-volunteer'">
                        <button type="submit" class="end-0 btn btn-primary ">Register</button>
                    </div>
                    <div class="text-end" v-if="route.name != 'become-volunteer'">
                        <button type="submit" class="end-0 btn btn-primary ">Save</button>
                    </div>

                </form>

            </div>


            <div class=" col-lg-6 col-md-12 card " style="height: 600px; display: flex;"
                v-if="route.name == 'become-volunteer'">
                <img src="../assets/cardimg.png" class="card-img-top" alt="..." style="object-fit:fill">
                <div class="card-body">
                    <h5 class="card-title">Become a volunteer</h5>
                    <p class="card-text">Your time and talent can make a real difference in people's lives</p>
                </div>

            </div>
            <div class=" col-lg-6 col-md-12  " v-if="route.name == 'edit-volunteer'">
                <section>

                    <o-table :data="events" :loading="loading" paginated backend-pagination :total="total"
                        :per-page="perPage" aria-next-label="Next page" aria-previous-label="Previous page"
                        aria-page-label="Page" aria-current-label="Current page" backend-sorting
                        :default-sort-direction="defaultSortOrder" :default-sort="[sortField, sortOrder]"
                        @page-change="onPageChange" @sort="onSort">

                        <o-table-column v-slot="props" field="eventID" label="Event Title">
                            {{ props.row.events[0].event }}
                        </o-table-column>

                        <o-table-column v-slot="props" field="eventID" label="Action">
                            <span class="tag" >
                                <button type="button" class="btn " style="background-color: gray;margin-top: 5px; "
                                    @click="$router.push('/event/' + props.row.events[0]._id)">
                                    Edit
                                </button>
                            </span>
                            <span class="tag">
                                <button type="button" class="btn ms-2" style="background-color: red;margin-top: 5px; "
                                    @click="exitEvent(props.row.events[0]._id)">
                                    X
                
                                </button>
                            </span>
                        </o-table-column>

                    </o-table>
                </section>


            </div>


        </div>




    </main>
</template>

