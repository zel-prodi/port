<template>
    <div>
        <NavBar/>
        <v-toolbar dense flat>

            <v-spacer></v-spacer>

            <v-text-field
                outlined 
                dense
                v-model="search"
                append-icon="mdi-magnify"
                label="Search..."
                single-line
                hide-details
            ></v-text-field>

            <v-spacer></v-spacer>
            <v-btn @click="showRegisterCategory()" color="primary" rounded dense small><v-icon small>mdi-plus-circle</v-icon>New Rule Category</v-btn>
           
        </v-toolbar>

        <v-container fluid grid-list-lg>
            <v-data-table  
                dense
                :headers="categoryHeaders"
                :items="tsuutatsuCategoryData"
                :search="search"
                fill-height
                fixed-header
                height="400px"
                :loading="isLoading"
                style="border:1px solid grey;">

                <template v-slot:item.action="{ item }">

                    <v-btn small @click="showEditTsuutatsuCategoryDialog(item)" class="mr-2" icon>
                        <v-icon
                            small
                            color="primary"
                        >
                            mdi-pencil-outline
                        </v-icon>
                    </v-btn>

                    <v-btn small icon @click="deleteTsuutatsuCategory(item)">
                        <v-icon small color="red">
                            mdi-trash-can-outline
                        </v-icon> 
                    </v-btn>
                </template> 
            </v-data-table>
        </v-container>


        <!-- =================== DIALOGS ===================-->
        <v-row justify='center'>
            <v-dialog
                v-model="addNewCategoryDialog"
                scrollable 
                persistent :overlay="false"
                max-width="500"
                transition="dialog-transition"
                >
                    <v-card>
                        <v-card-title class="font-weight-light" primary-title>
                            {{categoryFormTitle}}
                            <v-spacer></v-spacer>
                            <v-btn icon @click="loadTsuutatsuCategory(), addNewCategoryDialog = false, toAdd = {}">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                           
                        </v-card-title>
                        <v-divider class="mr-3 ml-3"></v-divider>

                        <!-- {{toAdd}} -->
                        <v-container fluid>
                            <v-text-field
                                outlined
                                dense
                                v-model="toAdd.category_name"
                                label="Category Name"
                                @keyup.enter="saveNewCategory()"
                            ></v-text-field>

                            <v-btn @click="saveNewCategory()" block color="primary">Save Category</v-btn>
                        </v-container>
                    </v-card>
            </v-dialog>
        </v-row>
    </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import moment from 'moment';
import shortid from 'shortid';
export default {
    components: {
        NavBar
    },
    data(){
        return{
            isLoading: false,
            categoryHeaders: [
                {
                    text: 'Category Name',
                    align: 'left',
                    sortable: false,
                    value: 'category_name'
                },
                { text: 'Date Added', value: 'date_added', align: 'center'},
                { text: 'Actions', value: 'action', align: 'center'},
            ],
            search: '',
            addNewCategoryDialog: false,
            categoryFormTitle: '',
            toAdd: {},
            tsuutatsuCategoryData: [],
            categoryData:[],
            categoryToAdd:{}

        }
    },
    methods:{
        saveNewCategory(){
            if(this.categoryFormTitle === 'ADD NEW CATEGORY'){
                this.toAdd.category_type = "Tsuutatsu Rule";
                this.toAdd.date_added = moment().format('LLL');
                this.toAdd.added_by = this.userInfo.username;
                this.toAdd.category_id = shortid.generate();
             
                let url = `${this.aws}addNewTsuutatsuCategory`
                this.axios.post(url, this.toAdd).then(res => {
                this.$toast.success(' ',res.data, this.notificationSystem.options.success)

                    this.isLoading = false
                    this.toAdd = {}
                })
            }else{
                let editCategoryURL = `${this.aws}updateTsuutatsuCategory`
                console.log('HERE')
                console.log(this.toAdd)
                this.axios.post(editCategoryURL, this.toAdd).then(res => {
                    this.$toast.success(' ',res.data, this.notificationSystem.options.success)

                    this.loadTsuutatsuCategory()
                    this.isLoading = false
                    this.addNewCategoryDialog = false;
                    this.toAdd = {}
                }) 
            }
        },
        showRegisterCategory(){
            this.addNewCategoryDialog = true
            this.categoryFormTitle = 'ADD NEW CATEGORY'
        },
        deleteTsuutatsuCategory(item){
            let conf = confirm('DELETE this Category?')
            if(conf === true){
                let url = `${this.aws}deleteTsuutatsuCategory/${item.category_id}`
                this.axios.post(url, item).then(res => {
                    this.loadTsuutatsuCategory()
                    this.$toast.success(' ',res.data, this.notificationSystem.options.success)
                })
            }else{
                this.loadTsuutatsuCategory()
            }
        },
         loadTsuutatsuCategory() {
            let url = `${this.aws}getTsuutatsuCategory`
            this.axios.get(url).then(res => {
                this.tsuutatsuCategoryData = res.data.filter(rec => {
                    return rec.category_type === "Tsuutatsu Rule"
                })
            })
        },
        showEditTsuutatsuCategoryDialog(item){
            this.addNewCategoryDialog = true;
            this.categoryFormTitle = 'EDIT CATEGORY';
            this.toAdd = item;
        },

    },
    created(){
        this.loadTsuutatsuCategory()

        this.$store.commit('TITLE_PAGE', this.$router.currentRoute.name);
    }
}
</script>