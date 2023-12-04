<script setup>
import { ref, onMounted, watch } from "vue" // add watch
//import { ref, onMounted } from "vue";
import { jwtDecode } from "jwt-decode";


const data = ref([]);
const total = ref(0);
const loading = ref(false);
const sortField = ref("modifiedAt");
const sortOrder = ref("desc");
const defaultSortOrder = ref("desc");
const page = ref(1);
const perPage = ref(20);
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

const loadAsyncData = () => {
    const params = [
        //"api_key=bb6f51bef07465653c3e553d6ab161a8",
        //"language=en-US",
        //"include_adult=false",
        //"include_video=false",
        // `type=${vol.value}`,
        `email=${search.value}`,
        `sort_by=${sortField.value}.${sortOrder.value}`,
        `page=${page.value}`,
    ].join("&");
    loading.value = true;
    fetch(`/api/volunteers?${params}`, {
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
            // api.themoviedb.org manage max 1000 pages

            perPage.value = result.perPage;

            // if (result.total_results / perPage.value > 100)
            //     currentTotal = perPage.value * 100;

            total.value = result.total;
            data.value = result.volunteers
            // cap results for usability
            // if (data.value.length > 10) data.value = data.value.slice(0, 5);
            loading.value = false;
        })
        .catch((error) => {
            data.value = [];
            total.value = 0;
            loading.value = false;
            throw error;
        });

};

/*
 * Handle page-change event
 */
const onPageChange = (p) => {
    page.value = p;
    loadAsyncData();
};

/*
 * Handle sort event
 */
const onSort = (field, order) => {
    sortField.value = field;
    sortOrder.value = order;
    loadAsyncData();
};

/*
 * Type style in relation to the value
 */
const type = (value) => {
    const number = parseFloat(value);
    if (number < 6) {
        return "is-danger";
    } else if (number >= 6 && number < 8) {
        return "is-warning";
    } else if (number >= 8) {
        return "is-success";
    }
};

onMounted(() => {
    loadUser();

    loadAsyncData();

});

const search = ref("");

watch(() => search.value, () => {
    loadAsyncData();
});
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

                        <li class="breadcrumb-item active" aria-current="page">
                            Volunteers
                        </li>


                    </ol>
                </nav>
            </div>

            <form class="col-6 text-end" @submit.prevent="submitVolunteer">

                <button type="button" class="btn btn-danger" style="background-color: blue;margin-top: 5px; "
                    @click="$router.push('/volunteer')">
                    New
                </button>
            </form>


        </div>

        <section>

            <o-table :data="data" :loading="loading" paginated backend-pagination :total="total" :per-page="perPage"
                aria-next-label="Next page" aria-previous-label="Previous page" aria-page-label="Page"
                aria-current-label="Current page" backend-sorting :default-sort-direction="defaultSortOrder"
                :default-sort="[sortField, sortOrder]" @page-change="onPageChange" @sort="onSort">

                <o-table-column v-slot="props" field="name" label="Name">
                    {{ props.row.name }}
                </o-table-column>
                <o-table-column v-slot="props" field="email" label="Email">
                    <span class="tag" :class="type(props.row.vote_average)">
                        {{ props.row.email }}
                    </span>
                </o-table-column>
                <o-table-column v-slot="props" field="contact" label="Contact">
                    <span class="tag" :class="type(props.row.vote_average)">
                        {{ props.row.contact }}
                    </span>
                </o-table-column>
                <o-table-column v-slot="props" field="" label="Action">
                    <span class="tag" :class="type(props.row.vote_average)">
                        <button type="button" class="btn " style="background-color: gray;margin-top: 5px; "
                            @click="$router.push('/volunteer/' + props.row._id)">
                            Edit
                        </button>
                    </span>
                </o-table-column>

            </o-table>
        </section>





    </main>
</template>