<script setup>
import { ref, onMounted, nextTick} from "vue"
import { useRoute } from "vue-router";// add watch
//import { ref, onMounted } from "vue";
import { jwtDecode } from "jwt-decode";

import { formatDistanceStrict } from 'date-fns'

import DonutChart from '../components/DonutChart.vue'

const route = useRoute()
const volunteer = ref({

    email: '',
    password: '',
    name: '',
    age: '',
    contact: 1,
    about: '',
    terms: false,
})
const token = localStorage.getItem('token');



const events = ref([])
const totalPages = ref(0)
const total = ref(0)
const loading = ref(false)
let page = ref(1)
let perPage = ref(3)

const search = ref('')
const userType = ref('');
const userID = ref('');

// a function to get the volunteer from the backend
const getMyself = async function () {
    // get the volunteer from the backend
    const response = await fetch('/api/volunteers/get/Myself', {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    });
    if(!response.ok)
    {
        alert(JSON.stringify("Unauthorised you are not a volunteer"));
    }
    // convert the response to json
    const json = await response.json();
    // log the json
    console.log(json);
    // set the volunteer, copy by value instead of reference
    volunteer.value = { ...json };
    // Wait for the change to get flushed to the DOM
    // await nextTick();

}

const submitVolunteer = async function () {
    var url = '/api/volunteers/update/Myself';
    var method = 'PUT';

    // submit the volunteer to the backend
    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,

        },
        body: JSON.stringify(volunteer.value)
    });
    if(!response.ok)
    {
        alert(JSON.stringify("Unauthorised you are not a volunteer"));
    }
    // convert the response to json
    const json = await response.json();
    // log the json
    console.log(json);
    // alert the user
    alert(JSON.stringify(json));
}

const loadUser = async () => {
    try {
        // Get the token from local storage    
        // decode jwt token
        const decoded = jwtDecode(token);
        console.log(decoded);
        userType.value = `${decoded.type}`;
        userID.value = `${decoded._id}`

        // Send a request to the endpoint with the token in the Authorization header



        // // convert the response to json
        // const json = await response.json();
        // // log the json
        // console.log(json);
        // // set the data
        // users.value = json;
    } catch (error) {
        console.log(error);
    }
};
const getEvents = () => {

    let params = [`page=${page.value}`, `perPage=${perPage.value}`]

    params = params.join('&')
    loading.value = true

    fetch(`/api/volEvent/MyEvent?${params}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
    .then((response) => {
            if (!response.ok) {
                alert(JSON.stringify("Unauthorised you are not a volunteer"));
            } return response.json()
        })
        .then((result) => {

            events.value = result.events
            total.value = result.total
            totalPages.value = Math.ceil(total.value / perPage.value)
            loading.value = false

        })
        .catch((error) => {

            totalPages.value = 0
            events.value = []
            loading.value = false
            throw error
        })
}

const onPageChange = (p) => {
    page.value = p

    getEvents()

}
onMounted(() => {

    search.value = route.params.search

    loadUser()
    getMyself()
    getEvents()

})

</script>

<template>
    <main>
    <div class="row .container" style="margin: 30px;">
        <div class="col-lg-8 col-md-12">

            <form class="row" @submit.prevent="submitVolunteer">

                <div class="mb-3 col-lg-6 col-md-12">
                    <label for="exampleInputEmail1" class="form-label">Email address</label>
                    <input type="email" class="form-control" id="email" aria-describedby="emailHelp" name="email"
                        v-model="volunteer.email" required>
                </div>
                <div class="mb-3 col-lg-6 col-md-12">
                    <label for="exampleInputPassword1" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" name="password" v-model="volunteer.password"
                        required>
                </div>
                <div class="mb-3 col-lg-6 col-md-12">
                    <label for="exampleInputName1" class="form-label">Name</label>
                    <input type="text" class="form-control" id="name" name="name" v-model="volunteer.name" required>
                </div>
                <div class="mb-3 col-lg-6 col-md-12">
                    <label for="exampleInputContace1" class="form-label">Contact</label>
                    <input type="number" class="form-control" id="contact" name="contact" min="10000000" max="99999999"
                        v-model="volunteer.contact" required>
                </div>


                <div class="row mb-3 col-lg-6 col-md-12">
                    <label class="col-sm-2 col-form-label">Age Group</label>
                    <select class="form-select" aria-label="Default select example" name="age" required
                        v-model="volunteer.age" style="width: 800px;">
                        <option selected>Select Age</option>
                        <option value="18-30">18-30</option>
                        <option value="30-50">30-50</option>
                        <option value="50+">50+</option>
                    </select>
                </div>


                <div class="mb-3 col-lg-6 col-md-12">
                    <label for="exampleFormControlTextarea1" class="form-label">About me and remark</label>
                    <textarea class="form-control" id="about" name="about" rows="3" v-model="volunteer.about"></textarea>
                </div>


                <div class="text-end">
                    <button type="submit" class="end-0 btn btn-primary ">Save</button>
                </div>

            </form>

        </div>
        <div class="col-lg-4 col-md-12">
            <DonutChart  />
        </div>

        
        <div class=".container" style="margin: 30px;">
            <div class="row">
                <div class="card col-12 col-md-12 col-lg-4" style="margin-top: 5px;" v-for="event in events"
                    :key="event.events[0]._id">
                    <a :href="`/event/${event.events[0]._id}`"><img :src="`${event.events[0].image}`" class="card-img-top"
                            onError="this.onerror=null;this.src='cardimg.png';" style="object-fit:fill;height: 300px;"></a>
                    <div class="card-body">
                        <h5 class="card-title">
                            {{ event.events[0].event }}
                        </h5>
                        <p class="card-text">
                            {{ event.events[0].description }}
                        </p>
                        <small class="text-muted">
                            Last updated

                            {{
                                formatDistanceStrict(new Date(event.modifiedAt), Date.now(), {
                                    addSuffix: true,
                                })
                            }}
                        </small>

                    </div>

                </div>
            </div>
            <nav aria-label="Page navigation" style="margin:10px">
                <ul class="pagination">
                    <li class="page-item" v-for="i in Array.from({ length: totalPages }, (_, i) => i + 1)" :key="i">
                        <a class="page-link" @click="onPageChange(i)">
                            {{ i }}
                        </a>
                    </li>
                </ul>
            </nav>
            
        </div>
    </div>
    </main>
</template>