<template>
    <div>
        <NavBar/>
        <v-toolbar dense flat >

            <v-col cols="2">
                <span class="overline">{{$t('Circular Number')}}:</span> <br>
            <h5>{{docID}}</h5>
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
            <v-btn icon @click="saveNewTsuutatsuRecord()"><v-icon color="primary">mdi-check-outline</v-icon></v-btn>
            <v-divider vertical inset></v-divider>
            <v-btn @click="$router.push('TsuutatsuPage')" icon><v-icon color="error">mdi-close-outline</v-icon></v-btn>
            
        </v-toolbar>
        <v-container grid-list-xs fluid>

            <v-row class="ml-2">
                
                <v-btn  style="margin-right:5px;" @click="assignPersonInchargeDialog = true" class="mt-2" x-small rounded color="success">{{ $t('Person Incharge') }}</v-btn>
    
                <span class="caption mt-2" v-for="(item, i) in toAdd.person_incharge" :key="i" >
                    {{item.email}} - {{item.category}}
                    <v-btn @click="toAdd.person_incharge.splice(i,1)" small icon><v-icon small>mdi-close-circle</v-icon></v-btn>
                </span>
           
            </v-row>
           
            <v-row>
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
                     <span class="font-weight-light title" style="margin-left:5px;"> {{ $t('Assign Person Incharge') }}</span> 
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
                                :label="$t('Person Incharge')"
                            ></v-autocomplete>

                            <v-select
                                style="width:5%"
                                outlined
                                dense
                                :items="tsuutatsuCategory"
                                v-model="dataToPush.category"
                                :label="$t('Category')"
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

            // file: null,
            myData: [],
            

        }
    },
    created(){
        this.loadHRDuserEmail();
        this.loadTsuutatsuCategory();
        console.log(moment().format('LLL'))
        this.toAdd.outgoing_date = moment().format('L');
        this.setCircularNumber();
        this.$store.commit('TITLE_PAGE', this.$router.currentRoute.name);
    },
    methods:{
        // goToFile(){
        //     window.open('https://gc-dev-mode-bucket.s3.us-east-2.amazonaws.com/2432173910801938','_blank');
        // },
        saveNewTsuutatsuRecord(){
            // console.log(this.fileURL)
            this.toAdd.document_type = 'Tsuutatsu';
            this.toAdd.document_id = this.docID;

            this.toAdd.file_attachments = [];
            this.toAdd.file_attachments.push(this.fileData)
            
            this.toAdd.isDeleted = false;
            this.toAdd.isNew = true;
            this.toAdd.isSent = false;
            this.toAdd.sender_email = this.userInfo.email
            this.toAdd.sender_username = this.userInfo.username
            this.toAdd.confirmations = [];

            let url = `${this.aws}addNewRecord`
            this.axios.post(url, this.toAdd).then(res => {
                console.log(res.data)
                this.uploadFile();
                // alert('Tsuutatsu Successfully Created')
                let text = this.$t('Tsuutatsu Successfully Created')
                this.$toast.success(' ',text, this.notificationSystem.options.success)
                this.$router.push('TsuutatsuPage')
                // this.$store.commit('FILE_INFO', {})
                this.toAdd = {};
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
        setCircularNumber(){
            let docType = "Tsuutatsu"
            let url = `${this.aws}getDocumentID/${docType}`;
            this.axios.get(url).then(res => {
                this.docID = res.data
                this.toAdd.document_id = this.docID;

            })
            
            // let year = moment().format('YYYY')
            // this.axios.get(url).then(res => {

            // })
            // this.axios.get(url).then(res => {
            //     this.recArr = res.data
            //     //======= CIRCULAR NUMBER ======= //
            //     //assigning circular number
            //     let arrLength = this.recArr.length+1
            //     if(arrLength <= 9){
            //         this.toAdd.document_id = year +'-00'+ arrLength
            //     }else if(arrLength <= 99){
            //         this.toAdd.document_id = year +'-0'+ arrLength
            //     }else{
            //         this.toAdd.document_id = year +'-'+ arrLength
            //     }
            // });
        },
    }
}
</script>

<style>
  #editorHeight {
    height: 290px;
  }
</style>