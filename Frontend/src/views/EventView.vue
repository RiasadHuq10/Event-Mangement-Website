<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from "vue-router";
import { jwtDecode } from "jwt-decode";

const router = useRouter();
const route = useRoute();
const volunteers = ref([])
const page = ref(1);
const perPage = ref(6);
const loading = ref(false);
const total = ref(0);

const token = localStorage.getItem('token');

const userType = ref('');
const userID = ref('');

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

const event = ref({

    event: '',
    organiser: '',
    date: '',
    location: '',
    quota: 1,
    description: '',
    image: '',
    highlight: '',
})

const submitEvent = async function () {
    var url = '/api/events';
    var method = 'POST';
    if (route.name == 'edit-event') {
        url = url + '/' + event.value._id;
        method = 'PUT';
    }
    // submit the event to the backend
    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,

        },
        body: JSON.stringify(event.value)
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
}
// a function to get the event from the backend
const getEvent = async function () {
    // get the event from the backend
    const response = await fetch('/api/events/' + route.params.id);
    // convert the response to json
    const json = await response.json();
    // log the json
    console.log(json);
    // set the event, copy by value instead of reference
    event.value = { ...json };
    // Wait for the change to get flushed to the DOM
    await nextTick();

}

onMounted(async () => {
    // if there is an id in the route
    if (route.params.id) {
        getEvent();
        loadUser();

    }
    if ((userType.value == 'admin' && route.name == 'view-event') || route.name == 'edit-event') {
        getVolunteers()
    }
});
const deleteEvent = async function () {
    // post the event to the backend
    const response = await fetch('/api/events/' + event.value._id, {
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
    location.reload()
}
const exitEvent = async function (volID) {
    // post the Volunteer to the backend
    let params = [`eventID=${event.value._id}`, `volunteerID=${volID}`]
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
const getVolunteers = () => {

    let params = [`page=${page.value}`, `eventID=${route.params.id}`]

    params = params.join('&')
    loading.value = true
    fetch(`/api/volEvent?${params}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            }

        })
        .then((response) => response.json())
        .then((result) => {

            volunteers.value = result.volunteers
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
const onPageChange = (p) => {
    page.value = p;
    getVolunteers();
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
                            <RouterLink to="/events">Events</RouterLink>
                        </li>
                        <li class="breadcrumb-item active" aria-current="page" v-if="route.name == 'event-create'">New Event
                        </li>
                        <li class="breadcrumb-item active" aria-current="page" v-if="route.name == 'edit-event'">Edit Event
                        </li>
                        <li class="breadcrumb-item active" aria-current="page" v-if="route.name == 'view-event'">Event Title
                        </li>
                    </ol>
                </nav>
            </div>

            <form class="col-6 text-end" @submit.prevent="submitEvent" v-if="route.name == 'edit-event'">

                <button type="button" class="btn btn-danger" style="background-color: red;margin-top: 5px; "
                    v-on:click="deleteEvent">
                    Delete
                </button>
            </form>


        </div>

        <div class=".container" style="margin: 30px;" v-if="route.name != 'view-event'">

            <form class="row" @submit.prevent="submitEvent">
                <div class="col-lg-6 col-md-12">
                    <div class="mb-3">
                        <label for="exampleInputEmail1" class="form-label">Event Title</label>
                        <input type="text" class="form-control" id="event" aria-describedby="emailHelp" name="event"
                            v-model="event.event" required>
                    </div>
                    <div class="mb-3">
                        <label for="exampleInputPassword1" class="form-label">Organizer</label>
                        <input type="text" class="form-control" id="organiser" name="organiser" v-model="event.organiser"
                            required>
                    </div>
                    <div class="mb-3">
                        <label for="exampleInputName1" class="form-label">Datetime</label>
                        <input type="datetime-local" class="form-control" id="date" name="date" v-model="event.date"
                            required>
                    </div>
                    <div class="mb-3">
                        <label for="exampleInputContace1" class="form-label">Location</label>
                        <input type="text" class="form-control" id="location" name="location" v-model="event.location"
                            required>
                    </div>
                </div>



                <div class="col-lg-6 col-md-12">

                    <div class="mb-3">
                        <label for="exampleFormControlTextarea1" class="form-label">Description</label>
                        <textarea class="form-control" id="description" name="description" rows="5"
                            v-model="event.description"></textarea>
                    </div>

                    <div class="mb-3">
                        <label for="exampleInputContace1" class="form-label">Quota</label>
                        <input type="number" class="form-control" id="quota" name="quota" min="1" max="100"
                            v-model="event.quota" required>
                    </div>
                    <div class="mb-3">
                        <label for="exampleInputContace1" class="form-label">Image</label>
                        <input type="url" class="form-control" id="image" name="image" v-model="event.image" required>
                    </div>



                </div>
                <div class="mb-3 form-check">
                    <input type="checkbox" class="form-check-input" id="exampleCheck1" name="highlight"
                        v-model="event.highlight">
                    <label class="form-check-label" for="exampleCheck1">Highlight</label>
                </div>
                <div class="text-end">
                    <button type="submit" class="end-0 btn btn-primary ">Save</button>
                </div>
            </form>
        </div>


        <div class="row .container" style="margin: 30px;" v-if="route.name == 'view-event'">

            <div class="card col-lg-6 col-md-12" style="height: 800px;">

                <div class="card-body " style="flex-wrap: wrap;">
                    <h1 class="card-title">
                        {{ event.event }}
                    </h1>
                    <h3 class="card-title">
                        {{ event.organiser }}
                    </h3>


                    <p class="card-text">
                        {{ event.description }}
                    </p>

                    <div class="card">
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item">Date & Time: {{ event.date }}
                            </li>
                            <li class="list-group-item"> Location: {{ event.location }}
                            </li>
                            <li class="list-group-item">Quota: {{ event.quota }}
                            </li>
                        </ul>
                    </div>


                </div>
            </div>





            <div class=" col-lg-6 col-md-12 card " style="height: 800px;">
                <img :src="`${event.image}`" class="card-img-top" alt="..." style="object-fit:fill; height: 300px;">
                <div class="card-body" style="flex-wrap: wrap;" v-if="userType != 'admin'">
                    <h5 class="card-title">Become a volunteer</h5>
                    <p class="card-text">Your time and talent can make a real difference in people's lives</p>
                </div>
                <div class="card-body" style="flex-wrap: wrap;" v-if="userType == 'admin'">
                    <section>

                        <o-table :data="volunteers" :loading="loading" paginated backend-pagination :total="total"
                            :per-page="perPage" aria-next-label="Next page" aria-previous-label="Previous page"
                            aria-page-label="Page" aria-current-label="Current page" backend-sorting
                            :default-sort-direction="defaultSortOrder" :default-sort="[sortField, sortOrder]"
                            @page-change="onPageChange" @sort="onSort">

                            <o-table-column v-slot="props" field="volunteerID" label="Volunteer Name">
                                {{ props.row.volunteers[0].name }}
                            </o-table-column>

                            <o-table-column v-slot="props" field="volunteerID" label="Contact">
                                {{ props.row.volunteers[0].contact }}
                            </o-table-column>

                            <o-table-column v-slot="props" field="" label="Action">
                                <span class="tag">
                                    <button type="button" class="btn " style="background-color: gray;margin-top: 5px; "
                                        @click="$router.push('/volunteer/' + props.row.volunteers[0]._id)">
                                        Edit
                                    </button>
                                </span>
                                <span class="tag">
                                    <button type="button" class="btn  ms-2" style="background-color: red;margin-top: 5px; "
                                        @click="exitEvent(props.row.volunteers[0]._id)">
                                        X
                                    </button>
                                </span>
                            </o-table-column>

                        </o-table>
                    </section>
                </div>

            </div>

        </div>





    </main>
</template>

