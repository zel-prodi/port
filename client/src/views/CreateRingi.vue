<template>
    <div>
        <NavBar/>
        <v-toolbar dense flat>
            <v-col cols="2">
                <span class="subtitle">{{ $t('Date Created') }}:</span> <br>
            <h5>{{toAdd.date_created}}</h5>
            </v-col>

            <v-col cols="2">
                <span class="subtitle">{{ $t('Created By') }}:</span> <br>
                    <h5 >{{toAdd.created_by}}</h5>

            </v-col>

            <v-spacer></v-spacer>
            <v-btn @click="saveNewRingiRecord()" icon ><v-icon color="primary">mdi-check-outline</v-icon></v-btn>
            <v-divider vertical inset></v-divider>
            <v-btn @click="$router.push('RingiPage')" icon><v-icon color="error">mdi-close-outline</v-icon></v-btn>
        </v-toolbar>
        
        <div>
            <v-form class="pa-2" >
            
                <h5 class="subtitle ml-5">{{ $t('*Empty fields are prohibited.Use (-) instead.') }}</h5>
                <v-spacer></v-spacer>
                <v-row justify="end">
                    <v-col cols="3" style="margin:0px">
                        <v-menu v-model="receptionDateMenu" :close-on-content-click="false" max-width="290">
                            <template v-slot:activator="{ on }">
                                <v-text-field :value="computedDateForReceptionDate" :label="$t('Reception Date')" readonly hint="MM/DD/YYYY"
                                persistent-hint outlined dense v-on="on"></v-text-field>
                            </template>
                            <v-date-picker no-title v-model="receptionDate" @change="receptionDateMenu = false"></v-date-picker>
                        </v-menu>
                    </v-col>

                    <v-col cols="2" class="ma-0 pa-0" style="margin:0px">
                        <small>{{ $t('Managerial Seal') }}</small><br>
                        <v-img dense height="60" width="65" src="/seal.jpg" aspect-ratio="1" class="grey lighten-2 ml-4" v-model="toAdd.managerial_seal"></v-img>
                    </v-col>
                </v-row>
                
                <v-col cols="12">
                    <v-row>
                        <v-text-field class="mr-1" dense outlined :label="$t('Company Name')" v-model="toAdd.company_name"></v-text-field>
                        <v-text-field class="mr-1" dense outlined :label="$t('Contact TEL')" v-model="toAdd.contact_number"></v-text-field>
                        <v-text-field class="mr-1" dense outlined :label="$t('Sales Person Name')" v-model="toAdd.sales_representative"></v-text-field>
                    </v-row>

                    <v-row>
                        <v-text-field class="mr-1" dense outlined :label="$t('Caller Name')" v-model="toAdd.caller_name"></v-text-field>

                        <v-text-field class="mr-1" outlined dense :label="$t('Customer Code')" v-model="toAdd.document_id"></v-text-field>
                       
                        <v-text-field class="mr-1" dense outlined :label="$t('Customer Name')" v-model="toAdd.customer_name"></v-text-field>
                    </v-row>

                    <v-row>
                        <v-select class="mr-1" dense :items="houseType" :label="$t('House Type')" outlined v-model="toAdd.house_type"></v-select>

                        <v-menu v-model="orderDateMenu" :close-on-content-click="false" max-width="290">
                            <template v-slot:activator="{ on }">
                                <v-text-field  class="mr-1" :value="computedDateForOrderDate" :label="$t('Processing Request/Order Date')" readonly hint="MM/DD/YYYY"
                                persistent-hint outlined dense v-on="on"></v-text-field>
                            </template>
                            <v-date-picker no-title v-model="orderDate" @change="orderDateMenu = false"></v-date-picker>
                        </v-menu>

                        <v-menu v-model="upperBuildingDateMenu" :close-on-content-click="false" max-width="290">
                            <template v-slot:activator="{ on }">
                                <v-text-field  class="mr-1" :value="computedDateForUpperBuildingDate" :label="$t('Upper Building Day')" readonly hint="MM/DD/YYYY"
                                persistent-hint outlined dense v-on="on"></v-text-field>
                            </template>
                            <v-date-picker no-title v-model="upperBuildingDate" @change="upperBuildingDateMenu = false"></v-date-picker>
                        </v-menu>

                        <v-text-field dense outlined class="mr-1" :label="$t('Number of Messages Sent (including this vote)')" v-model="toAdd.number_of_outgoing_calls"></v-text-field>
                    
                    </v-row>

                    <small>{{ $t('Attachments')}}</small>
                    <v-row>
                        <v-checkbox v-model="attachments"  small class="mt-2 pa-0" rows v-for="(item, i) in selectOption" color="primary" :key="i" :label="item.JAtext" :value="item.JAtext"></v-checkbox>
                    </v-row>

                    <v-row>
                        <v-text-field dense outlined class="pa-0 ma-1" :label="$t('Deliberation Subject')" v-model="toAdd.subject"></v-text-field>  
                        <v-file-input :disabled="enabledFileAttachment" show-size counter outlined dense class="mt-1" :label="$t('Attachment')" v-model="uploadObject" @change="getFile()"/> 
                    </v-row>
                </v-col>
                <small>{{ $t('Content') }}:</small>
                <vue-editor id="editorHeight" v-model="toAdd.content"/>
            </v-form>
        </div>
    </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import {VueEditor} from "vue2-editor";
import moment from 'moment';

export default {
    components: {
        NavBar,
        VueEditor
    },
    data(){
        return{
            upperBuildingDateMenu: false,
            upperBuildingDate: '',
            orderDateMenu: false,
            orderDate: '',
            receptionDateMenu: false,
            receptionDate: '',
            toAdd: {},
            content:'',
            houseType:["夢の家","I-smart", "I-cube", "I-Smile"],
            attachments: [],
            selectOption:[
                {ENtext:"Plan View", JAtext: "平面図"},
                {ENtext:"Elevation", JAtext: "立面図"},
                {ENtext:"Layout Drawing", JAtext: "配置図"},
                {ENtext:"Other", JAtext: "その他"}
            ],
            HRDuserEmails: [],
            fileData:{}
        }
    },
    methods: {
        loadHRDuserEmail() {
            let company_group = 'HRD'
            let url = `${this.aws}getAllUserByCompanyGroup/${company_group}`

            this.axios.get(url).then(res => {
                this.HRDuserEmails = res.data.filter(rec => {
                    return rec.account_type === 'HRD Admin'
                }).map(rec => {
                    return rec.email
                })
                console.log('-------------HERE-----------------------');
                console.log(this.HRDuserEmails);
                console.log('------------------------------------');
            })
        },
        saveNewRingiRecord(){ 
            this.toAdd.document_type = 'Ringi';
            this.toAdd.document_status = 'For Approval';
            this.toAdd.date_created = moment().format('LLL');
            this.toAdd.created_by = this.userInfo.email;
            this.toAdd.is_sent_to_admin = false;
            this.toAdd.is_sent_to_hrd = false;
            this.toAdd.is_sent_to_gc = false;
            this.toAdd.is_original_file = true;

            this.toAdd.distributed_by = null;
            this.toAdd.date_distributed = null;

            this.toAdd.is_revised = false;
            this.toAdd.revised_by_email = null;
            this.toAdd.revised_by_username = null;
            this.toAdd.date_revised = null;

            this.toAdd.is_reviewed = false;
            this.toAdd.reviewed_by_email = null;
            this.toAdd.reviewed_by_username = null;
            this.toAdd.date_reviewed = null;

            this.toAdd.is_deleted = false;
            this.toAdd.date_deleted = null;
            this.toAdd.reception_date = this.receptionDate;
            this.toAdd.order_date = this.orderDate;
            this.toAdd.upper_building_date = this.upperBuildingDate;
            this.toAdd.attachments = this.attachments;

            this.toAdd.file_attachments = [];
            this.toAdd.file_attachments.push(this.fileData)

            this.toAdd.comments = [];

            let url = `${this.aws}addNewRecord`;
            this.axios.post(url, this.toAdd).then(() => {
                //CALL THE UPLOAD FILE FUNCTION
                this.uploadFile();
                
                this.$toast.success(' ','Ringi Successfully Created', this.notificationSystem.options.success);
                this.toAdd = {};
                this.toAdd.reception_date = '';
                this.toAdd.order_date = '';
                this.toAdd.upper_building_date = '';
                this.$router.push('RingiPage')
            })

        }
    },
    created() {
        this.$store.commit('TITLE_PAGE', this.$router.currentRoute.name);
        this.toAdd.date_created = moment().format('L');
        if(this.userInfo.email === '-'){
            this.toAdd.created_by = this.userInfo.username
        }else{
            this.toAdd.created_by = this.userInfo.email;
        }
        this.loadHRDuserEmail();

    },
    computed:{
        computedDateForReceptionDate () {
            return this.receptionDate ? moment(this.receptionDate).format('L') : ''
        },
        computedDateForUpperBuildingDate(){
            return this.upperBuildingDate ? moment(this.upperBuildingDate).format('L') : ''
        },
        computedDateForOrderDate(){
            return this.orderDate ? moment(this.orderDate).format('L') : ''
        }
    }
}
</script>

<style>
  #editorHeight {
    height: 290px;
  }
</style>