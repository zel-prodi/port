<template>
    <div>
        <NavBar/>
        <v-toolbar color="grey lighten-5" flat >
            <v-text-field
                append-icon="mdi-magnify"
                class="mt-3 mr-3"
                outlined dense single-line
                :label="$t('Search Customer Code')"
                v-model="search"
            ></v-text-field>
            <v-select
                class="mt-3"
                dense flat outlined
                :items="docStatus"
                label="Document Status"
                v-model="selectedStatus"
            ></v-select>

            <v-spacer></v-spacer>

            <v-btn v-if="userInfo.account_type === 'GC Leader' || userInfo.account_type === 'GC Member'" @click="$router.push('CreateRingi')" class="mb-3" small rounded color="primary">
                <v-icon small class="mr-1">mdi-plus-circle-outline</v-icon> {{ $t('Create Approval') }}
            </v-btn>

        </v-toolbar>
        <v-divider></v-divider>

        <v-data-table
            :headers="computedHeaders"
            :items="computedRingiFiles"
            height="515px" dense
            fixed-header scrollable class="elevation-5" :search="search"
        >
            <template v-slot:item.actions="{ item }">
                <template>
                    <v-tooltip top>
                        <template v-slot:activator="{ on }">
                            <v-btn @click="viewRingiFullInformation(item)" icon class="mr-1" v-on="on" color="green darken-4">
                                <v-icon>
                                    mdi-file-eye-outline
                                </v-icon>
                            </v-btn>
                        </template>
                        <span>{{ $t('View Details') }}</span>
                    </v-tooltip>
                    
                    <template>
                        <v-tooltip top>
                            <template v-slot:activator="{ on }">
                                <v-btn :disabled="userInfo.account_type === 'Admin' && item.document_status === 'For Approval' 
                                    || userInfo.account_type === 'Admin' && item.document_status === 'For HRD Review' 
                                    || userInfo.account_type === 'GC Leader' && item.document_status === 'For Approval' ? false : true" 
                                        @click="editRingi(item)" icon class="mr-1" v-on="on" color="primary">
                                    <v-icon>
                                        mdi-pencil-outline
                                    </v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('Edit') }}</span>
                        </v-tooltip>

                        <v-tooltip top>
                            <template v-slot:activator="{ on }">
                                <v-btn :disabled="userInfo.account_type === 'Admin' && item.document_status === 'For Approval' 
                                    || userInfo.account_type === 'Admin' && item.document_status === 'For HRD Review'
                                    || userInfo.account_type === 'GC Leader' && item.document_status === 'For Approval' ? false : true"
                                     @click="deleteRingi(item)" icon class="mr-1" v-on="on" color="red darken-4">
                                    <v-icon>
                                        mdi-trash-can-outline
                                    </v-icon>
                                </v-btn>
                            </template>
                            <span>{{ $t('Delete')}}</span>
                        </v-tooltip>
                    </template>
                    
                    <template v-if="item.is_sent_to_gc === false || userInfo.account_type === 'GC Leader'">
                        <v-tooltip top>
                            <template v-slot:activator="{ on }">
                                <v-btn :disabled="disableSendFunction"
                                  @click="sendRingi(item)" x-small outlined rounded class="mr-1" v-on="on" color="primary">
                                    <v-icon small>
                                        mdi-send
                                    </v-icon>{{ $t('Send')}}
                                </v-btn>
                            </template>
                            <span>{{ $t('Send')}}</span>
                        </v-tooltip>
                    </template>

                    <template>
                        <v-tooltip top>
                            <template v-slot:activator="{ on }">
                                <v-btn :hidden="userInfo.account_type === 'HRD Admin' && item.is_sent_to_gc === false
                                || userInfo.account_type === 'GC Leader' && selectedStatus === 'For Approval' || selectedStatus === 'Sent Ringi'
                                || userInfo.account_type === 'HRD User' && selectedStatus === 'For HRD Review' || selectedStatus === 'Reviewed Ringi' " disabled x-small outlined rounded class="mr-1" v-on="on" color="primary">
                                    <v-icon small>
                                        mdi-check
                                    </v-icon>{{ $t('Sent')}}
                                </v-btn>
                            </template>
                            <span>{{ $t('Sent')}}</span>
                        </v-tooltip>
                    </template>
                </template>

            </template>
        </v-data-table>

        <!-- DIALOG -->

        <!-- SELECT RECIPIENT DIALOG -->
        <v-dialog v-model="selectRecipientDialog" scrollable max-width="800px">
            <v-card>
                <v-card-title>{{ $t('Select Recipient') }}
                    <v-spacer></v-spacer>
                    
                    <v-btn icon @click="selectedRecipient = [], selectRecipientDialog = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                
                </v-card-title>
                <v-divider></v-divider>
                <v-text-field single-line append-icon="mdi-magnify" class="ma-2" style="width:50%" outlined dense v-model="recipientToSearch" :label="$t(`Search Recipient's First/Last Name`)"></v-text-field>

                <v-card-text>
                    <v-data-table
                        v-model="selectedRecipient"
                        :headers="recipientHeaders"
                        :items="computedHRDUsers"
                        :single-select="singleSelect"
                        item-key="first_name"
                        show-select
                        class="elevation-1"
                        dense
                    >
                        <template v-slot:top>
                            <v-switch v-model="singleSelect" label="Single select" class="pa-3"></v-switch>
                        </template>
                    </v-data-table>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" text @click="$store.commit('FILE_INFO', {}), selectedRecipient = [], selectRecipientDialog = false">
                        {{ $t('Cancel') }}
                    </v-btn>

                    <v-btn color="blue darken-1" text @click="distributeRingi()">
                        <v-icon small>mdi-send</v-icon>
                        &nbsp;{{ $t('Send') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        
    </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';
import moment from 'moment';
export default {
    components:{
        NavBar
    },
    data(){
        return{
            tab: null,
            RingiTab: [
                'RingiTab.For Approval', 'RingiTab.For HRD Review', 'RingiTab.For Revision', 'RingiTab.Revised Ringi',
            ],
            ringiHeaders: [
                { text: 'Customer Code', value: 'document_id', align: 'left' },
                { text: 'Status', align: 'left', value: 'document_status',sortable: false },
                { text: 'Creation Date', value: 'date_created', align: 'left' },
                { text: 'Subject', value: 'subject',align: 'center', sortable: false },
                { text: 'Actions', align: 'center', value: 'actions', sortable: false }
            ],
            search:'',
            ringiFiles: [],
            filteredRingiFiles: [],
            revRingi: [],
            currentItem: 'tab-ForApproval',
            selectRecipientDialog: false,
            recipientHeaders: [
                { text: 'First Name', value: 'first_name' },
                { text: 'Last Name', value: 'last_name'},
                { text: 'Company Group', value: 'company_group'},
                { text: 'Email', value: 'email' },
            ],
            selectedRecipient: [],
            recipientToSearch: '',
            HRDUsers: [],
            HRDuserEmails: [],
            singleSelect:true,
            toUpdate: {},

            // docStatus: ["For Approval", "For HRD Review", "For Revision", "Revised Ringi"],
            docStatus: [],
            selectedStatus: '',
            forApprovalCount:[]

        }

    },
    methods:{
        sendRingi(item){    
            if(this.userInfo.account_type === 'GC Leader' && item.document_status === 'For Approval'){
                // auto sending of ringi to hrd admin
                let toUpdate = item;
                toUpdate.is_sent_to_admin = true;
                            
                let url = `${this.aws}updateRecord`;
                this.axios.put(url, toUpdate).then(() => {
                    this.emailOptions.recipient = this.HRDUsers.filter(rec => {
                        return rec.account_type === "HRD Admin";
                    }).map(rec => {
                        return rec.email
                    }).toString();

                    this.emailOptions.subject = `${this.gcPortalSubject} ${toUpdate.document_type} ${toUpdate.document_id}`
                    this.emailOptions.body = `You have For Distribution Ringi File Added by ${this.userInfo.email} 
                    <br><br> 
                        <p>${this.gcPortalLink}</p>
                        <b>Thank You.<b/>
                    </p>`
                    this.$toast.success(' ','Ringi File Sent', this.notificationSystem.options.success);
                    this.sendEmailNotif()
                })

            }else if(this.userInfo.account_type === 'HRD Admin' && item.document_status === 'For Approval'){
                //send to hrduser as for hrd review
                this.selectRecipientDialog = true;
                this.$store.commit('FILE_INFO', item)//send to gc as revised ringi

            }else if(this.userInfo.account_type === 'HRD Admin' && item.document_status === 'For Revision'){
                alert('Please Revise this Ringi File First');

            }else if(this.userInfo.account_type === 'HRD Admin' && item.document_status === 'Revised Ringi'){
                let toUpdate = item;
                toUpdate.is_sent_to_gc = true;
                toUpdate.is_sent_to_admin = false;
                toUpdate.is_sent_to_hrd = false;
                
                let url = `${this.aws}updateRecord`;
                this.axios.put(url, toUpdate).then(() => {

                    this.emailOptions.recipient = toUpdate.created_by
                    this.emailOptions.subject = `${this.gcPortalSubject} ${toUpdate.document_type} ${toUpdate.document_id}`
                    this.emailOptions.body = `New Revised Ringi Added by ${this.userInfo.email} 
                    <br><br> 
                        <p>${this.gcPortalLink}</p>
                        <b>Thank You.<b/>
                    </p>`
                    this.$toast.success(' ','Ringi File Sent', this.notificationSystem.options.success);
                    this.sendEmailNotif()
                })

            }else if(this.userInfo.account_type === 'HRD User' && item.document_status === 'For HRD Review'){
                if(item.comments.length < 1){
                    alert('Please write a comment first');
                }else{
                    //send to admin as for revision
                    let toUpdate = item;
                    toUpdate.document_status = "For Revision";
                    toUpdate.is_reviewed = true;
                    toUpdate.file_attachments = []
                    toUpdate.file_attachments.push(this.fileData)
                    


                    // email function
                    this.emailOptions.recipient = item.distributed_by;
                    this.emailOptions.subject = `${this.gcPortalSubject} ${toUpdate.document_type} ${toUpdate.document_id}`
                    this.emailOptions.body = `You have For Revision Ringi File Added by ${this.userInfo.email} 
                    <br><br> 
                        <p>${this.gcPortalLink}</p>
                        <b>Thank You.<b/>
                    </p>`

                    let url = `${this.aws}updateRecord`;
                    this.axios.put(url, toUpdate).then(res => {
                        this.uploadFile();
                        this.sendEmailNotif();
                        this.$toast.success(' ',res.data, this.notificationSystem.options.success);
                        
                    })
                }
            }
        },
        //METHOD FOR UPDATING THE document_status AND ASSIGNING THE EMAIL OPTIONS OF HRD JA's
        distributeRingi(){

        // if(this.emailOptions.recipient != undefined){
            let toUpdate = this.fileInfo
            toUpdate.distributed_by = this.userInfo.email;
            toUpdate.date_distributed = moment().format('L');
            toUpdate.document_status = "For HRD Review";
            // toUpdate.recipients = this.emailOptions.recipient;
            toUpdate.recipients = this.selectedRecipient;
            this.emailOptions.subject = `${this.gcPortalSubject} ${toUpdate.document_type} ${toUpdate.document_id}`


            console.log(this.emailOptions.recipient)
            let url = `${this.aws}updateRecord`;
            this.axios.put(url, toUpdate).then(() => {
            //EMAIL NOTIF
            // IF THE RECIPIENTS IS UNDEFINED, THEN IT WILL RETURN AN ERROR MESSAGE. OTHERWISE THE RINGI FILE WILL BE SENT TO HRD JA's.
            // EMAIL NOTIFICATION
            this.emailOptions.recipient = this.selectedRecipient.map(rec=> {
                return rec.email
            }).toString();

            //ASIGNING EMAIL OPTIONS
            // this.emailOptions.sender = this.userInfo.email;
            this.emailOptions.body = `
            You have For Review Ringi File Added by ${this.userInfo.email} 
            <br><br> 
                <p>${this.gcPortalLink}</p>
                <b>Thank You.<b/>
            </p>`
            this.sendEmailNotif()
            this.$toast.success(' ','Ringi File Sent', this.notificationSystem.options.success);
            this.$router.push('RingiPage');
            this.$store.commit('FILE_INFO', this.fileInfo);
            this.selectRecipientDialog = false;
            this.selectedRecipient = [];
            })

        // }else{
        //     this.$toast.error(' ','No Recipient Selected', this.notificationSystem.options.error)
        // }
            
        },
        deleteRingi(item){
            console.log(item)

        },
        editRingi(item){
            console.log(item)
            if(this.userInfo.account_type === 'GC Leader' && item.document_status === 'For Approval'){
                this.$store.commit('FILE_INFO', item);
                this.$router.push('EditRingiPage')
            }else{
                console.log(item)
            }
           


        },

        // =============UNFINISHED==============
        deleteRevisedRingi(item){
            let conf = confirm('Delete this Revised Ringi?');
            if(conf === true){
                let toUpdate = item;
                toUpdate.is_deleted = true;
                toUpdate.deleted_by = this.userInfo.email;
                toUpdate.date_deleted = moment().format('L');
                let url = `${this.aws}updateRecord`;
                this.axios.put(url, toUpdate).then(() => {
                    this.$toast.success(' ', 'Revised Ringi File Deleted', this.notificationSystem.success);
                })
                
            }
            
        },
        editRevisedRingi(item){
            this.$store.commit('FILE_INFO', item)
            this.$router.push('EditRevisedRingiPage');
            console.log(item)
        },
        deleteRingiRecord(item){
            let conf = confirm('DELETE this record?');
            if(conf === true){
                let toDelete = item
                toDelete.is_deleted = true
                toDelete.deleted_by = this.userInfo.email;
                toDelete.date_deleteed = moment().format('L');
                let url = `${this.aws}updateRecord`;
                this.axios.put(url, toDelete).then(() => {
                // alert('Record Deleted');
                this.$toast.success(' ','Record Deleted', this.notificationSystem.options.success)
                    this.loadRingiFiles()
                })
            }else{
                this.loadRingiFiles()
            }
        },
         viewRingiFullInformation(item){
            this.$store.commit('FILE_INFO', item);
            this.$router.push('RingiFullInformation');
        },
        loadRingiFiles(){
            let docType = 'Ringi'
            let url = `${this.aws}getAllRecords/${docType}`;
            
            this.axios.get(url).then(res => {
                this.ringiFiles = res.data.filter(rec => {
                    return rec.is_deleted === false
                })

            })
        },
        loadHRDUsers(){
            let company_group = 'HRD';
            let url =  `${this.aws}getAllUserByCompanyGroup/${company_group}`;

            this.axios.get(url).then(res => {
                this.HRDUsers = res.data;
                this.HRDuserEmails = res.data.map(rec => {
                    return rec.email
                })
            })
        },
    },
    created(){
        if(this.userInfo.accountType === 'GC Leader'){
            this.$store.commit('TITLE_PAGE', 'Approval Page');

        }else{
            this.$store.commit('TITLE_PAGE', this.$router.currentRoute.name);
        }
        this.loadRingiFiles();
        this.loadHRDUsers();

        if(this.userInfo.account_type === "HRD Admin"){
            this.docStatus = ["For Approval", "For HRD Review", "For Revision", "Revised Ringi"];
            this.selectedStatus = 'For Approval';
        }else if(this.userInfo.account_type === "HRD User"){
            this.docStatus = ["For HRD Review","Reviewed Ringi"];
            this.selectedStatus = 'For HRD Review';
        }else{
            this.docStatus = ["For Approval","Revised Ringi","Sent Ringi"];
            this.selectedStatus = 'For Approval';
        }   
        
    },
    computed: {
        computedHeaders(){
            if(this.selectedStatus === "Revised Ringi"){
                return [
                    { text: 'Customer Code', value: 'customer_code', align: 'left' },
                    { text: 'Creation Date', value: 'date_created', align: 'left' },
                    { text: 'Status', align: 'left', value: 'document_status',sortable: false },
                    { text: 'Subject', value: 'subject',align: 'center', sortable: false },
                    { text: 'Actions', align: 'center', value: 'actions', sortable: false }
                ]
            }else if(this.selectedStatus === "Reviewed Ringi"){
                return [
                    { text: 'Customer Code', value: 'document_id', align: 'left' },
                    { text: 'Creation Date', value: 'date_created', align: 'left' },
                    { text: 'Subject', value: 'subject',align: 'center', sortable: false },
                    { text: 'Actions', align: 'center', value: 'actions', sortable: false }
                ]
            }else if(this.selectedStatus === "Sent Ringi"){
                return [
                    { text: 'Customer Code', value: 'document_id', align: 'left' },
                    { text: 'Creation Date', value: 'date_created', align: 'left' },
                    { text: 'Subject', value: 'subject',align: 'center', sortable: false },
                    { text: 'Actions', align: 'center', value: 'actions', sortable: false }
                ]
            }else{
                return [
                    { text: 'Customer Code', value: 'document_id', align: 'left' },
                    { text: 'Status', align: 'left', value: 'document_status',sortable: false },
                    { text: 'Creation Date', value: 'date_created', align: 'left' },
                    { text: 'Subject', value: 'subject',align: 'center', sortable: false },
                    { text: 'Actions', align: 'center', value: 'actions', sortable: false }
                ]
            }
        },  
        disableSendFunction(){
            if(this.userInfo.account_type === 'GC Leader' && this.selectedStatus === 'For Approval' || this.selectedStatus === 'Revised Ringi' || this.userInfo.account_type === 'HRD Admin' && this.selectedStatus === 'For Approval' ||
                this.selectedStatus === 'For Revision' || this.selectedStatus === 'Revised Ringi'
                || this.userInfo.account_type === 'HRD User' && this.selectedStatus === 'For HRD Review' 
                ){
                return false
            }else{
                return true
            }
        },
        computedHRDUsers(){
            return this.HRDUsers.filter(rec => {
                return rec.first_name.toLowerCase().includes(this.recipientToSearch.toLowerCase()) || rec.last_name.toLowerCase().includes(this.recipientToSearch.toLowerCase())
            })
        },
        computedRingiFiles(){
            if(this.userInfo.account_type === "GC Leader"){
                if(this.selectedStatus === "Sent Ringi"){
                    return this.ringiFiles.filter(rec => {
                        return rec.is_deleted === false && rec.created_by === this.userInfo.email && rec.document_status != 'Revised Ringi' && rec.document_status != 'For Approval' || rec.is_sent_to_admin === true;
                    })
                }else if(this.selectedStatus === "For Approval"){
                    return this.ringiFiles.filter(rec => {
                        return rec.document_status === this.selectedStatus && rec.is_deleted === false && rec.is_sent_to_admin === false && rec.created_by === this.userInfo.email;
                    })
                }else if(this.selectedStatus === 'Revised Ringi'){
                    return this.ringiFiles.filter(rec => {
                        return rec.document_status === this.selectedStatus && rec.is_deleted === false && rec.is_sent_to_gc === true && rec.created_by === this.userInfo.email;
                    })
                }else{
                    return []
                }
            }else if(this.userInfo.account_type === 'HRD Admin' && this.selectedStatus === "For Approval"){
                return this.ringiFiles.filter(rec => {
                    return rec.document_status === this.selectedStatus && rec.is_deleted === false && rec.is_sent_to_admin === true;
                })

            }else if(this.userInfo.account_type === 'HRD Admin' && this.selectedStatus === "For HRD Review"){
                return this.ringiFiles.filter(rec => {
                    return rec.is_deleted === false && rec.document_status === this.selectedStatus;
                })
            }else if(this.userInfo.account_type === 'HRD Admin' && this.selectedStatus === "For Revision"){
                return this.ringiFiles.filter(rec => {
                    return rec.is_deleted === false && rec.document_status === 'For Revision';
                })

            }else if(this.userInfo.account_type === 'HRD Admin' && this.selectedStatus === "Revised Ringi"){
                return this.ringiFiles.filter(rec => {
                    return rec.is_deleted === false && rec.document_status === this.selectedStatus;
                })
            
            }else if(this.userInfo.account_type === "HRD User"){
                if(this.selectedStatus === "Reviewed Ringi"){
                    return this.ringiFiles.filter(rec => {
                        return rec.document_status != 'Revised Ringi' && rec.is_reviewed === true && rec.is_deleted === false && rec.reviewed_by_email === this.userInfo.email;
                    })
                }else if(this.selectedStatus === "For HRD Review"){
                    return this.ringiFiles.filter(rec => {
                        return rec.document_status === "For HRD Review"
                    })
                }else{
                    return this.ringiFiles.filter(rec => {
                        return rec.document_status === this.selectedStatus && rec.is_deleted === false && rec.reviewed_by_email === this.userInfo.email;
                    })
                }
            }
            else{
                return []
            }
            
        }

    },
}
</script>