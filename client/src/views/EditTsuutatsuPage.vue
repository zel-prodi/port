<template>
    <div>
        <NavBar/>
        <v-toolbar dense flat >

            <v-col cols="2">
                <span class="overline">{{ $t('Circular Number') }}:</span> <br>
            <h5>{{toAdd.document_id}}</h5>
            </v-col>

            <v-col cols="2">
                <span class="overline">{{ $t('Outgoing Date') }}:</span> <br>
            <h5>{{toAdd.outgoing_date}}</h5>
            </v-col>

            <v-col cols="3">
                <span class="overline">{{ $t('Sender') }}:</span> <br>
            <h5>{{userInfo.email}}</h5>
            </v-col>

            <v-col class="mt-10" cols="3">
                <span class="overline">{{ $t('Original Number') }}:</span> <br>
                <v-text-field
                    class="ml-0"
                    dense outlined single-line
                    v-model="toAdd.original_number" 
                ></v-text-field>
            </v-col>
            
            <!-- <span>{{outgoingDate}}</span> -->
            <v-spacer></v-spacer>
            <v-btn icon @click="updateTsuutatsuRecord()"><v-icon color="primary">mdi-check-outline</v-icon></v-btn>
            <v-divider vertical inset></v-divider>
            <v-btn @click="$router.push('TsuutatsuPage'), $store.commit('FILE_INFO', {})" icon><v-icon color="error">mdi-close-outline</v-icon></v-btn>
            
        </v-toolbar>
        
        <v-container grid-list-xs fluid>

            <v-row class="ml-2">
                
                <v-btn  style="margin-right:3px" @click="assignPersonInchargeDialog = true" class="mt-2" x-small rounded color="success">{{ $t('Person Incharge') }}</v-btn>
    
                <span class="caption mt-1" v-for="(item, i) in toAdd.person_incharge" :key="i" >
                    {{item.email}} - {{item.category}}
                    <v-btn @click="toAdd.person_incharge.splice(i,1)" small icon><v-icon small>mdi-close-circle</v-icon></v-btn>
                </span> 
           
            </v-row><br>
           
            <v-row class="ma-1" justify="center">
                <v-text-field
                    class="ma-1"
                    :label="$t('Subject')"
                    dense outlined
                    v-model="toAdd.subject"
                ></v-text-field>

                <v-file-input :disabled="enabledFileAttachment" show-size counter outlined dense class="mt-1" label="File Attachment" v-model="uploadObject" @change="getFile()"/> 
            </v-row>

            <vue-editor id="editorHeight" v-model="toAdd.content"/>
          
        </v-container>

        <!-- DIALOGS -->
        <v-dialog
            v-model="assignPersonInchargeDialog" 
            persistent :overlay="false"
            max-width="50%"
            transition="dialog-transition">
            
            <v-card>
                <v-toolbar flat dense>
                    <span class="font-weight-light title" style="margin-left:5px;">Assign Person Incharge</span> 
                    <v-spacer></v-spacer>
                        <template>
                            <v-btn @click="assignPersonIncharge()" icon color="success"><v-icon>mdi-check-outline</v-icon></v-btn>
                            <v-divider
                                class="mx-2"
                                vertical
                                inset
                            ></v-divider>
                        </template>
                    <v-btn color="red" icon @click="assignPersonInchargeDialog = false"><v-icon medium>mdi-close-outline</v-icon></v-btn>
                    
                </v-toolbar>
                <v-divider></v-divider>
                <v-container fluid grid-list-xs>
                    <v-card-text>
                        <v-row>
                            <v-autocomplete
                                class="mr-3"
                                v-model="dataToPush.email"
                                :items="HRDuserEmails"
                                outlined
                                dense
                                label="Person Incharge"
                            ></v-autocomplete>

                            <v-select
                                style="width:5%"
                                outlined
                                dense
                                :items="tsuutatsuCategory"
                                v-model="dataToPush.category"
                                label="Category"
                            ></v-select>
                        </v-row>
                    </v-card-text>
                </v-container>
            </v-card>
        </v-dialog>
   

        
    </div>
</template>

<script>
import {VueEditor} from "vue2-editor";
import NavBar from '@/components/NavBar.vue'
import moment from 'moment';
import shortid from 'shortid';

export default {
    components: {
        VueEditor ,
        NavBar
    },
    data(){
        return{
            content: "<h1>Some initial content</h1>",
            toAdd: {person_incharge:[]},
            assignPersonInchargeDialog: false,
            dataToPush: {},
            recArr: [],
            docID: '',
            HRDuserEmails: [],
            tsuutatsuCategory: [],
        }
    },
    created(){
        this.loadHRDuserEmail();
        this.loadTsuutatsuCategory();
        console.log(moment().format('LLL'))
        
        this.$store.commit('TITLE_PAGE', this.$router.currentRoute.name);
        this.toAdd = this.fileInfo

    },
    methods:{
        getFile(event){
            this.input = event.target;
            this.fileToUpload = this.input.files[0];

            ////Getting the file type of a file
            this.fileExtension = this.fileToUpload.type.split('/')[1]
            ////Complete path/url of a file
            this.fileURL = `${this.url}.${this.fileExtension}`;

            this.fileData.file_id = shortid.generate();
            this.fileData.filename = this.fileToUpload.name;
            this.fileData.date_added = moment().format('L');
            this.fileData.file_path = this.fileURL;
            this.fileData.uploaded_by = this.userInfo.email;
        },
        updateTsuutatsuRecord(){
            let url = `${this.aws}updateRecord`
            this.toAdd.document_type = 'Tsuutatsu'
            this.axios.put(url, this.toAdd).then(res => {
                console.log(res.data)
                this.uploadFile();
                this.$toast.success(' ', res.data, this.notificationSystem.options.success)
                this.toAdd = {};
                this.$router.push('TsuutatsuPage')
            })
        },
        assignPersonIncharge(){
            this.toAdd.person_incharge.push(this.dataToPush)
            this.dataToPush = {}
        },
        loadHRDuserEmail() {
            let company_group = 'HRD'
            let url = `${this.aws}getAllUserByCompanyGroup/${company_group}`

            this.axios.get(url).then(res => {
                this.HRDuserEmails = res.data.map(rec => {
                    return rec.email
                })
            })
        },
        loadTsuutatsuCategory() {
            let url = `${this.aws}getTsuutatsuCategory`
            this.axios.get(url).then(res => {
                this.tsuutatsuCategory = res.data.map(rec => {
                        return rec.category_name
                    })
                    //FOR LOADING CATEGORY ON CATEGORY MASTER SETTING PAGE
                this.tsuutatsuCategoryData = res.data
            })
        },
        
    }
}
</script>

<style>
  #editorHeight {
    height: 290px;
  }
</style>